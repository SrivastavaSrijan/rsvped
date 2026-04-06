---
name: typescript-type-safety
description: Type safety rules including no any type, explicit null checks, satisfies operator, and RouterOutput types. Use when writing TypeScript, handling nullable values, or reviewing type definitions.
---

# TypeScript Type Safety

## Overview

Enforce strict type safety by avoiding `any` and using explicit null checks instead of type assertions.

## Key Principles

- Never use `any` type - always define proper interfaces
- Never use `!` (non-null assertion) to bypass null checks
- Never use `as Type` to force type casting
- Always handle null/undefined explicitly with conditionals
- Prefer `satisfies` over `as` for type validation
- Prefer `interface` over `type` for object shapes
- Use `RouterOutput` types for component props

## Do's and Don'ts

### No `any` Type

If tempted to use `any`, create a specific interface instead.

```ts
// Don't
function processData(data: any) { ... }

// Do
interface UserData {
  id: string;
  name: string;
}
function processData(data: UserData) { ... }
```

### Explicit Null Checks Required

```ts
// Don't - non-null assertion
someFunction(someState!);

// Don't - type casting
someFunction(someState as string);

// Do - explicit check
if (!someState) return;
someFunction(someState);
```

### Exception: After Verified Boolean Check

After a verified boolean check, `!` is acceptable:

```tsx
const isDefined = !!someState && someState.length > 0;

// OK - we verified above
{isDefined && someState!.map(...)}
```

### Prefer `satisfies` Over `as`

Use `satisfies` to validate a value matches a type without widening or narrowing it. This catches errors at the assignment site rather than at usage.

```ts
// Don't - `as` silently discards type errors
const config = {
  apiUrl: "https://api.example.com",
  retries: "three", // bug: should be number
} as AppConfig; // no error!

// Do - `satisfies` validates without changing the inferred type
const config = {
  apiUrl: "https://api.example.com",
  retries: "three", // ERROR: Type 'string' is not assignable to type 'number'
} satisfies AppConfig;

// Do - `satisfies` preserves literal types
const routes = {
  home: "/",
  events: "/events",
  discover: "/discover",
} satisfies Record<string, string>;
// routes.home is typed as "/" not string
```

### Use `RouterOutput` Types for Component Props

Always derive component prop types from tRPC router output types instead of creating custom interfaces. This keeps types in sync with the API automatically.

```ts
// Don't - custom interface that can drift from the API
interface EventCardProps {
  id: string;
  name: string;
  date: Date;
  location: string;
}

// Do - derive from router output
import { type RouterOutput } from "@/server/api";

type EventListItem = RouterOutput["event"]["list"][number];

function EventCard({ event }: { event: EventListItem }) { ... }
```

This pattern works for any router procedure:

```ts
type EventDetail = RouterOutput["event"]["getById"];
type CommunityList = RouterOutput["community"]["list"];
type SearchResults = RouterOutput["search"]["global"];
```

### Prefer `interface` Over `type` for Object Shapes

Use `interface` for object shapes - they produce clearer error messages and support declaration merging. Reserve `type` for unions, intersections, and mapped types.

```ts
// Don't - type alias for object shape
type EventFormValues = {
  name: string;
  date: Date;
  description: string;
};

// Do - interface for object shape
interface EventFormValues {
  name: string;
  date: Date;
  description: string;
}

// Do - type for unions and utility types
type EventStatus = "draft" | "published" | "cancelled";
type EventWithHost = EventFormValues & { hostId: string };
```

## Why This Matters

1. **Type assertions hide bugs**: `as Type` and `!` tell TypeScript to trust you, but the runtime doesn't
2. **`any` defeats TypeScript**: Using `any` removes all type checking benefits
3. **Explicit checks are documentation**: Conditionals make null handling visible to readers
4. **`satisfies` catches errors earlier**: Validates at the definition site, not at usage
5. **`RouterOutput` prevents drift**: API changes propagate to components automatically
