---
name: review-hooks
description: React hooks anti-pattern review rules. Use when reviewing code for hooks misuse, stale closures, missing cleanup, dependency array issues, or infinite loop risks.
---

# Hooks Anti-Patterns Review

## Overview

Rules for catching common React hooks mistakes that lead to bugs, memory leaks, stale state, and infinite loops. Complements the `using-useEffects` skill with broader hooks coverage.

## Key Principles

- Dependency arrays must be complete and use stable references
- Effects that create subscriptions or async work need cleanup
- State that can be derived should not be stored
- Custom hooks should contain actual hooks -- otherwise they're just functions

## Review Rules

### Async useEffect Without Cleanup

Flag effects that do async work (fetch, setTimeout, subscriptions) without a cleanup function. This causes memory leaks and state-updates-on-unmounted-component bugs.

```tsx
// Bad -- no way to cancel if component unmounts
useEffect(() => {
  fetch(`/api/users/${id}`)
    .then((res) => res.json())
    .then((data) => setUser(data));
}, [id]);

// Good -- use AbortController
useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => setUser(data))
    .catch((err) => {
      if (err.name !== "AbortError") throw err;
    });

  return () => controller.abort();
}, [id]);

// Better -- use tRPC (project standard)
const { data: user } = trpc.user.getById.useQuery({ id });
```

### Infinite Loop Risk

Flag effects where a dependency is set inside the effect body.

```tsx
// Bad -- count changes -> effect runs -> count changes -> ...
useEffect(() => {
  setCount(count + 1);
}, [count]);

// Good -- functional updater removes the dependency
useEffect(() => {
  setCount((c) => c + 1);
}, []);

// Better -- question whether the effect is needed at all
```

### useRef for Reactive Data

Flag `useRef` used for values that should trigger re-renders. Ref mutations don't cause re-renders, leading to stale UI.

```tsx
// Bad -- UI won't update when count changes
const countRef = useRef(0);
const increment = () => {
  countRef.current += 1;
  // UI still shows old value
};
return <span>{countRef.current}</span>;

// Good -- use state for values shown in UI
const [count, setCount] = useState(0);
const increment = () => setCount((c) => c + 1);
return <span>{count}</span>;
```

### Multiple Related useState Calls

Flag 4+ `useState` calls managing related state. Suggest `useReducer` to consolidate.

```tsx
// Bad -- these are all related form state
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");
const [errors, setErrors] = useState<Record<string, string>>({});

// Good -- consolidate with useReducer
interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  errors: Record<string, string>;
}

const [form, dispatch] = useReducer(formReducer, initialFormState);
```

### Fake Hooks (use* Without Hooks)

Flag functions prefixed with `use` that call no React hooks internally. This misleads developers about function behavior and violates the Rules of Hooks convention.

```tsx
// Bad -- no hooks inside, misleading name
function useFormatDate(date: Date): string {
  return date.toLocaleDateString("en-US");
}

// Good -- rename to a plain utility
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US");
}
```

### Derived State in useState

Flag `useState` for values that are pure derivations of other state or props. This leads to sync bugs and unnecessary re-renders.

```tsx
// Bad -- fullName is derived from first + last
const [first, setFirst] = useState("Jane");
const [last, setLast] = useState("Doe");
const [fullName, setFullName] = useState("Jane Doe");

useEffect(() => {
  setFullName(`${first} ${last}`);
}, [first, last]);

// Good -- compute during render
const [first, setFirst] = useState("Jane");
const [last, setLast] = useState("Doe");
const fullName = `${first} ${last}`;
```

### Missing Cleanup for Timers and Subscriptions

Flag `setTimeout`, `setInterval`, `addEventListener`, or WebSocket connections in effects without cleanup.

```tsx
// Bad -- interval keeps running after unmount
useEffect(() => {
  const id = setInterval(() => tick(), 1000);
}, []);

// Good
useEffect(() => {
  const id = setInterval(() => tick(), 1000);
  return () => clearInterval(id);
}, []);
```

### setState in Render

Flag calling `setState` directly in the render body (outside of event handlers or effects). This causes infinite re-render loops.

```tsx
// Bad -- triggers re-render during render
const Counter = ({ initial }: { initial: number }) => {
  const [count, setCount] = useState(0);
  setCount(initial); // infinite loop
  return <span>{count}</span>;
};

// Good -- initialize via useState
const Counter = ({ initial }: { initial: number }) => {
  const [count, setCount] = useState(initial);
  return <span>{count}</span>;
};
```

## References

- Effects guide: `./using-useEffects` skill
- React hooks rules: https://react.dev/reference/rules/rules-of-hooks
- tRPC routers: `@/server/api/routers/`
