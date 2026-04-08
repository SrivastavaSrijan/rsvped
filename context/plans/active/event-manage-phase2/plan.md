# Plan — event-manage-phase2

> **Goal**: Add 3 read-only dashboard features to the event manage page: analytics time-series chart, feedback dashboard, and messages display.

---

## Step 1: Infrastructure — Install recharts + Fix broken seeds

### 1a. Install recharts
- `yarn add recharts`
- Verify import works

### 1b. Fix `createEventMessages()` in `prisma/seed/creators/analytics.ts`
**Current (broken)**: writes `senderId`, `subject`, `type`, `audienceType`, `scheduledFor`, `sentAt`, `openCount`, `clickCount`
**Fix**: Rewrite to match actual EventMessage schema:
```ts
messageRows.push({
  eventId: event.id,
  userId: event.hostId,           // was senderId
  content: faker.lorem.paragraphs(2),
  parentId: null,                 // top-level messages
  createdAt: faker.date.recent({ days: 30 }),
})
```
- Also generate some replies (parentId → existing message id) for threading demo
- Remove `subject`, `type`, `audienceType`, `scheduledFor`, `sentAt`, `openCount`, `clickCount`

### 1c. Fix `createEventReferrals()` in same file
**Current (broken)**: writes `referrerId`, `url`, `clickCount`, `conversionCount`
**Fix**: Rewrite to match actual EventReferral schema:
```ts
referralRows.push({
  eventId: event.id,
  userId: referrer.id,            // was referrerId
  code: referralCode,             // keep
  uses: faker.number.int({ min: 0, max: 20 }),  // was clickCount/conversionCount
  createdAt: faker.date.recent({ days: 60 }),
})
```
- Remove `url`, `clickCount`, `conversionCount`

### Verification
- `yarn db:push && yarn db:seed` succeeds
- Check Prisma Studio: EventMessage and EventReferral tables have data

**Files modified:**
- `package.json` (recharts dep)
- `prisma/seed/creators/analytics.ts`

---

## Step 2: tRPC Procedures — Add 3 new getters to `event.get`

All procedures follow the existing auth check pattern from `event.get.analytics`.

### 2a. `event.get.dailyStats`
```ts
dailyStats: protectedProcedure
  .input(GetEventInput)
  .query(async ({ ctx, input }) => {
    // ... auth check (same as analytics) ...
    const stats = await ctx.prisma.eventDailyStat.findMany({
      where: { eventId: event.id },
      orderBy: { date: 'asc' },
      select: { date: true, views: true, uniqueViews: true, rsvps: true, paidRsvps: true },
    })
    return stats
  })
```
- Returns array of `{ date, views, uniqueViews, rsvps, paidRsvps }` sorted by date

### 2b. `event.get.feedback`
```ts
feedback: protectedProcedure
  .input(GetEventInput)
  .query(async ({ ctx, input }) => {
    // ... auth check ...
    const feedbacks = await ctx.prisma.eventFeedback.findMany({
      where: { eventId: event.id },
      orderBy: { createdAt: 'desc' },
      include: {
        rsvp: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })
    return feedbacks
  })
```
- Returns array with user info via rsvp relation
- No pagination needed initially (feedback count is bounded by attendee count)

### 2c. `event.get.messages`
```ts
messages: protectedProcedure
  .input(GetEventInput)
  .query(async ({ ctx, input }) => {
    // ... auth check ...
    const messages = await ctx.prisma.eventMessage.findMany({
      where: { eventId: event.id, parentId: null },  // top-level only
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, image: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })
    return messages
  })
```
- Fetches top-level messages with nested replies (2-level threading)
- No pagination initially (message count is bounded)

### Verification
- `yarn type-check` passes
- tRPC procedures callable via getAPI() in RSC

**Files modified:**
- `server/api/routers/event/get.ts`

---

## Step 3: Analytics Chart — Recharts area chart in Insights tab

### 3a. Create `ManageAnalyticsChart.tsx` (client component)
- `"use client"` — recharts requires client rendering
- Props: `dailyStats: { date: string; views: number; rsvps: number }[]`
- Render: recharts `<ResponsiveContainer>` + `<AreaChart>` with:
  - X-axis: date (formatted as short month/day)
  - Two areas: Views (brand color) + RSVPs (green)
  - Tooltip on hover
  - Clean minimal styling with bg-faint-white container
- Empty state: "No daily stats yet" if array is empty

### 3b. Update `ManageInsights.tsx`
- Add optional `dailyStats` prop
- Render `<ManageAnalyticsChart>` below the metric cards grid (when dailyStats exists and has data)

### 3c. Update `@insights/page.tsx`
- Fetch both `api.event.get.analytics()` and `api.event.get.dailyStats()` (parallel with Promise.all)
- Pass `dailyStats` to `<ManageInsights>`

### 3d. Update `ManageInsightsSkeleton`
- Add a chart skeleton placeholder below the metric grid

### Verification
- Navigate to manage page → Insights tab → see metric cards + chart
- Chart shows daily views/rsvps over time
- Empty state works when no daily stats

**Files created:**
- `app/(main)/events/components/ManageAnalyticsChart.tsx`

**Files modified:**
- `app/(main)/events/components/ManageInsights.tsx`
- `app/(main)/events/[slug]/manage/@insights/page.tsx`
- `app/(main)/events/components/ManageSkeletons.tsx`
- `app/(main)/events/components/index.ts`

---

## Step 4: Feedback Tab — New @feedback slot

### 4a. Create `@feedback/default.tsx`
```tsx
export default function Default() { return null }
```

### 4b. Create `@feedback/page.tsx`
- Tab guard: `if (tab !== 'feedback') return null`
- Fetch `api.event.get.feedback({ slug })`
- Render `<ManageFeedback feedback={data} />`

### 4c. Create `ManageFeedback.tsx` (RSC component)
- **Summary section**: Average rating (large number), total feedback count, rating distribution bar (5 bars showing count per star level)
- **Comments list**: Scrollable list of feedback entries with:
  - User avatar + name (from rsvp.user)
  - Star rating display
  - Comment text
  - Relative timestamp
- **Empty state**: "No feedback yet" with icon

### 4d. Create `ManageFeedbackSkeleton`
- Skeleton matching the summary + list layout

### Verification
- Navigate to manage page → Feedback tab → see summary + comments
- Empty state works when no feedback

**Files created:**
- `app/(main)/events/[slug]/manage/@feedback/default.tsx`
- `app/(main)/events/[slug]/manage/@feedback/page.tsx`
- `app/(main)/events/components/ManageFeedback.tsx`

**Files modified:**
- `app/(main)/events/components/ManageSkeletons.tsx` (add ManageFeedbackSkeleton)
- `app/(main)/events/components/index.ts` (export ManageFeedback + skeleton)

---

## Step 5: Messages Tab — New @messages slot

### 5a. Create `@messages/default.tsx`
```tsx
export default function Default() { return null }
```

### 5b. Create `@messages/page.tsx`
- Tab guard: `if (tab !== 'messages') return null`
- Fetch `api.event.get.messages({ slug })`
- Render `<ManageMessages messages={data} />`

### 5c. Create `ManageMessages.tsx` (RSC component)
- **Message list**: Each top-level message shows:
  - User avatar + name
  - Content text
  - Relative timestamp
  - Nested replies (indented) with same layout
- **Empty state**: "No messages yet" with icon
- Read-only — no compose/reply UI

### 5d. Create `ManageMessagesSkeleton`
- Skeleton matching the threaded message layout

### Verification
- Navigate to manage page → Messages tab → see threaded messages
- Empty state works when no messages

**Files created:**
- `app/(main)/events/[slug]/manage/@messages/default.tsx`
- `app/(main)/events/[slug]/manage/@messages/page.tsx`
- `app/(main)/events/components/ManageMessages.tsx`

**Files modified:**
- `app/(main)/events/components/ManageSkeletons.tsx` (add ManageMessagesSkeleton)
- `app/(main)/events/components/index.ts` (export ManageMessages + skeleton)

---

## Step 6: Wire Tabs — Update ManageTabs + Layout for 6 tabs

### 6a. Update `ManageTabs.tsx`
- Add to tabs array: `{ value: 'feedback', label: 'Feedback' }`, `{ value: 'messages', label: 'Messages' }`
- Add to Props interface: `feedback: ReactNode`, `messages: ReactNode`
- Add `<TabsContent>` entries for both

### 6b. Update `manage/layout.tsx`
- Add to ManageLayoutProps: `feedback: ReactNode`, `messages: ReactNode`
- Wrap new slots in `<Suspense>` with new skeletons:
```tsx
feedback={<Suspense fallback={<ManageFeedbackSkeleton />}>{feedback}</Suspense>}
messages={<Suspense fallback={<ManageMessagesSkeleton />}>{messages}</Suspense>}
```
- Import new skeleton components

### Verification
- All 6 tabs render and switch correctly
- Tab URL params work: `?tab=feedback`, `?tab=messages`
- Suspense boundaries work (show skeletons while loading)
- `yarn type-check && yarn lint` passes

**Files modified:**
- `app/(main)/events/components/ManageTabs.tsx`
- `app/(main)/events/[slug]/manage/layout.tsx`

---

## Step 7: Final Verification

- [ ] `yarn type-check` — no TypeScript errors
- [ ] `yarn lint` — no Biome errors
- [ ] `yarn build` — production build succeeds
- [ ] `yarn db:push && yarn db:seed` — seed runs without errors
- [ ] Manual QA: all 6 tabs work, charts render, feedback + messages display correctly
- [ ] Empty states work for events with no analytics/feedback/messages
- [ ] Auth: verify forbidden for non-host/non-collaborator access

---

## Summary

| Step | Description | New Files | Modified Files |
|------|------------|-----------|----------------|
| 1 | Infrastructure (recharts + seed fixes) | 0 | 2 |
| 2 | tRPC procedures (3 getters) | 0 | 1 |
| 3 | Analytics chart (recharts in Insights) | 1 | 4 |
| 4 | Feedback tab (@feedback slot) | 3 | 2 |
| 5 | Messages tab (@messages slot) | 3 | 2 |
| 6 | Wire tabs (ManageTabs + layout) | 0 | 2 |
| 7 | Verification | 0 | 0 |
| **Total** | | **7 new** | **~8 modified** |
