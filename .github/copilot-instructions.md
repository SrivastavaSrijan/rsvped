# RSVP'd – Copilot Coding Guidelines (v0.3)

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
```ts
// server/actions/events.ts
'use server'
import { getAPI } from '@/server/api'

export async function createEvent(formData: FormData) {
  const api = await getAPI()
  return api.event.create({ /* parsed data */ })
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

- Never hard‑code values – use `var(--token)` **or** a Tailwind utility already mapped.
- Rounded, calm Lu.ma aesthetic ⇢ rely on radius & shadow tokens – do not invent new radii.
- Use two responsive breakpoints: `sm` (640px) & `lg` (1024px). No custom media queries. 
- For padding/spacing/margins, use Tailwind's `px-4 lg:px-8` etc. This way, mobile‑first design is preserved.

---

## 3 ▪ Directory Layout

```text
app/
  (dev)/               # Component playground & mocks - use /dev/components-preview
  (main)/              # Authenticated user flows (when auth is implemented)
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
  trpc/                # tRPC client setup (provider.tsx, trpc.ts)
server/
  actions/             # Server actions ("use server")
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

- Mutations live in `server/actions/*` and must:

  1. Start with `"use server"`.
  2. Import the **same** tRPC router logic (no duplicate SQL).
  3. Return typed data (`z.object({...}).parse`) or throw.

- Example:

  ```ts
  // server/actions/rsvp.ts
  "use server";
  import { getAPI } from '@/server/api'

  export async function rsvpAction(input: RSVPInput) {
    const api = await getAPI()
    return api.rsvp.create(input)
  }
  ```
- Call from forms with `action={rsvpAction}`; handle Toaster on client.

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
| Route‑local comp                 | **camelCase**                         | `hero.tsx` under page dir |
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
  // app/(static)/pricing/copy.ts
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
- **Data fetching**: tRPC only (server actions for RSC, hooks for client)
- **Styling**: Use theme tokens or mapped Tailwind utilities
- **Components**: Barrel exports from `components/ui/index.ts`

### ❌ Never Do This  
- Direct fetch('/api/...') calls - use tRPC patterns
- Hard-coded colors/spacing - use theme tokens
- CSS files outside app/theme.css & app/globals.css
- Relative imports (../../..)
- Inline styles or arbitrary className values

### Current Auth State
- NextAuth v5 configured but **no providers set up yet**
- `auth()` function available but will return null until providers added
- Database has User model ready for auth integration

---

© 2025 RSVP'd Engineering
