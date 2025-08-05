# RSVP'd

A Lu.ma-inspired event platform built with the modern Next.js 15 stack.

## ✨ Project Goals

- Mirror core Lu.ma functionality (public event listings, RSVP/tickets, organiser dashboard, analytics) with a calm, rounded aesthetic
- Guarantee type-safety from database → API → UI
- Keep the codebase token-driven (Tailwind v4 theme) and component-centric (ShadCN UI)

## 📚 Tech Stack

| Layer        | Technology                               | Version     |
|--------------|------------------------------------------|-------------|
| **Runtime**  | Node.js                                  | ≥ 20 LTS    |
| **Framework**| Next.js (App Router + React RSC)        | 15.4.1      |
| **Styling**  | Tailwind CSS (tokens via `@theme`)      | v4.1.11     |
| **UI Kit**   | ShadCN UI + Radix primitives            | Latest      |
| **Database** | Prisma → PostgreSQL                      | 6.11.1      |
| **API**      | tRPC + TanStack Query + superjson        | 11.4.3      |
| **Auth**     | NextAuth v5 (beta)                       | 5.0.0-beta.29 |
| **Lint**     | Biome (eslint + prettier replacement)   | 2.1.1       |
| **CI/CD**    | Vercel Platform                          | -           |

> **Note**: All library versions are pinned in `package.json`.

## 🗂 Repository Structure

```
app/
├── (auth)/                    # Authentication flows (login, register, profile)
├── (dev)/                     # Component playground (/dev/components-preview)  
├── (main)/                    # Authenticated user flows
├── (static)/                  # Marketing & legal pages (RSC-only)
├── api/auth/                  # NextAuth route handlers
├── globals.css                # Tailwind imports + minimal resets
├── theme.css                  # Single @theme block (design tokens)
├── layout.tsx                 # Root layout with providers
└── providers.tsx              # Client-side providers (tRPC, auth)

components/
├── shared/                    # Reusable components (Background, Footer, etc.)
└── ui/                        # ShadCN wrappers – barrel-exported

lib/
├── auth/                      # NextAuth configuration & helpers
├── config/                    # Route maps, constants, app config
├── hooks/                     # Custom React hooks
└── trpc/                      # tRPC client setup & provider

server/
├── actions/                   # Server Actions ("use server")
└── api/
    ├── routers/              # tRPC routers (event.ts, rsvp.ts, etc.)
    ├── root.ts               # Main router + createCaller export
    └── trpc.ts               # Context creation

prisma/
├── schema.prisma             # Database schema
├── seed.ts                   # Database seeding script
└── migrations/               # Prisma migration files
```

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20 LTS
- PostgreSQL database
- Package manager: `yarn` (recommended), `pnpm`, or `npm`

### Installation

```bash
# 1. Install dependencies
yarn install

# 2. Configure environment
cp .env.example .env
# Update DATABASE_URL and other required variables

# 3. Setup database
yarn db:generate        # Generate Prisma client
yarn db:push            # Push schema to database
yarn db:seed            # (Optional) Seed with sample data

# 4. Start development server
yarn dev                # Next.js with Turbopack
```

### Available Scripts

| Purpose              | Command              | Description                           |
|----------------------|---------------------|---------------------------------------|
| **Development**      | `yarn dev`          | Start dev server with Turbopack      |
| **Build**            | `yarn build`        | Production build                      |
| **Lint & Format**    | `yarn format`       | Auto-fix with Biome                  |
| **Database**         | `yarn db:generate`  | Generate Prisma client               |
|                      | `yarn db:push`      | Push schema changes                   |
|                      | `yarn db:migrate`   | Run migrations                        |
|                      | `yarn db:studio`    | Open Prisma Studio                    |
| **Docker**           | `yarn docker:up`    | Start PostgreSQL container           |
|                      | `yarn docker:down`  | Stop containers                       |
| **Deployment**       | `yarn vercel:build` | Build for Vercel deployment           |

> **Note**: All commits must pass `yarn format` (Biome linting).

## 🎨 Design System

### Token-Driven Styling

- **`app/theme.css`**: Contains every design token in a single `@theme { ... }` block
  - Colors, typography, border radii, spacing, shadows
  - Properties must be alphabetized
  - Never add selectors outside the `@theme` block

- **`app/globals.css`**: Minimal file that imports Tailwind + tokens
  - Only `@layer base` tweaks for global resets
  - No additional CSS files without PR discussion

### Usage Rules

- **Use mapped Tailwind utilities ONLY** (e.g., `border-border`, `bg-secondary`)
- **Never use `var(...)` directly** in `className` attributes
- **No hard-coded values** – create tokens or rethink the design
- **Responsive design**: Mobile-first with `lg:` breakpoint (1024px+)

## 🔐 Authentication (NextAuth v5)

### Current State
- NextAuth v5 configured but **no providers set up yet**
- `auth()` function available but returns `null` until providers added
- Database has User model ready for auth integration

### Architecture
- **Server Components**: `const session = await auth()`
- **Client Components**: `useSession()` from `next-auth/react`
- **tRPC Context**: Session injected via `ctx.session` & `ctx.user`
- **Middleware**: Route protection in `middleware.ts`

### Roles
- `user`, `organizer`, `admin` (typed via Zod)
- Checked inside tRPC routers with helper functions

## 📡 Data Flow & API Patterns

### Server-Side Data (RSC)
```typescript
import { getAPI } from '@/server/api'

const api = await getAPI()
const events = await api.event.list()
```

### Client-Side Data (Components)
```typescript
import { trpc } from '@/lib/trpc'

function EventList() {
  const { data } = trpc.event.list.useQuery()
  return <div>{/* render */}</div>
}
```

### Mutations via Server Actions
```typescript
// server/actions/events.ts
'use server'
import { getAPI } from '@/server/api'

export async function createEvent(prevState: any, formData: FormData) {
  const api = await getAPI()
  // Validation + tRPC call + error handling
  return api.event.create(validatedData)
}
```

### Critical Rules
- **NO direct `fetch('/api/...')` calls** – use tRPC patterns only
- **All mutations** must go through Server Actions
- **Database access** only via tRPC routers (never direct Prisma outside)

## 🗃 Database Schema

### Core Models
- **User**: Authentication & profile data
- **Event**: Event details, location, timing
- **Community**: Event organization groups
- **TicketTier**: Pricing tiers for events  
- **Order & OrderItem**: Purchase tracking
- **Payment & Refund**: Financial transactions
- **RSVP tracking**: Attendance management

### Key Relationships
- Users can organize events and join communities
- Events belong to communities and have multiple ticket tiers
- Orders contain multiple items and link to payments
- Comprehensive audit trail for all transactions

## 📝 Development Guidelines

### Code Style
- **TypeScript**: Strict mode, no `any` types
- **Imports**: Absolute paths via `@/` aliases (never `../../..`)
- **Components**: Single default export per file
- **Server Actions**: Follow the established pattern with proper error handling

### Commit Messages
```
feat(scope): imperative summary

- (feat) Add new functionality
- (fix) Bug fixes  
- (refactor) Code improvements
- (chore) Maintenance tasks
```

### File Naming
- **Components**: `PascalCase.tsx`
- **Utilities**: `camelCase.ts`
- **UI Primitives**: `kebab-case.tsx` (in `components/ui/`)

## 🗣 Content & Localization

### Copy Management
Each page can have a `copy.ts` file alongside `page.tsx`:

```typescript
export const copy = {
  hero: {
    title: 'Plan memorable events faster',
    subtitle: 'Ticketing & RSVPs in minutes.'
  }
} ;
```

This pattern enables easy i18n expansion (`copy.es.ts`, `copy.fr.ts`) while keeping text close to components.

## 🛡 Golden Rules

1. **Type-safe, token-driven, ShadCN-based** – if not, stop and rethink
2. **If a value isn't a design token** – create one or reconsider the design
3. **All server logic goes through tRPC routers** – UI never touches the database directly
4. **Pass `yarn format` before every commit** – no exceptions

---

**Happy shipping!** ✨
