# Handoff — event-manage-phase2

> Implementation prompt for the `event-manage-phase2` plan.
> Read `plan.md` for the full 7-step breakdown. This file provides the critical context an implementing agent needs.

---

## Context

You are implementing phase 2 of the event manage page in RSVP'd. Phase 1 (PR #40) established the manage page with 4 tabs: Overview, Guests, Insights, Team — all using @slot parallel routes with Suspense boundaries.

Phase 2 adds 3 read-only features:
1. **Analytics Chart** — recharts AreaChart showing daily views/rsvps, inside the existing Insights tab
2. **Feedback Dashboard** — new 5th tab showing rating summary + comment list
3. **Messages Display** — new 6th tab showing read-only threaded messages

## Critical Rules

1. **Follow AGENTS.md** — all code style, imports, naming, Tailwind, TypeScript rules apply
2. **Auth pattern** — every tRPC procedure must verify host OR collaborator access (see `event.get.analytics` for exact pattern)
3. **Tab guard** — every @slot page.tsx must check `if (tab !== 'X') return null`
4. **No mutations** — all 3 features are read-only. No create/update/delete.
5. **`"use client"` only for recharts** — ManageAnalyticsChart needs it. ManageFeedback and ManageMessages are RSC.
6. **Seed fixes must match schema exactly** — EventMessage has only `eventId, userId, content, parentId, createdAt`. EventReferral has only `eventId, userId, code, uses, createdAt`.

## Key Files to Read Before Starting

| File | Why |
|------|-----|
| `server/api/routers/event/get.ts` | Auth pattern + where to add procedures |
| `app/(main)/events/[slug]/manage/layout.tsx` | Suspense + slot wiring pattern |
| `app/(main)/events/components/ManageTabs.tsx` | Tab array + props pattern |
| `app/(main)/events/components/ManageInsights.tsx` | Where chart goes below metrics |
| `app/(main)/events/[slug]/manage/@guests/page.tsx` | @slot page pattern with tab guard |
| `app/(main)/events/components/ManageSkeletons.tsx` | Skeleton pattern |
| `prisma/seed/creators/analytics.ts` | Broken seeds to fix |
| `prisma/schema.prisma` | EventDailyStat, EventFeedback, EventMessage schemas |

## Execution Order

Follow steps 1→7 from `plan.md` sequentially. Each step has a verification checkpoint.

## Design Tokens

Use existing palette — no new CSS tokens needed:
- Chart areas: `bg-pale-blue` (views), `bg-pale-green` (rsvps) — extract hex values from theme.css for recharts fills
- Cards: `bg-faint-white` with `rounded-xl`
- Text: `text-foreground`, `text-muted-foreground`
- Star ratings: use `text-amber-400` for filled, `text-muted-foreground/30` for empty
- Icons: Lucide React, `size-*` not `h-*/w-*`

## Branch

Create `feature/event-manage-phase2` from main (NOT from the phase 1 branch).
