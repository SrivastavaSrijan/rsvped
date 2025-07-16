RSVP’d

A Lu.ma-inspired event platform built with the modern Next.js 15 stack.

⸻

✨ Project Goals
	•	Mirror core Lu.ma functionality (public event listings, RSVP/tickets, organiser dashboard, analytics) with a calm, rounded aesthetic.
	•	Guarantee type-safety from database → API → UI.
	•	Keep the codebase token-driven (Tailwind v4 theme) and component-centric (ShadCN UI).

⸻

📚 Tech Stack

Layer	Tech / Tool
Runtime	Node ≥ 20 LTS
Framework	Next.js 15 (App Router + React 19 RSC)
Styling	Tailwind CSS v4 (tokens via @theme)
UI Kit	ShadCN UI + Radix primitives
Database	Prisma 6 → PostgreSQL
API	tRPC 11 (+ TanStack Query 5, superjson)
Auth	NextAuth v5 (beta)
Lint/Format	Biome 2 (eslint + prettier replacement)
CI / CD	Vercel

Note: all library versions are pinned in package.json.

⸻

🗂 Repository Layout (high-level)

app/
  (dev)/                     # Component playground (/dev/components-preview)
  (main)/                    # Authenticated user flows
  (static)/                  # Marketing / legal pages (RSC-only)
  globals.css                # Imports Tailwind + minimal resets
  theme.css                  # Single @theme block (design tokens)
components/
  ui/                        # ShadCN wrappers – barrel-exported
lib/
  config/routes.ts           # Centralised route map
  auth.ts                    # NextAuth helpers
  trpc/                      # tRPC client setup
server/
  actions/                   # Server Actions ("use server")
  api/
    routers/                # tRPC routers (event.ts, rsvp.ts, …)
    root.ts                 # createRouter / createCaller
    trpc.ts                 # Context creation
prisma/
  schema.prisma              # DB schema (Event, RSVP, …)


⸻

🚀 Getting Started

# 1. Install deps
pnpm i            # or yarn / npm

# 2. Configure database
cp .env.example .env
# ⇒ update DATABASE_URL for Postgres

# 3. Generate client + push schema
pnpm db:generate
pnpm db:push      # uses Prisma migrate — creates tables

# 4. Start dev server
pnpm dev          # Next 15 with Turbopack

Common Scripts

Purpose	Command
Dev server	pnpm dev
Lint + format	pnpm lint (auto-fix)
Type check only	pnpm lint:check
Push schema	pnpm db:push
Run migrations	pnpm db:migrate
Seed data	pnpm db:seed
Build for Vercel	pnpm vercel:build

All commits must pass pnpm lint.

⸻

🎨 Design System
	•	app/theme.css holds every design token inside a single @theme { … } block (colours, typography, radii, spacing, shadows…).
→ Never add selectors; keep properties alphabetised.
	•	app/globals.css merely imports Tailwind & tokens, plus minuscule @layer base tweaks.
	•	Zero hard-coded values in components – use var(--token) or the Tailwind utility already mapped to that token.

Two global CSS files only – propose in a PR if more are truly required.

⸻

🔐 Auth Flow (NextAuth v5)
	•	lib/auth.ts wraps auth() & getServerSession() helpers.
	•	/app/api/auth/[...nextauth]/route.ts defines the route handler.
	•	Public ↔ protected routes enforced in middleware.ts (redirect unauthenticated users).

Roles (typed via Zod): user, organizer, admin.
Check inside tRPC routers: isOrganizer(ctx) etc.

⸻

📡 Data Fetching Rules
	1.	React Server Components → call tRPC via server helper:

import { getAPI } from '@/server/api'
const api = await getAPI()
const data = await api.event.list()


	2.	Client Components → use hooks:

import { trpc } from '@/lib/trpc'
const { data } = trpc.event.list.useQuery()


	3.	Mutations must be encapsulated in server actions (server/actions/*.ts) that internally call tRPC.

No direct fetch('/api/...') or raw Prisma queries outside routers.

⸻

📝 Coding Guidelines

The full engineering guide lives in COPILOT_GUIDELINES.md – read it before opening a PR.  Highlights:
	•	Single default export per file.
	•	No any; prefer unknown + Zod narrowing.
	•	Absolute imports via @/ aliases (never ../../..).
	•	ShadCN components re-exported from components/ui/index.ts.
	•	Commit messages: scope: imperative summary — e.g. rsvp: add refund logic.
	•	No use client in shared libs; only in leaf UI files.

⸻

🗣️ Copy & Localisation

Each page may ship a copy.ts file next to page.tsx.
Example:

export const copy = {
  hero: {
    title: 'Plan memorable events faster',
    subtitle: 'Ticketing & RSVPs in minutes.'
  }
} as const;

This keeps text close to markup, yet swappable for i18n (copy.es.ts).  Avoid inline strings except for aria-labels.

⸻

🛡 Golden Rules
	1.	Type-safe, token-driven, ShadCN-based — if not, stop.
	2.	If a value is not a token, create a token or rethink the design.
	3.	All server logic goes through tRPC routers; UI never hits the DB.
	4.	Pass pnpm lint before pushing.

⸻

Happy shipping! ✨