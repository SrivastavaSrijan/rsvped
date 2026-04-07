# RSVP'd — Claude Code Instructions

> Core coding rules live in [AGENTS.md](./AGENTS.md). This file adds Claude Code-specific configuration.

## Commands

```bash
yarn dev              # Dev server (Turbopack)
yarn build            # Production build
yarn lint             # Biome lint + format (auto-fix)
yarn lint:check       # Biome check (no fix)
yarn type-check       # TypeScript strict check
yarn db:push          # Push schema to DB (no migration)
yarn db:migrate       # Create + apply migration
yarn db:seed          # Run seed pipeline
yarn db:studio        # Prisma Studio GUI
```

## Architecture

```
app/                  # Next.js App Router
  (auth)/             # Auth routes (login, register, profile)
  (main)/             # Protected routes (events, communities)
  (static)/           # Public marketing pages (RSC only)
  (dev)/              # Component playground
  theme.css           # Design tokens (@theme) — ONLY token file
  globals.css         # Tailwind imports + resets — ONLY global CSS
server/
  api/routers/        # tRPC routers
  api/shared/         # Errors, middleware, schemas
  api/root.ts         # Router composition + RouterOutput types
  actions/            # Server Actions for mutations
components/
  ui/                 # ShadCN — barrel export from index.ts
  shared/             # Reusable components
lib/
  config/             # Routes, colors, time, SEO
  auth/               # NextAuth v5
  hooks/              # useActionStateWithError, etc.
  trpc/               # tRPC client
prisma/
  schema.prisma       # Full schema
  seed/               # 3-stage seed pipeline
```

## Skill Allowlist

Use these skills when working on frontend code:

- `react-patterns` — Component structure, JSX, conditional rendering
- `async-patterns` — RSC streaming, server actions, no .then(), no client fetches
- `using-useEffects` — When to use (and not use) useEffect
- `review-hooks` — Hooks anti-patterns audit
- `tailwind-styling` — Token-only styling, cn(), v4 gotchas
- `typescript-type-safety` — No any, no as, satisfies
- `testing-patterns` — Vitest + Testing Library best practices
- `review-a11y` — Accessibility patterns
- `performance-patterns` — Async, bundle, rerender optimization
- `server-actions` — ServerActionResponse pattern (RSVP'd-specific)
- `trpc-patterns` — tRPC routers + procedures (RSVP'd-specific)
- `nextjs-app-router` — Next.js 15 async APIs, RSC-first (RSVP'd-specific)
- `shadcn-usage` — ShadCN patterns (RSVP'd-specific)

## Scoped Rules

See directory-specific CLAUDE.md files for detailed patterns:
- `server/CLAUDE.md` — tRPC routers, server actions, error handling
- `components/CLAUDE.md` — ShadCN, styling, component patterns
- `prisma/CLAUDE.md` — Schema, seed system, migrations
- `app/CLAUDE.md` — Route groups, layouts, theming
