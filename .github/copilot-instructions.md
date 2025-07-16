# RSVP'd – Copilot Coding Guidelines (v0.3) RSVP’d – Copilot Coding Guidelines (v0.2)

> **Scope**: Implementation details only. Feature discussions live elsewhere.

---

## 1 ▪ Stack & Tooling

| Layer       | Locked‑in Tech                               | Notes                                                                  |
| ----------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| Runtime     | **Node ≥ 20.x** (LTS)                        | Required by Next 15 & Prisma 5.                                        |
| Framework   | Next.js 15 (App Router + React 19 ✓ RSC)     | `experimental.appDir` is **on** by default.                            |
| Styling     | Tailwind CSS v4 (tokens via `@theme`)        | Never edit `tailwind.config.*` – tokens come from `src/app/theme.css`. |
| UI Kit      | ShadCN UI                                    | Import **only** the components you use.                                |
| DB          | Prisma 5 → PostgreSQL                        | Client lives **only** in tRPC context.                                 |
| API         | tRPC 11 + react‑query 5                      | `superjson` transformer pinned.                                        |
| Auth        | NextAuth v6 (beta)                           | Email & OAuth (GitHub, Google).                                        |
| Lint/Format | **Biome** (eslint+prettier superset)         | All commits pass `biome check --apply`.                                |
| CI          | GitHub Actions → Vercel Preview → Production | CI must pass **lint + type‑check + test**.                             |

---

## 2 ▪ Theming & Styling

| File                   | Purpose                                               | **Non‑negotiable Rules**                                                                                                                |
| ---------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/theme.css`    | Single `@theme { … }` block – **all** design tokens.  | • No other selectors.<br>• Alphabetical order.<br>• Token names follow `--color-…`, `--font-…`, `--radius-…` etc.<br>• No `!important`. |
| `src/app/global.css`   | Imports Tailwind + tokens, and minimal `@layer base`. | \`\`\`css                                                                                                                               |
| @import "tailwindcss"; |                                                       |                                                                                                                                         |
| @import "./theme.css"; |                                                       |                                                                                                                                         |

````<br>• Only global resets / selection colour.

> **Two files only**. Any new global style requires PR discussion.

### Usage

* Never hard‑code values – use `var(--token)` **or** a Tailwind utility already mapped.
* Rounded, calm Lu.ma aesthetic ⇢ rely on radius & shadow tokens – do not invent new radii.
* Use two responsive breakpoints: `sm` (640px) & `lg` (1024px). No custom media queries. For padding/spacing/margins, use Tailwind’s `px-4 lg:px-8` etc. This way, its mobile‑first design is preserved.

---

## 3 ▪ Directory Layout

```text
app/
  (dev)/               # component playground & mocks
  (main)/              # authenticated user flows
  (static)/            # marketing & legal pages (RSC only)
    layout.tsx
    page.tsx
  globals.css          # <- global styles
  theme.css            # <- tokens
components/
  ui/                  # ShadCN wrappers, exported via barrel
  shared/              # reusable, project‑specific comps
lib/
  routes.ts            # centralised route map (see §8)
  auth.ts              # NextAuth helpers (server & client)
server/
  actions/             # server actions (`"use server"`)
  api/
    routers/           # tRPC routers (event.ts, rsvp.ts…)
prisma/
  schema.prisma        # data models
public/
  …                    # static assets
````

> **Colocation** : Non‑reusable components live next to their route. Reusable shareables live in `components/`.

---

## 4 ▪ Data Layer & React Server Components

### 4.1 Fetching tRPC in RSC

* Use **`createServerSideHelpers()`** inside `server/api/helpers.ts`.
* Example ⇣

  ```ts
  // app/(main)/events/[id]/page.tsx (RSC)
  import { api } from '@/server/api/helpers';

  export default async function EventPage({ params }) {
    const helpers = await api();          // server‑only
    const event  = await helpers.event.byId.fetch(params.id);
    return <EventView event={event} />;   // passed as props to Client comp if needed
  }
  ```
* **NEVER** call `await fetch('/api/trpc')` from RSC – go via helpers for type‑safety & no HTTP hop.

### 4.2 Client React Query

* Use `@trpc/react-query` hooks inside client components :

  ```ts
  const { data } = api.event.byId.useQuery(id);
  ```
* Hydration handled by `<TRPCReactProvider>` in `app/layout.tsx`.

---

## 5 ▪ Server Actions

* Mutations live in `server/actions/*` and must:

  1. Start with `"use server"`.
  2. Import the **same** tRPC router logic (no duplicate SQL).
  3. Return typed data (`z.object({...}).parse`) or throw.
* Example:

  ```ts
  // server/actions/rsvp.ts
  "use server";
  import { rsvpRouter } from '@/server/api/routers/rsvp';

  export async function rsvpAction(input: RSVPInput) {
    return rsvpRouter.mutate({ input, ctx: auth() });
  }
  ```
* Call from forms with `action={rsvpAction}`; handle Toaster on client.

---

## 6 ▪ Auth Layers

| Context                 | How to Access                                       | Notes                                      |
| ----------------------- | --------------------------------------------------- | ------------------------------------------ |
| **RSC / Server Action** | `const session = await auth();`                     | Throws if invalid when scope = `required`. |
| **Client Components**   | `useSession()` from `next-auth/react`               | Provides reactive session.                 |
| **tRPC Context**        | `getServerSession()` inside `server/api/context.ts` | Injects `ctx.session` & `ctx.user`.        |

* Use **Route Handlers** in `/app/api/auth/[...nextauth]/route.ts` only – no pages.
* Public vs protected routes declared in **middleware.ts** – redirect unauth users.
* Roles: `user`, `organizer`, `admin` typed via Zod & checked inside routers.

---

## 7 ▪ Naming, Imports & Organisation

### 7.1 Files & Folders

| Kind                             | Case                                  | Example                   |
| -------------------------------- | ------------------------------------- | ------------------------- |
| React component (reusable)       | **PascalCase**                        | `EventCard.tsx`           |
| Route‑local comp                 | **camelCase**                         | `hero.tsx` under page dir |
| UI primitives (ShadCN re‑export) | **kebab‑case** inside `components/ui` | `button.tsx`, `input.tsx` |
| Utility                          | **camelCase**                         | `formatDate.ts`           |
| Barrel                           | `index.ts`                            | re‑export only – no logic |

> **No `../../..`**: always import via path alias (`@/lib`, `@/components/ui`).

### 7.2 Routes Map

```ts
// lib/routes.ts
export const Routes = {
  Home: '/',
  Explore: '/explore',
  Pricing: '/pricing',
} as const;
export type Route = typeof Routes[keyof typeof Routes];
```

* Use <kbd>Routes.Home</kbd> etc. in `next/link`.

---

## 8 ▪ Copy & i18n

> Keep text near usage, but centralise per‑page.

* Each marketing/static page may export **`copy.ts`** alongside `page.tsx`.
* Structure:

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
* Components import from that file – this keeps translations easy (`copy.es.ts`, `copy.fr.ts`, …).
* **No inline hard‑coded strings** except aria‑labels.

---

## 9 ▪ Dev Workflow (scripts already in `package.json`)

| Task              | Command                           |
| ----------------- | --------------------------------- |
| Start dev         | `yarn dev`                        |
| Type check        | `yarn types` *(tsc --noEmit)*     |
| Lint / format     | `yarn lint` (auto‑write)          |
| DB push           | `yarn db:push`                    |
| DB migrate        | `yarn db:migrate`                 |
| Seed              | `yarn db:seed`                    |
| Component preview | Visit **/dev/components-preview** |

---

## 10 ▪ Golden Rules

1. **Type‑safe, token‑driven, ShadCN‑based** – or rethink.
2. If a value isn’t a token → stop.
3. If a call bypasses tRPC/Prisma context → stop.
4. If you need another global CSS file → open a proposal first.

---

© 2025 RSVP’d Engineering
