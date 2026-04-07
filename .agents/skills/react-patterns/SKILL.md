---
name: react-patterns
description: React component structure, JSX patterns, and conditional rendering rules. Use when creating components, writing JSX, handling events, passing props, or reviewing component architecture.
---

# React Patterns

## Overview

Unified guidelines for structuring React components, writing JSX, handling events, and conditional rendering in the RSVP'd codebase.

## Key Principles

- Functional components only (no class components)
- Arrow functions for component definitions (not function declarations)
- One component per file
- No memoization hooks -- React Compiler handles this
- Avoid `useEffect` for state management
- Use ternaries over `&&` in JSX
- Follow event handler naming conventions

---

## Component Structure

### Arrow Function Components

Always use arrow functions for component definitions, not function declarations.

```tsx
// Bad
export function MyComponent({ name }: MyComponentProps) {
  return <div>{name}</div>;
}

// Good
export const MyComponent = ({ name }: MyComponentProps) => {
  return <div>{name}</div>;
};
```

### One Component Per File

Keep files focused. Extract related components into the same folder.

```
components/
  EditRsvpDialog/
    EditRsvpDialog.tsx
    EditRsvpDialog.test.tsx
    ConfirmCancelDialog.tsx
```

### No Memoization Hooks

**Never use:** `useMemo`, `useCallback`, `React.memo`

React Compiler handles all memoization automatically. These hooks add complexity without benefit.

```tsx
// Bad
const memoizedValue = useMemo(() => computeValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => handleClick(id), [id]);

// Good -- just compute directly
const value = computeValue(a, b);
const handleClick = () => { /* ... */ };
```

### Avoid useEffect for State

Use `useEffect` only for external system synchronization (DOM measurement, browser APIs, third-party widgets, WebSockets).

**Never use useEffect for:**
- Setting state based on props/state changes (compute during render)
- Data fetching (use `getAPI()` in RSCs)
- Calculations (do in render)
- Reacting to prop/state changes (restructure data flow)
- "On mount" initialization (use lazy state initializer)

```tsx
// Bad -- useEffect for derived state
useEffect(() => { setSelection(null); }, [items]);

// Good -- Calculate during render
const selection = items.find(item => item.id === selectedId) ?? null;
```

See `./using-useEffects` skill for detailed guidance.

### No Gratuitous useRef

`useRef` is for DOM element references and mutable values that don't trigger re-renders (e.g., third-party instance handles). Do not reach for `useRef` to work around dependency arrays, track "previous" values, or cache computed results.

Valid `useRef` uses:

| Valid | Example |
|-------|---------|
| DOM element reference | `inputRef` for focus management |
| Third-party instance handle | Chart library instance |
| Mutable session tracking | WebSocket session state |

**Never use useRef for:**
- Storing "previous" values to diff against (restructure data flow)
- Avoiding dependency array issues (fix the dependency)
- Caching computed values (React Compiler handles memoization)
- Tracking state to prevent feedback loops (simplify the state model)

```tsx
// Bad -- ref as escape hatch from complex state
const lastPushedRef = useRef(initialValue);
useEffect(() => {
  if (currentValue !== lastPushedRef.current) {
    lastPushedRef.current = currentValue;
    setLocalState(currentValue);
  }
}, [currentValue]);

// Good -- simplify the state model
// Let the URL be the source of truth, derive state from it
const query = searchParams.get("q") ?? "";
```

---

## Typing Component Props with RouterOutput

Use `RouterOutput` types from tRPC for component props instead of manually defining types that mirror API responses.

```tsx
import { type RouterOutput } from "@/server/api";

// Derive prop types from your tRPC router output
type Event = RouterOutput["event"]["getById"];

interface EventCardProps {
  event: Event;
  onRsvp?: (eventId: string) => void;
}

export const EventCard = ({ event, onRsvp }: EventCardProps) => {
  return (
    <div>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
    </div>
  );
};
```

This keeps component types in sync with API changes automatically.

---

## Data Fetching

All data fetching goes through `getAPI()` in React Server Components. Client components receive data as props — they never fetch directly.

```tsx
// Bad -- client-side tRPC hooks
const { data: events } = trpc.event.list.useQuery();
const { data: event } = trpc.event.getById.useQuery({ id: eventId });

// Bad -- raw fetch or SWR
const { data } = useSWR("/api/events", fetcher);

// Good -- fetch in RSC with getAPI(), pass as props
// In page.tsx (RSC):
import { getAPI } from "@/server/api";

export default async function EventsPage() {
  const api = await getAPI();
  const events = await api.event.list({ page: 1, size: 10 });
  return <EventsList events={events} />;
}

// In EventsList.tsx (client component):
"use client";
interface EventsListProps {
  events: RouterOutput["event"]["list"];
}
export const EventsList = ({ events }: EventsListProps) => {
  // render from props — no fetching here
};
```

For mutations, use server actions with `useActionStateWithError`, not `trpc.useMutation()`.

```tsx
// Bad -- client-side mutation
const { mutate: rsvp } = trpc.rsvp.create.useMutation();

// Good -- server action
const { formAction, isPending } = useActionStateWithError({
  action: rsvpAction,
  initialState: null,
  errorCodeMap: RsvpActionErrorCodeMap,
});
```

---

## Reusable Components

### Prefer Existing Components

If a reusable component exists that fits your needs, use it instead of creating custom elements. If no suitable component exists, ask the user before creating a new one.

```tsx
// Bad -- use raw HTML elements when a shared component exists
<button type="button" onClick={onClick} className="...">
  Click me
</button>

// Good -- use the shared Button component from the barrel
import { Button } from "@/components/ui";

<Button variant="default" onClick={onClick}>
  Click me
</Button>
```

Check `@/components/shared/` and `@/components/ui/` for available components before building custom solutions.

---

## JSX Patterns

### Ternaries Over && in JSX

Prevents rendering "0" or "undefined" bugs.

```tsx
// Bad -- can render "0" if count is 0
{count && <Chip label={count} />}

// Good
{count ? <Chip label={count} /> : null}
```

For numeric conditions, be explicit:

```tsx
// Bad (renders "0" when count is 0)
{count && <span className="badge">{count}</span>}

// Good (renders nothing when count is 0)
{count > 0 ? <span className="badge">{count}</span> : null}
```

### Event Handler Naming

- Props: `on{Event}` (e.g., `onChange`, `onSubmit`)
- Functions: `handle{Event}` (e.g., `handleChange`, `handleSubmit`)

```tsx
<Input onChange={handleInputChange} />
```

### Don't Pass setState as Props

Pass event handlers instead for better separation of concerns.

```tsx
// Bad
<Bar setSomeState={setSomeState} />

// Good
<Bar onSomeEvent={() => setSomeState({})} />
```

### Avoid Prop Spreading

Be explicit about which props are passed.

```tsx
// Bad
<MyComponent {...props} />

// Good
<MyComponent count={props.count} name={props.name} />
```

**Exceptions allowed:**
- Spreading onto DOM elements
- Wrapper components passing to third-party libraries

### Arrow Functions Inside Components

Use arrow functions for handlers defined within components.

```tsx
export const MyComponent = () => {
  const handleClick = () => {
    // handler logic
  };

  return <button onClick={handleClick}>Click</button>;
};
```

---

## File Organization

### Group Related Components

Keep extracted sub-components in the same folder as the main component.

```
components/
  EventCard/
    EventCard.tsx
    EventCard.test.tsx
    EventCardActions.tsx
    EventCardActions.test.tsx
```

Name extracted components descriptively, or prefix with parent name (e.g., `EventCardActions`).

---

## Why These Patterns Matter

1. **Arrow functions**: Consistent style, prevents `this` confusion, aligns with modern React
2. **Ternaries prevent bugs**: `&&` with falsy values (0, "") renders the falsy value
3. **Naming conventions**: Make code predictable and searchable
4. **Explicit props**: Easier to trace data flow and refactor
5. **Event handlers over setState**: Better encapsulation and testability
6. **RouterOutput types**: Single source of truth for API-derived props

## References

- Effects guide: `./using-useEffects` skill
- Hooks review: `./review-hooks` skill
- Shared components: `@/components/shared/`, `@/components/ui/`
- tRPC routers: `@/server/api/routers/`
