---
name: performance-patterns
description: Performance patterns covering async parallelization, bundle optimization, and re-render prevention. Use when writing async code, optimizing imports, or diagnosing unnecessary re-renders.
---

# Performance Patterns

## Overview

Consolidated performance rules for the RSVP'd codebase covering three areas: async parallelization, bundle/import optimization, and React re-render prevention.

---

## Async Patterns

### Promise.all() for Independent Operations

When async operations have no interdependencies, execute them concurrently using `Promise.all()`.

**Don't (sequential execution, 3 round trips):**

```typescript
const user = await fetchUser();
const posts = await fetchPosts();
const comments = await fetchComments();
```

**Do (parallel execution, 1 round trip):**

```typescript
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments(),
]);
```

### Server-Side Example with getAPI()

In RSVP'd server actions and tRPC routers, use `Promise.all()` when fetching multiple independent resources via `getAPI()`.

```typescript
// Don't - sequential server calls
export async function getEventPageData(eventId: string) {
  const api = await getAPI();
  const event = await api.event.getById({ id: eventId });
  const recommendations = await api.ai.getRecommendations({ eventId });
  const community = await api.community.getByEvent({ eventId });
  return { event, recommendations, community };
}

// Do - parallel server calls
export async function getEventPageData(eventId: string) {
  const api = await getAPI();
  const [event, recommendations, community] = await Promise.all([
    api.event.getById({ id: eventId }),
    api.ai.getRecommendations({ eventId }),
    api.community.getByEvent({ eventId }),
  ]);
  return { event, recommendations, community };
}
```

### When NOT to Parallelize

- When one call depends on the result of another
- When calls share a rate-limited resource and concurrent calls would be throttled
- When error handling requires sequential rollback

---

## Bundle Optimization

### Avoid Barrel File Imports

Import directly from source files instead of barrel files to avoid loading unused modules. Barrel files (`index.js` that re-exports) in icon/component libraries can have thousands of re-exports, costing 200-800ms per import.

**Why tree-shaking doesn't always help:** When a library is marked as external (not bundled), the bundler can't optimize it.

```tsx
// Don't - deep dist paths that break on updates
import Check from "lucide-react/dist/esm/icons/check";

// Do - named imports + Vite optimizeDeps
import { Check, X, Menu } from "lucide-react";
// Ensure lucide-react is in optimizeDeps.include in next.config or vite config
```

> **NOTE:** The `components/ui/index.ts` barrel file in this repo is INTENTIONAL. It follows the ShadCN pattern where all UI primitives are re-exported from a single entry point. This rule is about avoiding NEW unnecessary barrel files in feature code, not removing existing ones. Do not create new barrel files for feature modules, page components, or utility directories.

### Vite Manual Chunks

Split heavy libraries into separate chunks so they load only when needed:

```ts
// next.config or vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["chart.js", "react-chartjs-2"],
          animation: ["framer-motion"],
        },
      },
    },
  },
};
```

### Dynamic Imports for Heavy Components

Use `next/dynamic` or `React.lazy` for components that aren't needed on initial render:

```tsx
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), {
  loading: () => <MapSkeleton />,
  ssr: false,
});
```

---

## Re-render Optimization

### Use Lazy State Initialization

Pass a function to `useState` for expensive initial values. Without the function form, the initializer runs on every render even though the value is only used once.

```tsx
// Don't (runs on every render)
const [searchIndex, setSearchIndex] = useState(buildSearchIndex(items));
const [settings, setSettings] = useState(
  JSON.parse(localStorage.getItem("settings") || "{}")
);

// Do (runs only once)
const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items));
const [settings, setSettings] = useState(() => {
  const stored = localStorage.getItem("settings");
  return stored ? JSON.parse(stored) : {};
});
```

Use lazy initialization when:
- Computing from localStorage/sessionStorage
- Building data structures (indexes, maps)
- Reading from the DOM
- Performing heavy transformations

For simple primitives (`useState(0)`), direct references (`useState(props.value)`), or cheap literals (`useState({})`), the function form is unnecessary.

### Use Transitions for Non-Urgent Updates

Mark frequent, non-urgent state updates as transitions to maintain UI responsiveness.

```tsx
// Don't (blocks UI on every scroll)
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
}

// Do (non-blocking updates)
import { startTransition } from "react";

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => {
      startTransition(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
}
```

Good candidates for `startTransition`:
- Search/filter result updates
- List re-sorting
- Non-critical UI state (scroll position, hover effects)
- Background data refresh indicators

### Avoid Unnecessary Re-renders from Object/Array Literals

React Compiler handles memoization automatically. Do not reach for `useMemo` or `useCallback` — they add complexity for zero benefit.

```tsx
// Don't — manual memoization hooks
const filters = useMemo(() => ({ status: "published" }), []);
const handleClick = useCallback(() => { ... }, [deps]);

// Do — define constants outside the component for truly static values
const DEFAULT_FILTERS = { status: "published" } as const;

export const EventsPage = () => {
  return <EventList filters={DEFAULT_FILTERS} />;
};

// Do — for dynamic values, just compute inline (React Compiler optimizes this)
export const EventsPage = ({ status }: { status: string }) => {
  const filters = { status };
  const handleClick = () => onClick(status);
  return <EventList filters={filters} onClick={handleClick} />;
};
```

## References

- React docs on transitions: https://react.dev/reference/react/startTransition
- Next.js dynamic imports: https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading
