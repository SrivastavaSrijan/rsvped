# RSVP'd — Architecture & Patterns

A technical guide to the design decisions, patterns, and posture of the RSVP'd codebase.

---

## Table of Contents

- [Progressive RSC Streaming](#progressive-rsc-streaming)
- [Data Gateway: getAPI()](#data-gateway-getapi)
- [Server Actions + Error Code Architecture](#server-actions--error-code-architecture)
- [Async Data Patterns](#async-data-patterns)
- [Stir Search — Parallel NLP + Keyword Scoring](#stir-search--parallel-nlp--keyword-scoring)
- [Routing — Declarative Auth + Parallel Slots](#routing--declarative-auth--parallel-slots)
- [Component Composition — Core vs Enhanced Type Guards](#component-composition--core-vs-enhanced-type-guards)
- [Pagination System](#pagination-system)
- [tRPC Error Factories](#trpc-error-factories)
- [Design System — Token-Only, No Config](#design-system--token-only-no-config)
- [Auth System](#auth-system)
- [Recommendations Engine](#recommendations-engine)
- [AI Integration — Graceful Degradation](#ai-integration--graceful-degradation)
- [Image Handling](#image-handling)
- [Form Reset Prevention](#form-reset-prevention)
- [Copy Pattern](#copy-pattern)
- [Seed Pipeline](#seed-pipeline)
- [Providers & Layout](#providers--layout)
- [Posture Summary](#posture-summary)

---

## Progressive RSC Streaming

Every data-heavy page has a two-phase render:

- **Phase 1**: RSC page fetches lightweight "core" data (title, date, slug, counts) and renders instantly.
- **Phase 2**: An async RSC inside `<Suspense>` fetches "enhanced" data (RSVPs, collaborators, metadata, recommendations) and streams in.

The key insight: **the Suspense fallback IS the same component** rendered with core data. No separate skeleton files — the component itself decides what to show based on whether enhanced fields are present.

```tsx
// ProgressiveEventPage.tsx
export const ProgressiveEventPage = ({ coreEvent }: Props) => (
  <Suspense fallback={<EventPage {...coreEvent} />}>
    <EnhancedEventPage slug={coreEvent.slug} />
  </Suspense>
)

// EnhancedEventPage — async RSC fetches full data
const EnhancedEventPage = async ({ slug }: { slug: string }) => {
  const api = await getAPI()
  const event = await api.event.get.enhanced({ slug })
  const similar = await api.user.recommendations.similar({ eventId: event.id, limit: 3 })
  return (
    <EventPage {...event}>
      <SimilarEvents data={similar} />
    </EventPage>
  )
}
```

For lists, the same pattern applies — core events render as `EventCard` skeletons, then enhanced data replaces them:

```tsx
// ProgressiveEventsList.tsx
<Suspense
  fallback={data.map((event) => (
    <EventCard key={event.slug} {...event} />
  ))}
>
  <EnhancedEventsList params={params} />
</Suspense>
```

Components use type guards to branch between core and enhanced modes:

```tsx
const isEnhancedEventData = (data: EventCardData): data is EnhancedEventData =>
  'metadata' in data && data.metadata !== undefined

// Renders skeleton or real content depending on data shape
const rsvps = hasEnhancedData ? props.rsvps : undefined
if (!rsvps) return <RsvpSkeleton />
```

Zero layout shift. The user sees real content immediately, then richer content fades in.

**Files**: `app/(main)/events/components/Progressive*.tsx`, `ProgressiveCommunitiesList.tsx`, `ProgressiveManageEventCard.tsx`

---

## Data Gateway: getAPI()

All server-side code accesses data through one function:

```tsx
const api = await getAPI()
const events = await api.event.list.core(params)
```

`getAPI()` creates a tRPC caller with the current request's session context. This means:

- **No raw Prisma imports** in pages, layouts, or actions — everything goes through tRPC procedures
- **Auth middleware runs automatically** — `protectedProcedure` checks session, `publicProcedure` skips it
- **Type-safe end-to-end** — `RouterOutput` and `RouterInput` types flow from router definitions to component props
- **Works everywhere** — RSC pages, server actions, `generateMetadata`, loading functions

```tsx
// server/api/index.ts
export async function getAPI() {
  const ctx = await createTRPCContext()
  return createCaller(ctx)
}

// server/api/trpc.ts — context reads session
export const createTRPCContext = async () => {
  let session: Session | null = null
  try {
    headers()
    session = await auth()
  } catch {
    session = null  // Outside request context (module scope imports)
  }
  return createInnerTRPCContext({ session })
}
```

The try/catch handles edge cases where `headers()` isn't available (e.g., module-level imports).

**Files**: `server/api/index.ts`, `server/api/trpc.ts`, `server/api/root.ts`

---

## Server Actions + Error Code Architecture

Mutations flow through a three-layer system that separates business logic from user-facing messages:

### Layer 1: Error Code Enums

```tsx
// server/actions/types.ts
export enum EventErrorCodes {
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CREATION_FAILED = 'CREATION_FAILED',
  NOT_FOUND = 'NOT_FOUND',
}
```

### Layer 2: Error Code Maps

```tsx
// server/actions/constants.ts
export const EventActionErrorCodeMap: Record<EventErrorCodes, string> = {
  [EventErrorCodes.VALIDATION_ERROR]: 'Please fix the errors in the form.',
  [EventErrorCodes.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [EventErrorCodes.CREATION_FAILED]: 'Failed to create the event. Please try again.',
  [EventErrorCodes.NOT_FOUND]: 'Event not found.',
}
```

TypeScript enforces exhaustiveness — every code must have a message.

### Layer 3: Server Action + Client Hook

```tsx
// server/actions/events.ts
export async function saveEvent(
  _: EventActionResponse | null,
  formData: FormData
): Promise<EventActionResponse> {
  const validation = eventSchema.safeParse(transformedData)
  if (!validation.success) {
    return { success: false, error: EventErrorCodes.VALIDATION_ERROR,
             fieldErrors: validation.error.flatten().fieldErrors }
  }
  let event
  try {
    const api = await getAPI()
    event = await api.event.create(createData)
  } catch (error) {
    if (error.code === 'UNAUTHORIZED')
      return { success: false, error: EventErrorCodes.UNAUTHORIZED }
    return { success: false, error: EventErrorCodes.CREATION_FAILED }
  }
  // CRITICAL: redirect outside try/catch — Next.js throws internally
  redirect(Routes.Main.Events.ManageBySlug(event.slug))
}
```

```tsx
// Component — one hook handles form state + error rendering
const { formAction, isPending, errorComponent } = useActionStateWithError({
  action: saveEvent,
  initialState: null,
  errorCodeMap: EventActionErrorCodeMap,
  displayMode: 'inline', // or 'toast'
})
```

`useActionStateWithError` wraps `useActionState` and produces an `errorComponent` that maps the returned error code to the user-facing message. Components never handle errors directly.

**Files**: `server/actions/events.ts`, `server/actions/types.ts`, `server/actions/constants.ts`, `lib/hooks/useActionStateWithError.tsx`

---

## Async Data Patterns

The codebase has **zero client-side network calls** — no `fetch()`, no `axios`, no `trpc.useQuery()`, no `.then()`.

### Page Data: RSC Streaming

All page data is fetched server-side via `getAPI()` and passed as props. Progressive loading uses `<Suspense>` with async RSCs (see [Progressive RSC Streaming](#progressive-rsc-streaming)).

### User-Initiated Fetches: useTransition + Server Actions

For data that loads on user interaction (hover, click), server actions are called inside `startTransition`:

```tsx
const [isPending, startTransition] = useTransition()
const [data, setData] = useState<HoverData | null>(null)

const handleMouseEnter = () => {
  if (data || isPending) return
  startTransition(async () => {
    const result = await getUserHoverCardAction(user.id)
    setData(result)
  })
}
```

`useTransition` provides `isPending` for free — no manual loading state.

### Debounced Input: Async IIFE in useEffect

When a useEffect is justified (debounced search autocomplete), use an async IIFE with a cancellation flag:

```tsx
useEffect(() => {
  let cancelled = false
  const fetchSuggestions = async () => {
    const results = await getAutocompleteAction(debouncedQuery)
    if (!cancelled) setSuggestions(results)
  }
  fetchSuggestions()
  return () => { cancelled = true }
}, [debouncedQuery])
```

### Never

- `.then()` — always `async/await`
- `trpc.*.useQuery()` or `trpc.*.useMutation()` — always `getAPI()` in RSCs or server actions
- `fetch()` / `axios` / `useSWR` — always server-side through `getAPI()`

---

## Stir Search — Parallel NLP + Keyword Scoring

Search fires **two queries in parallel** via `Promise.allSettled`:

1. **Keyword search** — Prisma `contains` with stop word filtering (100+ words), AND semantics across terms
2. **LLM interpretation** — Claude Haiku parses natural language ("tech meetups this weekend") into a structured `InterpretedQuery` with date ranges, categories, and location hints

```tsx
const [keywordResult, interpreted] = await Promise.allSettled([
  Promise.all([
    ctx.prisma.event.findMany({ where: createEventSearchWhere(query) }),
    ctx.prisma.event.count({ where: keywordWhere }),
  ]),
  interpretSearchQuery(query),  // LLM with 3s timeout
])
```

Results merge into a scored, deduplicated list:

- **Keyword results** scored by title/description match position and recency
- **LLM results** get a +200 `AI_ENHANCED_BONUS` score boost
- **Deduplication**: a Map keyed by event ID keeps the higher-scoring version
- **Category inference**: a static `CATEGORY_KEYWORD_MAP` maps terms like "food", "dining" to the `Food & Drinks` category

If the LLM fails or times out, keyword results stand alone — zero degradation.

```tsx
// interpret.ts — timeout safety
const result = await Promise.race([
  generate(rawQuery, systemPrompt, InterpretedQuerySchema, 'search-interpret'),
  new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
])
```

**Files**: `server/api/routers/stir/search.ts`, `stir/helpers.ts`, `stir/interpret.ts`

---

## Routing — Declarative Auth + Parallel Slots

### Route Config

A typed `Routes` object with getters and functions prevents hardcoded paths:

```tsx
Routes.Main.Events.ViewBySlug(slug)      // '/events/{slug}/view'
Routes.Main.Communities.ViewBySlug(slug)  // '/communities/{slug}/view'
Routes.Auth.SignIn                        // '/login'
```

### Declarative Auth

`RouteDefs.Protected` and `RouteDefs.Public` arrays declare which routes need auth. Middleware iterates these with `matchPathSegments()` — one place to understand the entire auth posture:

```tsx
const isProtectedRoute = RouteDefs.Protected.some((route) =>
  matchPathSegments(pathname, route)
)
if (isProtectedRoute && !isLoggedIn) {
  return NextResponse.redirect(new URL(`${Routes.Auth.SignIn}?next=${encodedNext}`, nextUrl))
}
```

### Route Groups

| Group | Purpose | Auth | Component Type |
|-------|---------|------|----------------|
| `(auth)/` | Login, register, profile | Public (redirects if logged in) | Client + Server |
| `(main)/` | Events, communities, categories | Protected (middleware) | Mixed |
| `(static)/` | Landing, pricing, legal | Public | RSC only |
| `(dev)/` | Component playground | Dev only | Mixed |

### Parallel Routes

Stir search uses `@events` and `@communities` slots that render as RSCs in parallel, toggled via URL params through `StirSlotSwitch` — no refetching on tab switch:

```tsx
// app/(main)/stir/layout.tsx
export default async function StirLayout({ events, communities }: StirLayoutProps) {
  return (
    <StirSlotSwitch
      events={<Suspense>{events}</Suspense>}
      communities={<Suspense>{communities}</Suspense>}
    />
  )
}
```

**Files**: `lib/config/routes.ts`, `lib/auth/config.ts`, `middleware.ts`, `app/(main)/stir/layout.tsx`

---

## Component Composition — Core vs Enhanced Type Guards

Components accept a union type of core and enhanced data and branch with type guards:

```tsx
type EventCardData = CoreEventData | EnhancedEventData

const isEnhancedEventData = (data: EventCardData): data is EnhancedEventData =>
  'metadata' in data && data.metadata !== undefined

export const EventCard = (props: EventCardProps) => {
  const hasEnhancedData = isEnhancedEventData(props)
  const canManage = hasEnhancedData ? props.metadata.user.access.manager : undefined
  const rsvps = hasEnhancedData ? props.rsvps : undefined

  // Renders skeleton or real content depending on data shape
  if (!rsvps) return <RsvpSkeleton />
  return <RsvpList rsvps={rsvps} />
}
```

This enables a single component to serve as both the Suspense fallback (with core data) and the final view (with enhanced data). No separate skeleton components needed.

**Files**: `app/(main)/events/components/EventCard.tsx`, `EventPage.tsx`

---

## Pagination System

Pagination is a reusable tRPC middleware, not per-route boilerplate:

```tsx
// Procedure merges PaginationSchema into input, injects ctx.pagination
export const paginatedProcedure = publicProcedure
  .input(PaginationSchema)
  .use(async ({ input, next }) => {
    const { page, size } = input
    return next({
      ctx: {
        pagination: {
          skip: (page - 1) * size,
          take: size,
          createMetadata: (total: number) => ({
            page, size, total,
            totalPages: Math.ceil(total / size),
            hasMore: page * size < total,
            hasPrevious: page > 1,
          }),
        },
      },
    })
  })
```

Routers consume it naturally:

```tsx
const [items, total] = await Promise.all([
  ctx.prisma.event.findMany({ skip: ctx.pagination.skip, take: ctx.pagination.take }),
  ctx.prisma.event.count(),
])
return { data: items, pagination: ctx.pagination.createMetadata(total) }
```

`GenericPagination` renders ShadCN Pagination and syncs page state to URL search params.

**Files**: `server/api/shared/middleware.ts`, `server/api/shared/schemas.ts`, `app/(main)/components/GenericPagination.tsx`

---

## tRPC Error Factories

All errors go through factory functions — no raw `TRPCError` construction:

```tsx
// server/api/shared/errors.ts
TRPCErrors.eventNotFound()       // NOT_FOUND
TRPCErrors.unauthorized()        // UNAUTHORIZED
TRPCErrors.forbidden()           // FORBIDDEN
TRPCErrors.alreadyMember()       // CONFLICT
TRPCErrors.eventFull()           // BAD_REQUEST
TRPCErrors.internal()            // INTERNAL_SERVER_ERROR
```

Mutation error handling follows a strict pattern — re-throw known TRPCErrors, wrap unknown ones:

```tsx
catch (error) {
  if (error instanceof TRPCError) throw error  // re-throw known errors
  throw TRPCErrors.eventCreateFailed()          // wrap unknown errors
}
```

The tRPC error formatter attaches flattened `zodError` to the response shape when Zod validation fails.

**Files**: `server/api/shared/errors.ts`, `server/api/trpc.ts`

---

## Design System — Token-Only, No Config

One CSS file (`app/theme.css`) with a `@theme static` block defines everything:

- **Color families**: cranberry, barney (purple), blue — each with 5 shades
- **Semantic tokens**: brand, error, success, warning, mapped to color families
- **Translucent variants**: `brand-pale-bg`, `brand-faint-bg` for subtle backgrounds
- **Layout**: `max-w-page` (820px), `max-w-wide-page` (960px)
- **Spacing, radii, fonts**: all in the same block

Tailwind v4 reads CSS vars directly — **no `tailwind.config.ts`**. `globals.css` has three imports and minimal `@layer base` resets. Dark mode is a `.dark` class override.

All components use only semantic utilities: `bg-brand`, `text-muted-foreground`, `border-border`. ShadCN components are barrel-exported from `components/ui/index.ts`.

**Files**: `app/theme.css`, `app/globals.css`, `components/ui/index.ts`

---

## Auth System

NextAuth v5 with two providers:

- **Google OAuth** — standard OIDC flow
- **Credentials** — email/password with bcrypt hashing

Session strategy is **JWT-based**. The `jwt` callback populates `role`, `isDemo`, and `username` from the database on initial sign-in and on `trigger === 'update'` (profile edits). The `session` callback hydrates the session object with these fields for client consumption.

The middleware config (`lib/auth/config.ts`) splits into a lightweight edge-compatible config (no providers, just auth checks) used by Next.js middleware, and a full config with providers used by the auth handler.

**Files**: `lib/auth/index.ts`, `lib/auth/config.ts`, `lib/auth/types.ts`

---

## Recommendations Engine

Two recommendation strategies with weighted scoring:

### Personalized Events

For logged-in users with category interests:
- **45%** category overlap (intersection of user interests and event categories)
- **30%** popularity (log-normalized RSVP + view counts)
- **25%** recency (newer events score higher)

For new users with no interests, falls back to sorting by `rsvpCount` and `viewCount`.

### Similar Events

Finds events sharing the same location or categories as a given event, ordered by popularity. Both strategies return events with a `reason` field explaining the match.

**Files**: `server/api/routers/user/recommendations.ts`

---

## AI Integration — Graceful Degradation

`lib/ai/llm.ts` wraps Vercel AI SDK (Anthropic Claude) with safety at every layer:

- **`isAvailable()`** — checks for API key, returns `null` if not configured
- **`LLMError`** — custom error class with operation context and retriability flag
- **`generate()`** — structured output via `generateText` + `Output.object` with Zod schema
- **`generatePlainText()`** — free-form text generation for summaries
- **Timeout safety** — callers use `Promise.race()` with 3s timeout

Used sparingly for high-value operations:
- Search interpretation (natural language → structured query)
- Event summary generation (search results → 1-2 sentence synthesis)
- Seed data generation (realistic community/event names via Batch API)

**Files**: `lib/ai/llm.ts`, `server/api/routers/stir/interpret.ts`

---

## Stir AI Agent — Conversational Event Discovery

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Client                                                      │
│                                                              │
│  StirChatProvider (app/providers.tsx)                         │
│    ├─ useChatRuntime() → shared AssistantRuntime             │
│    ├─ localStorage persistence (stir-messages)               │
│    └─ Consumed by both:                                      │
│        ├─ StirChat.tsx  (full /stir page)                    │
│        └─ StirFAB.tsx   (floating overlay on all pages)      │
│                                                              │
│  usePageContext() — reads Routes config, injects context      │
│    ├─ eventSlug from /events/[slug]                          │
│    ├─ communitySlug from /communities/[slug]                 │
│    └─ general, feed, stir-home, user-profile                 │
│                                                              │
│  Thread.tsx (@assistant-ui/react)                             │
│    ├─ HtmlText (dangerouslySetInnerHTML — model outputs HTML)│
│    ├─ ToolFallback (shows tool display name + completion)    │
│    ├─ Dynamic follow-up suggestions (fetched from Haiku)     │
│    └─ ErrorIndicator, ThinkingIndicator                      │
└──────────────────────┬───────────────────────────────────────┘
                       │ POST /api/ai/stir
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  API Route (app/api/ai/stir/route.ts)                        │
│    ├─ isAvailable() → 503 if no API key                      │
│    ├─ auth() → userId                                        │
│    ├─ Rate limiting (RATE_LIMIT: 20 auth / 5 anon per hour)  │
│    ├─ Input validation (messages array, AGENT_CONFIG limits)  │
│    └─ try/catch → 500 with error message                     │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Agent Core (lib/ai/agent/stir-agent.ts)                     │
│                                                              │
│  1. buildSystemPrompt()                                      │
│     ├─ Base personality + tool instructions (constants.ts)   │
│     ├─ Page context enrichment (Prisma lookup for event/     │
│     │   community data if slug provided)                     │
│     └─ User profile enrichment (interests, categories,       │
│         recent RSVPs — with try/catch fallback)              │
│                                                              │
│  2. classifyIntent() (classifier.ts)                         │
│     ├─ Short-circuit: single-word → intent map (no LLM)     │
│     ├─ LLM: generateText + Output.object via Haiku (fast)   │
│     └─ 3s timeout → fallback to 'general'                   │
│                                                              │
│  3. Tool scoping                                             │
│     ├─ INTENT_TOOL_MAP[intent] → active tool subset          │
│     └─ Anonymous filter (remove user-context tools)          │
│                                                              │
│  4. streamText() via Sonnet (quality)                        │
│     ├─ smoothStream() transform                              │
│     ├─ stepCountIs(AGENT_CONFIG.maxSteps)                    │
│     └─ onStepFinish/onFinish → structured logging            │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Tools (lib/ai/agent/tools/) — 10 Prisma-backed tools        │
│                                                              │
│  Base:             User Context:     Graph Traversal:        │
│  ├─ searchEvents   ├─ getUserProfile ├─ getFriendsAttending  │
│  ├─ searchComm.    ├─ getUserRsvps   │   (3-hop via peers)  │
│  ├─ getEventDet.   └─ getUserComm.   ├─ getTrending         │
│  └─ getCategories                    │   (community-scoped) │
│                                      └─ getSimilarEvents    │
│                                          (category overlap)  │
└──────────────────────────────────────────────────────────────┘
```

### Tiered Model Strategy

| Tier | Model | Use Case | Latency |
|------|-------|----------|---------|
| `fast` | Claude Haiku 4.5 | Intent classification, follow-up suggestions | ~300ms |
| `quality` | Claude Sonnet 4 | Main conversation stream, tool orchestration | ~1-3s |

All model IDs live in `MODEL_OPTIONS` constant — single place to update during migrations.

### Code Organization

| Concern | File | Contents |
|---------|------|----------|
| Types + Schemas | `types.ts` | Interfaces, Zod schemas (`intentSchema`, `suggestionsSchema`), `INTENTS` enum |
| Constants | `constants.ts` | `MODEL_OPTIONS`, `AGENT_CONFIG`, `CLASSIFIER_CONFIG`, `RATE_LIMIT`, system prompts, tool maps |
| LLM Wrapper | `lib/ai/llm.ts` | `getModel(tier)`, `generate()`, error handling — imports `MODEL_OPTIONS` |
| Classifier | `classifier.ts` | `classifyIntent()` — imports schema + config from central files |
| Agent | `stir-agent.ts` | `createStirStream()` — orchestrates prompt → classify → scope → stream |
| Page Context | `page-context.ts` | `usePageContext()` — uses `Routes` from `@/lib/config` (single source of truth) |
| Tools | `tools/*.ts` | Prisma queries with inline `inputSchema` (AI SDK convention) |

### Intent Router

| Intent | Trigger Examples | Active Tools |
|--------|-----------------|--------------|
| `search` | "tech meetups this weekend" | searchEvents, searchCommunities, getCategories, getEventDetails |
| `recommend` | "what should I go to?" | searchEvents, getUserProfile, getUserRsvps, getUserCommunities, getTrending, getCategories |
| `detail` | "tell me about TechCon" | getEventDetails, getFriendsAttending, getSimilarEvents, searchEvents |
| `compare` | "compare TechCon and DevConf" | getEventDetails, searchEvents, getFriendsAttending, getSimilarEvents |
| `general` | "how does RSVP'd work?" | searchEvents, searchCommunities, getEventDetails, getCategories |

Short-circuit patterns (`SHORT_CIRCUIT_PATTERNS`) skip the LLM classifier for common single-word queries.

**Files**: `lib/ai/agent/`, `components/assistant-ui/thread.tsx`, `components/shared/StirChatProvider.tsx`, `components/shared/StirFAB.tsx`

---

## Image Handling

A custom `Image` component wraps Next.js `Image` with:

- **Responsive breakpoints** via an object-based `sizes` prop that converts to CSS media queries
- **Skeleton loader** during the `fill="true"` loading phase
- **Unsplash integration** — `server/api/routers/image.ts` fetches random images from Unsplash collections, falling back to Picsum.photos if no API key

**Files**: `components/ui/image.tsx`, `server/api/routers/image.ts`

---

## Form Reset Prevention

`components/shared/Form.tsx` exists to prevent React 19's automatic form reset on successful server action submissions. It intercepts the native `reset` event with `preventDefault()`, avoiding the triple flash of skeleton → opacity-0 → opacity-100 that occurs when React clears and re-renders form state.

```tsx
// Always use Form from @/components/shared, not native <form>
import { Form } from '@/components/shared'

<Form action={formAction}>
  <Input name="title" defaultValue={event?.title} />
  <Button type="submit" disabled={isPending}>Save</Button>
</Form>
```

**Files**: `components/shared/Form.tsx`

---

## Copy Pattern

All UI strings live in colocated `copy.ts` files — no inline hardcoded text (except aria-labels):

```tsx
// app/(main)/copy.ts
export const copy = {
  nav: { logo: "RSVP'd", createEvent: 'Create Event' },
  home: { title: 'Events' },
  stir: {
    title: "Let's Stir Things Up!",
    description: 'Discover events and communities...',
    chipExamples: ['tech meetups this weekend', 'free events near me'],
  },
}
```

Hierarchical objects, typed keys, easy to find and update. Makes future i18n trivial.

**Files**: `app/(main)/copy.ts`, `app/(static)/copy.ts`, `app/(auth)/copy.ts`

---

## Seed Pipeline

A multi-stage checkpoint/resume pipeline:

1. **Wipe DB** (optional)
2. **Load static data** — categories, locations from JSON files in VCS
3. **Create users** — with Faker, optional LLM for realistic profiles
4. **Create communities** — LLM generates names/descriptions via Batch API, Faker fallback
5. **Create events** — matched to communities intelligently
6. **Create RSVPs, friendships, activities**

Pipeline state persists to `pipeline-state.json` — can resume from stage N+1 after failure. Images fetched from Unsplash once, cached and reused.

**Files**: `prisma/seed/seed.ts`, `prisma/seed/creators/`, `prisma/seed/data/`

---

## Providers & Layout

Root layout wraps children with `<Providers>`:

- **TRPCProvider** — React Query client + tRPC httpBatchLink (superjson transformer)
- **ProgressProvider** — page transition progress bar (@bprogress/next)
- **Toaster** — Sonner toast notifications, globally available

Layout also loads Google Fonts (Inter + Averia Serif Libre) and includes structured JSON-LD schema for SEO.

Route group layouts add group-specific chrome:
- `(main)/layout.tsx` — nav bar, profile dropdown
- `(static)/layout.tsx` — marketing nav, footer

**Files**: `app/providers.tsx`, `app/layout.tsx`, `app/(main)/layout.tsx`

---

## Posture Summary

| Aspect | Approach |
|---|---|
| **Rendering** | RSC-first, progressive streaming, `'use client'` only at leaf interactivity |
| **Data fetching** | `getAPI()` everywhere, zero client-side network calls, `RouterOutput` types end-to-end |
| **Mutations** | Server actions with typed error codes, `useActionStateWithError` hook |
| **Async** | `async/await` only (no `.then()`), `useTransition` for user-initiated fetches |
| **Auth** | Declarative route lists, JWT sessions, middleware enforcement |
| **Styling** | Token-only CSS, single theme file, ShadCN barrel, no tailwind.config |
| **Search** | Parallel keyword + NLP, scored merge, graceful LLM degradation |
| **AI** | Tiered models (Haiku fast / Sonnet quality), intent classification, 10 Prisma-backed tools, shared chat provider, structured logging |
| **Forms** | Reset-prevention wrapper, Zod validation, error code maps |
| **Copy** | Colocated, typed, hierarchical — no inline strings |
| **Seeding** | Resumable pipeline, LLM + Faker fallback, Batch API |
| **React 19** | No useMemo/useCallback/React.memo (Compiler handles it), no gratuitous useRef/useEffect |
