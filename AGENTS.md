# RSVP'd — AI Agent Guidelines (v0.5)

AI-forward event management platform. Next.js 15 + React 19 + tRPC 11 + Prisma 6 + Tailwind v4 + ShadCN.

---

## 1. Commands

```bash
yarn dev              # Dev server (Turbopack)
yarn build            # Production build
yarn lint             # Biome lint + format (auto-fix)
yarn lint:check       # Biome check (no fix)
yarn type-check       # TypeScript strict check
yarn db:push          # Push schema to DB (no migration file)
yarn db:migrate       # Create + apply named migration
yarn db:seed          # Run seed pipeline
yarn db:studio        # Prisma Studio GUI
```

## 2. Project Structure

```
app/                  # Next.js App Router
  (auth)/             # Auth routes (login, register, profile)
  (main)/             # Protected routes (events, communities)
  (static)/           # Public marketing pages (RSC only)
  (dev)/              # Component playground
  theme.css           # Design tokens (@theme block) — ONLY token file
  globals.css         # Tailwind imports + resets — ONLY global CSS
server/
  api/routers/        # tRPC routers (event, community, rsvp, user, etc.)
  api/shared/         # Errors (TRPCErrors), middleware, schemas
  api/root.ts         # Router composition, RouterOutput/RouterInput types
  api/trpc.ts         # Context + publicProcedure/protectedProcedure
  actions/            # Server Actions ("use server") for all mutations
components/
  ui/                 # ShadCN wrappers — barrel export from index.ts
  shared/             # Reusable components (Form, Footer, etc.)
lib/
  config/             # Routes, colors, time, SEO, dev config
  auth/               # NextAuth v5 setup
  hooks/              # Custom hooks (useActionStateWithError, etc.)
  trpc/               # tRPC client setup
prisma/
  schema.prisma       # Full schema (User, Event, Community, Rsvp, etc.)
  seed/               # 3-stage seed pipeline (generators → creators → seed)
```

## 3. Code Style

### Imports & Modules
- **Always** path aliases: `@/lib`, `@/components/ui`, `@/server/api`
- **Never** relative imports (`../../`) or `import * as React`
- ShadCN: import from `@/components/ui` barrel

### Data Flow
- **tRPC everywhere** — no direct API routes, no raw Prisma in pages/components
- RSC: `const api = await getAPI(); await api.event.list()`
- Client: `trpc.event.list.useQuery()`
- Mutations: Server Actions only → call `getAPI()` internally
- Props: use `RouterOutput['event']['list']` types, not custom interfaces

### Naming
- Components: PascalCase (`EventCard.tsx`). UI primitives: kebab-case (`button.tsx`)
- Directories: lowercase-dash (`ai-discover/`)
- Booleans: `isLoading`, `hasError`. Handlers: `handleClick`, `handleSubmit`
- Destructure props: `{ title, description }` not `event.title`
- Routes: `Routes.Main.Events.Create` from `@/lib/config`

### TypeScript
- Strict mode. No `any`. Avoid `as` — use `satisfies` for validation.
- Prefer `interface` over `type` for object shapes.
- Avoid enums in new code — use `as const` maps.
- Arrow functions for components/hooks. `function` keyword for server actions only.

### Styling (Tailwind v4)
- Use mapped Tailwind utilities only: `bg-brand`, `text-foreground`, `text-muted-foreground`, `border-border`
- Never `var(...)` in className, arbitrary values (`h-[123px]`), or inline styles
- `flex` + `gap` for spacing — avoid `mb-4`, `mt-2`
- Icons: `size-*` (Lucide React), not `h-*`/`w-*`
- Mobile-first: `lg:` for desktop. Avoid `md:` and `sm:`.
- Tokens in `app/theme.css` only. No `tailwind.config.ts` (v4 uses CSS).
- Use `cn()` for conditional class merging.

### Components
- RSC by default. `"use client"` only for hooks, event handlers, browser APIs.
- One component per file. Reuse > create. Edit forms reuse create forms.
- No backward-compat shims — just update all references.

## 4. Git Workflow

- **Commits**: imperative, prefixed — `feat(auth): Add Google OAuth flow`
- **Branches**: `feature/phase-name` (one per modernization phase)
- **Pre-commit**: Biome check + format + type-check (via simple-git-hooks + lint-staged)

## 5. Testing

- **Vitest** for unit/integration tests. **Playwright** for E2E.
- Group related tests in `describe` blocks. One assertion concern per `it`.
- Descriptive names: `should return validation error when title is empty`
- **Behavior > coverage metrics.** Test what matters, skip trivial pass-throughs.
- tRPC routers: test with `createCaller` and mock context.
- Server actions: mock `getAPI()`, verify Zod validation + error code returns.

## 6. Boundaries

### Never Do
- Direct Prisma queries in pages/components (use tRPC/getAPI)
- `useCallback`, `useMemo`, `React.memo` (React Compiler handles memoization)
- `forwardRef` (deprecated in React 19 — use `ref` as prop)
- `useEffect` for data fetching (use RSC or tRPC hooks)
- `useFormState` (replaced by `useActionState` in React 19)
- `condition && <Component />` for conditional JSX (use ternary with `null`)
- Array index as `key` (use stable IDs)
- `tailwind.config.ts` or `tailwind.config.js` (v4 uses `@theme` in CSS)
- `var(...)` in className, arbitrary Tailwind values, inline styles
- New CSS files beyond `theme.css` + `globals.css`
- Hard-coded hex colors or spacing values
- Components defined inside other components' render

### Server Actions
- Every Server Action is a **public endpoint** — validate ALL inputs with Zod.
- `redirect()` must be called **outside** try/catch (Next.js throws internally).
- Return `ServerActionResponse`, never throw from actions.

### Next.js 15
- `params`, `cookies()`, `headers()`, `draftMode()` return Promises — always `await`.
- `<Link>` for navigation, not `<a>`. `useRouter` only when `<Link>` won't work.
- Never pass server-only data/handlers to client components.
- Add `loading.tsx` with `<Suspense>` boundaries for async pages.
