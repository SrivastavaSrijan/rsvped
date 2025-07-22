# RSVP'd – Copilot Coding Guidelines (v0.4)

> **Scope**: Implementation details only. Feature discussions live elsewhere.

---

## 1 ▪ Stack & Architecture

| Layer       | Tech Stack                                   | Notes                                                                  |
| ----------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| Runtime     | **Node ≥ 20.x** (LTS)                        | Required by Next 15 & Prisma 6.                                        |
| Framework   | Next.js 15 (App Router + React 19 ✓ RSC)     | Uses `--turbopack` for dev mode.                                       |
| Styling     | Tailwind CSS v4 (tokens via `@theme`)        | Never edit `tailwind.config.*` – tokens come from `app/theme.css`.    |
| UI Kit      | ShadCN UI + Radix primitives                 | Import via `@/components/ui` barrel exports.                           |
| DB          | Prisma 6 → PostgreSQL                        | Client accessed via tRPC context only.                                 |
| API         | tRPC 11 + TanStack Query 5                   | `superjson` transformer; no direct API routes.                         |
| Auth        | NextAuth v5 (beta)                           | Basic setup in place, no providers configured yet.                     |
| Lint/Format | **Biome** (eslint+prettier replacement)      | All commits pass `biome check --write .`.                              |
| CI          | Vercel Platform                              | Auto-deploy with `vercel:build` script.                                |

---

## 1.1 ▪ Data Flow & API Pattern

**Critical**: This app uses tRPC for all data operations - NO direct API routes.

### Server-Side Data (RSC)
```ts
// For React Server Components, use the server API helper
import { getAPI } from '@/server/api'

const api = await getAPI()
const events = await api.event.list()
```

### Client-Side Data (Components)
```ts
// Import from lib/trpc, not direct tRPC client
import { trpc } from '@/lib/trpc'

function EventList() {
  const { data } = trpc.event.list.useQuery()
  return <div>{/* render */}</div>
}
```

### Mutations via Server Actions
All mutations must be handled by Server Actions, which then call the tRPC API. This centralizes data validation and error handling.

```ts
// server/actions/events.ts
'use server'
import { getAPI } from '@/server/api'
import { createEventSchema } from './schemas' // Zod schema

export async function createEvent(prevState, formData) {
  const validation = createEventSchema.safeParse(...)
  // ... handle validation errors
  const api = await getAPI()
  return api.event.create(validation.data)
}
```

---

## 2 ▪ Theming & Styling

| File                   | Purpose                                               | **Non‑negotiable Rules**                                                                                                                |
| ---------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `app/theme.css`        | Single `@theme { … }` block – **all** design tokens.  | • No other selectors.<br>• Alphabetical order.<br>• Token names follow `--color-…`, `--font-…`, `--radius-…` etc.<br>• No `!important`. |
| `app/globals.css`      | Imports Tailwind + tokens, and minimal `@layer base`. | ```css<br>@import "tailwindcss";<br>@import "./theme.css";<br>```<br>• Only global resets / selection colour.                           |

> **Two files only**. Any new global style requires PR discussion.

### Usage

- **Use mapped Tailwind utilities ONLY**. The `@theme` directive in `theme.css` maps all CSS variables to Tailwind classes (e.g., `--color-border` becomes `border-border`).
- **Never use `var(...)` directly in classNames**. This is an anti-pattern.
- Use two responsive breakpoints: `sm` (640px) & `lg` (1024px). No custom media queries. 
- For padding/spacing/margins, use Tailwind's `px-4 lg:px-8` etc. This way, mobile‑first design is preserved.

---

## 3 ▪ Directory Layout

```text
app/
  (dev)/               # Component playground & mocks - use /dev/components-preview
  (main)/              # Authenticated user flows (when auth is implemented)
    components/        # Components specific to the (main) layout/group
  (static)/            # Marketing & legal pages (RSC only)
    layout.tsx         # Specific layout for static pages
    components/        # Static page components (Navbar, Footer, Hero)
  globals.css          # Tailwind imports + global resets
  theme.css            # Design tokens only (@theme block)
components/
  ui/                  # ShadCN wrappers with barrel export (index.ts)
lib/
  config/routes.ts     # Centralized route map 
  auth.ts              # NextAuth helpers
  hooks/               # Custom hooks, e.g., useActionStateWithError
  trpc/                # tRPC client setup (provider.tsx, trpc.ts)
server/
  actions/             # Server actions ("use server")
    index.ts           # Barrel export for all actions & types
    types.ts           # Shared action types (ServerActionResponse, error enums)
    constants.ts       # Error code to message maps
  api/
    routers/           # tRPC routers (event.ts, rsvp.ts)
    root.ts            # Main router + createCaller export
    trpc.ts            # Context creation
```

> **Colocation**: Non‑reusable components live next to their route. Reusable shareables live in `components/`.

---

## 4 ▪ Data Layer & React Server Components

### 4.1 Server Components (RSC)

- Use `getAPI` helper for clean server-side data fetching:

  ```ts
  // app/(main)/events/[id]/page.tsx (RSC)
  import { getAPI } from '@/server/api'

  export default async function EventPage({ params }) {
    const api = await getAPI()
    const event = await api.event.byId({ id: params.id })
    return <EventView event={event} />
  }
  ```
- **NEVER** call `await fetch('/api/trpc')` from RSC – use server API helper for type‑safety.

### 4.2 Client Components

- Use tRPC hooks from `@/lib/trpc`:

  ```ts
  import { trpc } from '@/lib/trpc'
  
  const { data } = trpc.event.byId.useQuery({ id })
  ```
- Hydration handled by `<TRPCProvider>` in `app/layout.tsx`.

---

## 5 ▪ Server Actions

All form submissions and mutations must use the following server action pattern, which mirrors the `authAction` implementation.

1.  **Define Schema**: Create a Zod schema for form data validation in the action file.
2.  **Define Action**: Create the server action function. It must:
    -   Start with `"use server"`.
    -   Accept `(prevState, formData)`.
    -   Use `schema.safeParse()` to validate. Return a `ServerActionResponse` with `fieldErrors` on failure.
    -   Call the tRPC API via `getAPI()`.
    -   Wrap the API call in a `try...catch` block to handle server errors, returning a `ServerActionResponse` with an error code.
    -   On success, `redirect()` to the appropriate route.
3.  **Export State & Types**: Export the action, an `initialState` object, and related types from the action file.
4.  **Use Hook in Client**: In the client component, use the `useActionStateWithError` hook to manage state, errors, and pending status.

- Example:

  ```tsx
  // app/(main)/components/CreateEventForm.tsx
  'use client'
  import { useActionStateWithError } from '@/lib/hooks'
  import { createEvent, EventActionErrorCodeMap } from '@/server/actions'

  const initialCreateEventState = {
    fieldErrors: {},
    isPending: false,
    errorCode: null,
  }
  export function CreateEventForm() {
    const { formAction, errorComponent, isPending } = useActionStateWithError({
      action: createEvent,
      initialState: initialCreateEventState,
      errorCodeMap: EventActionErrorCodeMap,
    })

    return <form action={formAction}>{/* ... inputs and errorComponent ... */}</form>
  }
  ```

---

## 6 ▪ Auth Layers

| Context                 | How to Access                                       | Notes                                      |
| ----------------------- | --------------------------------------------------- | ------------------------------------------ |
| **RSC / Server Action** | `const session = await auth();`                     | Throws if invalid when scope = `required`. |
| **Client Components**   | `useSession()` from `next-auth/react`               | Provides reactive session.                 |
| **tRPC Context**        | `getServerSession()` inside `server/api/context.ts` | Injects `ctx.session` & `ctx.user`.        |

- Use **Route Handlers** in `/app/api/auth/[...nextauth]/route.ts` only – no pages.
- Public vs protected routes declared in **middleware.ts** – redirect unauth users.
- Roles: `user`, `organizer`, `admin` typed via Zod & checked inside routers.

---

## 7 ▪ Naming, Imports & Organisation

### 7.1 Files & Folders

| Kind                             | Case                                  | Example                   |
| -------------------------------- | ------------------------------------- | ------------------------- |
| React component (reusable)       | **PascalCase**                        | `EventCard.tsx`           |
| Route‑local comp                 | **PascalCase**                        | `CreateEventForm.tsx`     |
| UI primitives (ShadCN re‑export) | **kebab‑case** inside `components/ui` | `button.tsx`, `input.tsx` |
| Utility                          | **camelCase**                         | `formatDate.ts`           |
| Barrel                           | `index.ts`                            | re‑export only – no logic |

> **No `../../..`**: always import via path alias (`@/lib`, `@/components/ui`).

### 7.2 Routes Map

```ts
// lib/config/routes.ts
export const Routes = {
  Home: '/',
  Explore: '/explore',
  Pricing: '/pricing',
} as const;
export type Route = typeof Routes[keyof typeof Routes];
```

- Use `Routes.Home` etc. in `next/link`.

---

## 8 ▪ Copy & i18n

> Keep text near usage, but centralise per‑page.

- Each marketing/static page may export **`copy.ts`** alongside `page.tsx`.
- Structure:

  ```ts
  // app/(static)/copy.ts
  export const copy = {
    hero: {
      title: 'Simple transparent pricing',
      subtitle: 'Only pay when you host paid events.',
    },
    faqs: [...],
  } as const;
  ```
- Components import from that file – this keeps translations easy (`copy.es.ts`, `copy.fr.ts`, …).
- **No inline hard‑coded strings** except aria‑labels.

---

## 9 ▪ Dev Workflow

| Task              | Command                           | Notes                               |
| ----------------- | --------------------------------- | ----------------------------------- |
| Start dev         | `yarn dev`                        | Uses Turbopack                      |
| Type check        | `yarn lint:check`                 | Biome type checking                 |
| Lint / format     | `yarn lint`                       | Auto-fix with `--write`            |
| DB operations     | `yarn db:push/migrate/seed`       | Prisma commands                     |
| Component preview | Visit `/dev/components-preview`   | Live component playground           |

---

## 10 ▪ Golden Rules

1. **Type‑safe, token‑driven, ShadCN‑based** – or rethink.
2. If a value isn't a token → stop.
3. If a call bypasses tRPC/Prisma context → stop.
4. If you need another global CSS file → open a proposal first.

---

## 11 ▪ Essential Patterns & Anti-Patterns

### ✅ Do This
- **Import paths**: Always use `@/` aliases, never relative imports
- **Routes**: Use `Routes.Home` from `lib/config/routes.ts`  
- **Data fetching**: tRPC only (server actions for mutations, hooks for client queries)
- **Styling**: Use mapped Tailwind utilities ONLY (e.g., `border-border`, `bg-secondary`).
- **Components**: Barrel exports from `components/ui/index.ts`
- **Server Actions**: Follow the authAction pattern for all mutations.
- **Naming Conventions**: Try to be smart with names.
  - Bad - `EventCardWithShareActions`, Good - `EventCard` with `ShareEventActions` as a child component.
  - Bad - `eventUrl`, `eventName`, `eventDate`, Good - `url`, `title`, `startDate` - the context is clear.
  - Bad - `event.title` `event.description`, Good - `title`, `description` - the context is clear. Destructure the event object in the component.
- Commit messages: Use imperative mood, e.g., "Add event form validation" instead of "Added event form validation". Add feat(feature_name): prefixes as appropriate to every task in the commit message. Like feat(auth): Add user authentication flow. <br /> fix(bug_name): Fix the bug in the event creation form. <br />  chore(imports): Clean up imports
  - Eg: 
  ```markdown
    feat: Implement event creation and editing
  This commit introduces the core functionality for creating and editing events,
  centralizing the logic in a reusable form and updating the necessary API
  endpoints and UI components.

  - (feat) Add reusable EventForm for creating and editing events
  - (feat) Introduce LocationItem to display event locations
  - (feat) Enhance routing to support event editing via `events/[id]/edit`
  - (refactor) Update EventCard to render location dynamically
  - (refactor) Modify Navbar to link to the event creation page
  - (refactor) Update server actions and API routes to handle event updates
  - (fix) Improve error handling for all event-related actions
  - (chore) Refactor styles for better layout and
    responsiveness
```

#### Tailwind Best Practices
- Use `@theme` tokens in `app/theme.css` for colors, spacing, etc
- Use Tailwind's responsive utilities (e.g., `px-4 lg:px-8`) for mobile-first design
- Do not use `mb-4`, `mt-2`, etc. directly in classNames – try to use flex and gap instead. Eg: `flex flex-col gap-4`
- Do not use `h-*`, `w-*` for SVG icons - use `size-*` instead (e.g., `size-3` for 12px)
- We use `@theme`. NOT `tailwind.config.js`. Do not create a `tailwind.config.js` directly.

### ❌ Never Do This  
- Just because you are an AI, do not just generate code without understanding the context. Do not generate verbose, overwritten code. Follow DRY like a pro. Try to consolidate code and avoid repetition. Eg: If I ask you to add edit functionality to an event, do not generate a new component for the edit form. Instead, reuse the existing `CreateEventForm` component and add the necessary props to handle editing. Also, you can modify the server action to handle both create and edit operations. Be frugal with code generation and avoid unnecessary complexity.
- Direct fetch('/api/...') calls - use tRPC patterns
- Hard-coded colors/spacing - use theme tokens
- `var(...)` in `className` attributes.
- CSS files outside app/theme.css & app/globals.css
- Relative imports (../../..)
- Inline styles or arbitrary className values
- Do not add backward compatibility for mistakes you make. Eg: You rename a component `CreateEventForm` and then later decide to rename it to `EventForm`. Do not add an export for `CreateEventForm` as a backward compatibility. Instead, just remove the old name and update all references to the new name. If you are not sure about the change, ask for confirmation before making it.
- We're using Next.js. We cannot access the `window` object in server components. If you need to access the `window` object, make sure to do it in a client component or use a hook that runs on the client side.

### Current Auth State
- NextAuth v5 configured but **no providers set up yet**
- `auth()` function available but will return null until providers added
- Database has User model ready for auth integration

---

© 2025 RSVP'd Engineering
