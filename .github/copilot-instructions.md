# Copilot Instructions for RSVP'd (Lu.ma-inspired Event Platform)

## 1. REQUIREMENTS (User-defined, non-negotiable)

### Tech Stack & Design

- **Stack**: Next.js 15 (App Router, React 19), Tailwind CSS, ShadCN UI, Prisma 5/PostgreSQL, tRPC 11, NextAuth v6, Biome.
- **Design**: Clone the look-and-feel of **Lu.ma** (desktop-first, calm, rounded UI). All UI must use design tokens from `tailwind.config.ts`.
- **Deployment**: Vercel.

### What We're Building (Mirror Lu.ma Features)

- **Public Site**:
  - Landing / event-listing page.
  - Event detail page with hero, date/time, location, host info, and tags.
  - RSVP / ticket purchase flow (free & paid).
  - Confirmation page with calendar download (.ics) and share links.
- **User Accounts**:
  - Attendee profile (view RSVPs, tickets, past events).
  - Host/organizer dashboard login.
- **Organizer Dashboard**:
  - Create / edit events (rich text, images, categories, location, capacity, ticket tiers).
  - View attendee list & export to CSV.
  - Check-in functionality (QR or manual).
  - Basic analytics (total RSVPs, paid vs. free, check-in %).

### Core Tasks

- **Design Tokens**: Extract Lu.ma's color palette, typography, spacing, and radii into `tailwind.config.ts`.
- **Component Preview**: Create `app/dev/components-preview.tsx` to showcase all core UI components built with ShadCN & Tailwind tokens.

## 2. ASSISTANT SUGGESTIONS (Architectural Guidance)

### Key Directories & Files

- `app/`: Use route groups: `(public)` for attendee flows, `(admin)` for the organizer dashboard.
- `components/`: Shared UI, built with ShadCN primitives and custom Tailwind tokens.
- `prisma/schema.prisma`: Source of truth for data models (Org, Event, RSVP, CheckIn, etc.).
- `server/api/routers/`: tRPC routers for all business logic (e.g., `event.ts`, `rsvp.ts`).
- `lib/`: Auth helpers, utils, etc.

### Data & API Patterns

- **tRPC**: All client-server communication uses tRPC.
- **Prisma**: All DB access via the Prisma client, injected into the tRPC context.
- **Server Actions**: Use for form submissions and mutations.
- **Type Safety**: Ensure end-to-end type safety from DB → API → React hooks.

### Developer Workflows

- **Dev Server**: `yarn dev`
- **DB Migration**: `yarn prisma db push` and `yarn prisma generate`.
- **Lint/Format**: `yarn biome check --apply`.
- **Component Preview**: Visit `/dev/components-preview` in the browser.

### Conventions

- **Design Tokens**: All styling must use Tailwind theme tokens. No hardcoded values.
- **Multi-tenancy**: The app is multi-tenant. Org context is passed via URL slug (e.g., `/org/[slug]/events`).
- **No GraphQL in v1**: All APIs are tRPC.

---

If you are unsure about a pattern, check for similar usage in the `server/api/routers/`, `components/`, or `app/` directories. When in doubt, prefer type safety, Tailwind tokens, and ShadCN primitives.
