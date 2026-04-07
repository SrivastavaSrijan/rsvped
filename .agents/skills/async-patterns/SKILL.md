---
name: async-patterns
description: Async data patterns in RSVP'd — progressive RSC streaming, server actions for user-initiated fetches, no .then(), no client-side network calls. Use when fetching data, calling server actions, or writing async code in components.
---

# Async Data Patterns

## The Rule: No Client-Side Network Calls

This codebase has **zero** client-side `fetch`, `axios`, `trpc.useQuery()`, or `.then()` calls. All data flows through two patterns:

1. **RSC Streaming** — for page/layout data
2. **Server Actions** — for user-initiated reads and mutations

## Pattern 1: Progressive RSC Streaming

The primary data loading pattern. Core data renders instantly, enhanced data streams in via `<Suspense>`.

```tsx
// page.tsx — fetch core data fast
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const api = await getAPI()
  const coreEvent = await api.event.get.core({ slug })
  return <ProgressiveEventPage coreEvent={coreEvent} />
}

// ProgressiveEventPage.tsx — stream enhanced data
export const ProgressiveEventPage = ({ coreEvent }: Props) => {
  return (
    <Suspense fallback={<EventPage {...coreEvent} />}>
      <EnhancedEventPage slug={coreEvent.slug} />
    </Suspense>
  )
}

// EnhancedEventPage.tsx — async RSC fetches additional data
const EnhancedEventPage = async ({ slug }: { slug: string }) => {
  const api = await getAPI()
  const event = await api.event.get.enhanced({ slug })
  return <EventPage {...event} />
}
```

Use this for all page-level data. The user sees core content immediately while enhanced data (recommendations, metadata, related items) streams in.

## Pattern 2: Server Actions for User-Initiated Fetches

For data that loads in response to user interaction (hover, keystroke, click) — not on page load.

### In Event Handlers: useTransition + async/await

```tsx
'use client'

const [data, setData] = useState<HoverData | null>(null)
const [isPending, startTransition] = useTransition()

// Good — async handler with useTransition
const handleMouseEnter = () => {
  if (data || isPending) return
  startTransition(async () => {
    const result = await getUserHoverCardAction(user.id)
    setData(result)
  })
}
```

`useTransition` gives you `isPending` for free — no manual loading state needed.

### In Effects (when justified): async IIFE with cleanup

When a useEffect is justified (syncing with an external system or debounced input), use an async IIFE with a cancellation flag:

```tsx
// Good — async IIFE with cleanup
useEffect(() => {
  if (debouncedQuery.length <= 2) {
    setSuggestions([])
    return
  }
  let cancelled = false
  const fetchSuggestions = async () => {
    setSuggestionsLoading(true)
    const results = await getAutocompleteAction(debouncedQuery, 8)
    if (!cancelled) {
      setSuggestions(results)
      setSuggestionsLoading(false)
    }
  }
  fetchSuggestions()
  return () => { cancelled = true }
}, [debouncedQuery])
```

But always ask: does this effect need to exist? See `using-useEffects` skill — most effects for data fetching can be restructured as RSC streaming or event handlers.

## Never: .then()

`.then()` is never used in this codebase. Always use `async/await`.

```tsx
// Bad — .then() chains
getUserHoverCardAction(user.id).then((data) => {
  setFullData(data)
  setLoading(false)
})

// Good — async/await
const data = await getUserHoverCardAction(user.id)
setFullData(data)
```

`.then()` obscures control flow, makes error handling harder, and doesn't work with `useTransition`.

## Never: Client-Side Data Fetching

```tsx
// Bad — any of these in components
fetch('/api/users')
axios.get('/api/events')
trpc.event.list.useQuery()
useSWR('/api/events', fetcher)

// Good — server-side only
const api = await getAPI()
const events = await api.event.list(params)
```

## Decision Tree

```
Need data on page load?
  └─ RSC page fetches via getAPI(), passes as props
     Need progressive loading?
       └─ Suspense + async RSC for enhanced data

Need data on user interaction (hover, click, submit)?
  └─ Server action + useTransition in event handler

Need data on debounced input (search, autocomplete)?
  └─ Server action in useEffect with async IIFE + cleanup
     (Question: can this be an RSC via URL params instead?)

Need to mutate data?
  └─ Server action via useActionStateWithError
```

## Do / Don't

### DON'T: use .then() anywhere

```tsx
someAction(input).then(result => setState(result))
```

### DO: use async/await

```tsx
const result = await someAction(input)
setState(result)
```

### DON'T: manage loading state manually when useTransition works

```tsx
const [loading, setLoading] = useState(false)
const handleClick = async () => {
  setLoading(true)
  const data = await someAction()
  setLoading(false)
}
```

### DO: use useTransition for pending state

```tsx
const [isPending, startTransition] = useTransition()
const handleClick = () => {
  startTransition(async () => {
    const data = await someAction()
    setData(data)
  })
}
```

### DON'T: fetch in useEffect when you can stream from RSC

```tsx
useEffect(() => {
  const load = async () => {
    const data = await getRecommendations()
    setRecs(data)
  }
  load()
}, [])
```

### DO: stream from RSC via Suspense

```tsx
<Suspense fallback={<RecommendationsSkeleton />}>
  <Recommendations eventId={event.id} />
</Suspense>

// Recommendations is an async RSC
const Recommendations = async ({ eventId }: Props) => {
  const api = await getAPI()
  const recs = await api.user.recommendations.similar({ eventId })
  return <RecsList data={recs} />
}
```
