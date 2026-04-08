# Analysis — event-manage-phase2

## Feature Feasibility

| Feature | Schema | Seed | tRPC | UI | Complexity |
|---------|--------|------|------|----|------------|
| Analytics Chart | ✅ Ready | ✅ Working | ❌ None | ❌ None | Low-Medium |
| Feedback Dashboard | ✅ Ready | ✅ Working | ❌ None | ❌ None | Medium |
| Messages Display | ✅ Ready | ❌ Broken | ❌ None | ❌ None | Medium |

## Risk Assessment

1. **Low Risk**: Analytics chart — schema + seed ready, recharts is well-documented, just need procecure + chart component
2. **Low Risk**: Feedback dashboard — schema + seed ready, straightforward rating display + comment list
3. **Medium Risk**: Messages display — seed must be fixed first, threaded display needs `parentId` grouping logic
4. **Low Risk**: Seed fixes — isolated to one file, no schema migration needed

## Architecture Decision: Chart Integration

The analytics chart goes **inside the existing Insights tab**, below the metric cards. This avoids a 7th tab and keeps analytics cohesive. The Insights tab page fetches both `analytics` (aggregates) and `dailyStats` (time-series) and passes both to `ManageInsights`.

## Component Breakdown

- **ManageAnalyticsChart** (new, client component) — recharts AreaChart for daily views/rsvps over time
- **ManageFeedback** (new, RSC) — rating summary (avg, distribution) + scrollable comment list with user avatars
- **ManageMessages** (new, RSC) — threaded message list (top-level + replies), user avatars, timestamps
- **ManageFeedbackSkeleton** (new) — loading skeleton for feedback tab
- **ManageMessagesSkeleton** (new) — loading skeleton for messages tab
