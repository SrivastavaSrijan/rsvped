# Research — event-manage-phase2

## Schema Models

### EventDailyStat
- Fields: `id`, `eventId`, `date` (DateTime), `views`, `uniqueViews`, `rsvps`, `paidRsvps`
- Constraints: `@@unique([eventId, date])`, `@@index([date])`
- Seed: `backfillDailyStats()` in `prisma/seed/creators/analytics.ts` — **WORKING**, 90-day backfill with proximity multipliers
- Shape: Array of daily rows per event — ideal for time-series line/area chart

### EventFeedback
- Fields: `id`, `eventId`, `rsvpId`, `rating` (Int, 1-5), `comment` (Text?), `createdAt`
- Constraints: `@@unique([eventId, rsvpId])` — one feedback per attendee per event
- Relations: `event` → Event, `rsvp` → Rsvp (for attendee identity: name, email, image)
- Seed: Created for ~40% of check-ins, positive-biased (ratings 3-5) in `prisma/seed/creators/feedback.ts`
- Shape: Need rating distribution (histogram) + scrollable comment list

### EventMessage
- Fields: `id`, `eventId`, `userId` (String?), `content` (Text), `parentId` (String?), `createdAt`
- Relations: `event`, `user` (User?), `parent`/`replies` (self-referential "Thread")
- Index: `@@index([eventId, createdAt])`
- Seed: **BROKEN** — `createEventMessages()` writes nonexistent fields (`senderId`, `subject`, `type`, `audienceType`, `scheduledFor`, `sentAt`, `openCount`, `clickCount`). Must rewrite to only use `eventId`, `userId`, `content`, `parentId`.

### EventReferral (secondary fix)
- Fields: `id`, `eventId`, `userId` (String?), `code` (String, @unique), `uses` (Int)
- Seed: **BROKEN** — writes `referrerId`, `url`, `clickCount`, `conversionCount`. Must rewrite to use `userId`, `code`, `uses`.

## Existing Patterns

### Auth Check Pattern (from event.get.analytics)
```ts
const user = ctx.session?.user
if (!user) throw TRPCErrors.unauthorized()
const event = await ctx.prisma.event.findUnique({
  where: { slug: input.slug, deletedAt: null },
  select: { hostId: true, eventCollaborators: { where: { userId: user.id }, select: { userId: true } } },
})
if (!event) throw TRPCErrors.eventNotFound()
const isHost = event.hostId === user.id
const isCollaborator = event.eventCollaborators.length > 0
if (!isHost && !isCollaborator) throw TRPCErrors.forbidden()
```

### @slot Page Pattern (from @guests/page.tsx)
```ts
export default async function GuestsSlot({ params, searchParams }) {
  const sp = await searchParams
  const tab = typeof sp.tab === 'string' ? sp.tab : 'overview'
  if (tab !== 'guests') return null  // ← tab guard
  const { slug } = await params
  const api = await getAPI()
  const result = await api.rsvp.byEvent.list({ slug, ... })
  return <ManageGuests ... />
}
```

### ManageTabs Structure
- Client component with `useRouter`, `useSearchParams`, `useTransition`
- Tabs array: `[{ value, label }] as const`
- Props: one ReactNode per tab + basePath
- Content: `<TabsContent value="...">` wrapping each slot

### Layout Suspense Pattern
```tsx
<ManageTabs
  overview={<Suspense fallback={<ManageOverviewSkeleton />}>{overview}</Suspense>}
  guests={<Suspense fallback={<ManageGuestsSkeleton />}>{guests}</Suspense>}
  ...
/>
```

## Integration Points

1. **event/get.ts** — Add 3 new procedures (`dailyStats`, `feedback`, `messages`)
2. **ManageTabs.tsx** — Add `feedback` and `messages` tab entries + props
3. **manage/layout.tsx** — Accept 2 new slot props, wrap in Suspense
4. **ManageSkeletons.tsx** — Add `ManageFeedbackSkeleton`, `ManageMessagesSkeleton`
5. **events/components/index.ts** — Export new components + skeletons
6. **prisma/seed/creators/analytics.ts** — Fix `createEventMessages()` and `createEventReferrals()`
7. **@insights/page.tsx** — Fetch dailyStats, pass to ManageInsights which renders chart
