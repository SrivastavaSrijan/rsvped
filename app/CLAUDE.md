# App Directory — Claude Code Rules

## Route Groups

| Group | Purpose | Auth | Component Type |
|-------|---------|------|----------------|
| `(auth)/` | Login, register, profile | Public (redirects if logged in) | Client + Server |
| `(main)/` | Events, communities, categories | Protected (middleware redirects) | Mixed |
| `(static)/` | Landing, pricing, legal | Public | RSC only |
| `(dev)/` | Component playground | Dev only | Mixed |

### Route-Colocated Components
- Page-specific components live in `app/(group)/feature/components/`
- Each has an `index.ts` barrel export
- These are NOT reusable — for reusable components use `components/shared/`

## Routing

### Route Config
```ts
import { Routes } from '@/lib/config'

// Usage:
Routes.Main.Events.Create          // '/events/create'
Routes.Main.Events.ViewBySlug(slug) // '/events/{slug}/view'
Routes.Auth.SignIn                  // '/login'
```
- Always use `Routes.*` constants — never hardcode paths
- `RouteDefs.Protected` and `RouteDefs.Public` control middleware behavior

### Navigation
- Use `<Link>` from `next/link` — never raw `<a>` tags
- `useRouter` only when `<Link>` won't work (programmatic navigation after action)

## Pages

### RSC Page Pattern
```ts
import { getAPI } from '@/server/api'

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params  // params is async in Next.js 15
  const api = await getAPI()
  const event = await api.event.get.bySlug({ slug })
  return <EventView event={event} />
}
```
- `params` returns a Promise — always `await` it
- Same for `cookies()`, `headers()`, `draftMode()`
- Use `getAPI()` for data fetching, never raw Prisma

### Loading States
- Add `loading.tsx` alongside `page.tsx` for automatic Suspense
- Use ShadCN `Skeleton` components in loading files

## Theming

### theme.css (The ONLY Token File)
- Contains a single `@theme static { ... }` block
- Defines: colors (cranberry, blue, purple + semantic), radius, spacing, layout constraints
- Tokens map automatically to Tailwind utilities (e.g., `--color-brand` → `bg-brand`)
- Alphabetical order within the block
- No selectors, no `!important`

### globals.css
```css
@import "tailwindcss";
@import "./theme.css";
@import "tw-animate-css";
```
- Imports only — plus minimal `@layer base` resets
- Dark mode overrides in `.dark` class
- `@theme inline` for computed tokens (radius-sm, font-sans, font-mono)
- No new CSS files — ever. If you think you need one, you don't.

## Layouts

- `app/layout.tsx` — Root layout with `<Providers>` wrapper (tRPC + progress bar)
- Route group layouts (`(main)/layout.tsx`, `(static)/layout.tsx`) — group-specific chrome (nav, footer)
- Layouts are server components by default

## Middleware

- `middleware.ts` at project root — runs NextAuth, sets `x-pathname` header
- Matcher excludes: api/auth, static assets, images
- Auth-protected routes defined in `RouteDefs.Protected`

## Copy Pattern
- Static page text goes in colocated `copy.ts` files, not inline
- Structure: `export const copy = { hero: { title: '...', subtitle: '...' }, ... }`
- No inline hard-coded strings except aria-labels
