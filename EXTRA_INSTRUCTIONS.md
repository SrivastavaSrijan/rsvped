==========================================================
REQUIREMENTS (user-defined, non-negotiable)
==========================================================

1. **Tech stack**

   - Next.js 15 (App Router, React 19)
   - Tailwind CSS
   - ShadCN UI
   - Prisma 5 + PostgreSQL
   - tRPC 11 + Zod
   - NextAuth v6
   - Biome
   - Deployed on Vercel

2. **Design reference**

   - Clone the look-and-feel of **Lu.ma** (desktop-first, calm, rounded, Inter font)
   - Use Lu.ma’s colour palette, typography, spacing, border-radius, shadows
   - No pixel-perfect clone needed, but the vibe must be recognisably Lu.ma

3. **“What we’re building” — mirror Lu.ma features**

   - Public site  
     • Landing / event-listing page  
     • Event detail page with hero, date/time, location, host avatar, categories/tags  
     • RSVP / ticket purchase flow (free or paid)  
     • Confirmation page with calendar (.ics) + share links
   - User accounts  
     • Attendee profile (view RSVPs, tickets, past events)  
     • Host/organiser dashboard login
   - Organiser dashboard  
     • Create / edit events (title, description, rich text, images, categories, location, start/end, capacity, ticket tiers)  
     • View attendee list & export CSV  
     • Check-in (QR or manual) + attendance status  
     • Basic analytics cards (total RSVPs, paid vs free, check-in %)
   - Notifications & integrations (MVP)  
     • Email confirmation + reminder  
     • Calendar link generation
   - Nice-to-have (can stub)  
     • Wait-list, discount codes, clone-event, embed RSVP widget

4. **Design-token bootstrap**

   - Generate a `tailwind.config.ts` section called `theme.extend` that contains **approximated** Lu.ma tokens for:  
     `colors`, `fontFamily.sans`, `borderRadius`, `spacing`, `boxShadow`
   - Read tokens from a CSS/DOM dump I will provide (`luma-page.html` + `styles.css`)

5. **Component preview page**
   - Add `/app/dev/components-preview.tsx` that showcases:  
     • Buttons (primary, secondary, ghost)  
     • Inputs, textareas, selects  
     • Card, modal shell, table header + row  
     • Form section with two labelled inputs + submit button
   - All components must consume the Tailwind tokens and ShadCN primitives

==========================================================
ASSISTANT SUGGESTIONS (opinionated, tweak as needed)
==========================================================

A. **Directory hints**

- Keep everything in a single repo; place shared code in `packages/ui` and `packages/db`
- Use route groups `/app/(public)` and `/app/(admin)` to separate front-facing vs dashboard UI

B. **Design-token extraction workflow**

1.  Use Chrome Coverage or Puppeteer to grab Lu.ma HTML + CSS
2.  Run a small Node script to parse colours & font sizes, output JSON
3.  Map that JSON directly into `tailwind.config.ts`

C. **Initial user stories for v1 sprint**

1.  Visitor can open event page, submit email, receive confirmation email (.ics link).
2.  Organiser logs in, sees event row + RSVP count, exports CSV.

D. **Component testing**

- Install Storybook or Ladle for local component catalog; run in CI with Playwright visual tests.

E. **Keep GraphQL out of v1**; add it only if public SDK or mobile app appears.

### Code Quality & Standards

- **Import Aliases**: Always use `@/` for internal imports (configured in `tsconfig.json`)
  - `@/components/*` for components
  - `@/lib/*` for utilities and shared logic
  - `@/server/*` for server-side code
  - `@/app/*` for app router files
- **Biome Configuration**: Use `yarn lint` to check and fix linting issues
  - Auto-format with `yarn format`
  - Organized imports enabled
  - Single quotes for JS/TS, double quotes for JSX
  - 2-space indentation, 100 character line width

==========================================================
AGENT TASKS (execute in order)
==========================================================

1. Read the existing Next.js scaffold.
2. Install any missing dependencies listed in REQUIREMENTS #1. Initialize these dependancies with the best practices.
3. Scaffold a basic route using tRPC and maintain good directory structure
4. Scaffold a page which uses RSC and fetching to the tRPC server
5. Scaffold a page which uses server actions.
6. Add UI for BOTH using shadcn - approximate design tokens initially.
7. Create / update `tailwind.config.ts` with tokens (REQ #4).
8. Generate `components-preview.tsx` page (REQ #5).
9. Output a brief TODO list for me, grouped by next sprint.

# End of prompt
