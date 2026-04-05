---
name: testing-patterns
description: Testing patterns and requirements for Vitest, React Testing Library, and Playwright. Use when writing tests, reviewing test code, creating components with logic, or adding utility functions.
---

# Testing Patterns

## Overview

Guidelines for when, where, and how to write tests in the RSVP'd codebase. Uses Vitest as the test runner, React Testing Library for component tests, and Playwright for E2E.

## Key Principles

- Components with logic require tests
- All utility functions require tests
- Query by accessibility role first, test IDs last
- Test user-visible behavior, not component internals
- Handle async correctly

## What Requires Tests

### Components

Required for any component with logic beyond simple value rendering:

- Conditional rendering based on props/state
- Event handlers that transform data
- Complex state management
- Business logic calculations

### Utilities

All utility functions must have tests. No exceptions.

## What NOT to Test

- **ShadCN wrapper behavior**: Do not test the internal behavior of ShadCN UI components (Button, Dialog, etc.). Trust the library.
- **Pass-through components**: Components that only forward props to a child without transformation do not need tests.
- **Prisma queries directly**: Do not unit test raw Prisma calls. Test the tRPC routers or server actions that use them instead.

## Test File Location

Place test files adjacent to source files:

```
Component.tsx      -> Component.test.tsx
utils.ts           -> utils.test.ts
```

### Example Structure

```
components/
  EventCard/
    EventCard.tsx
    EventCard.test.tsx
```

## Running Tests

```bash
# Run a single test file
pnpm vitest run path/to/file.test.tsx

# Run tests in watch mode
pnpm vitest path/to/file.test.tsx
```

## RSVP'd Testing Strategy

### tRPC Routers

Test routers using `createCaller` from `@/server/api`. This invokes the full procedure including input validation and middleware.

```ts
import { describe, it, expect } from "vitest";
import { createCaller } from "@/server/api";

describe("event.list", () => {
  it("returns published events", async () => {
    const caller = createCaller({ session: mockSession, db: mockDb });
    const result = await caller.event.list({ status: "published" });
    expect(result).toHaveLength(3);
  });
});
```

### Server Actions

Mock `getAPI()` and verify Zod validation and error codes.

```ts
import { describe, it, expect, vi } from "vitest";

vi.mock("@/server/api", () => ({
  getAPI: vi.fn(),
}));

describe("createEventAction", () => {
  it("validates required fields", async () => {
    const result = await createEventAction({ name: "" });
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("calls the router on valid input", async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: "1" });
    vi.mocked(getAPI).mockResolvedValue({ event: { create: mockCreate } });

    const result = await createEventAction({ name: "Party", date: new Date() });
    expect(mockCreate).toHaveBeenCalledOnce();
  });
});
```

### Seed Logic

Test algorithm functions like `findInterestedUsers` and `selectTierForUser` in isolation with deterministic inputs.

```ts
import { describe, it, expect } from "vitest";
import { findInterestedUsers, selectTierForUser } from "./seed-utils";

describe("findInterestedUsers", () => {
  it("matches users by tag overlap", () => {
    const users = [{ id: "1", tags: ["music", "tech"] }];
    const event = { tags: ["music", "art"] };
    expect(findInterestedUsers(users, event)).toContainEqual(
      expect.objectContaining({ id: "1" })
    );
  });
});
```

### E2E with Playwright

5 critical flows to cover:

1. **Homepage**: Landing page renders, CTA visible
2. **Demo login**: Demo user can authenticate and see dashboard
3. **Discover**: Search/filter events, navigate to detail
4. **AI features**: AI-powered recommendations load
5. **Create event**: Full create flow through to confirmation

```ts
import { test, expect } from "@playwright/test";

test("homepage loads with CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /rsvp/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /get started/i })).toBeVisible();
});
```

## React Testing Library Best Practices

### Query Priority Order

1. `getByRole` - accessible role + name
2. `getByLabelText` - form inputs
3. `getByPlaceholderText` - when no label exists
4. `getByText` - non-interactive text
5. `getByDisplayValue` - filled form elements
6. `getByAltText` - images
7. `getByTitle` - title attribute
8. `getByTestId` - last resort only

### getByTestId When Semantic Query Exists

Flag `getByTestId` or `queryByTestId` when the element has an accessible role, label, or text.

```tsx
// Don't
screen.getByTestId("submit-btn");

// Do
screen.getByRole("button", { name: /submit/i });
```

### queryBy* for Positive Assertions

Use `getBy*` for existence checks (throws with a better error). Reserve `queryBy*` for asserting non-existence.

```tsx
// Don't
expect(screen.queryByRole("dialog")).toBeInTheDocument();

// Do
expect(screen.getByRole("dialog")).toBeInTheDocument();

// Do - queryBy is correct for non-existence
expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
```

### Use findBy* Instead of waitFor + getBy

```tsx
// Don't
await waitFor(() => screen.getByText("Loaded"));

// Do
await screen.findByText("Loaded");
```

### No Side Effects Inside waitFor

Only assertions belong in `waitFor`.

```tsx
// Don't
await waitFor(() => {
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByText("Done")).toBeInTheDocument();
});

// Do
fireEvent.click(screen.getByRole("button"));
await screen.findByText("Done");
```

### Prefer userEvent Over fireEvent

`userEvent` simulates real user behavior more accurately.

```tsx
// Don't
fireEvent.change(input, { target: { value: "hello" } });

// Do
await userEvent.type(input, "hello");
await userEvent.click(button);
```

### Test Behavior, Not Implementation

```tsx
// Don't - testing internal state
expect(component.state.isOpen).toBe(true);

// Don't - testing CSS classes
expect(button).toHaveClass("btn-primary-active");

// Do - test visible behavior
await userEvent.click(screen.getByRole("button", { name: /open/i }));
expect(screen.getByRole("dialog")).toBeVisible();
```

### No Redundant act() Wrapping

`render`, `fireEvent`, and `userEvent` already call `act` internally.

```tsx
// Don't
await act(async () => {
  render(<MyComponent />);
});

// Do
render(<MyComponent />);
```

### Use screen Instead of Destructuring render

```tsx
// Don't
const { getByRole } = render(<MyComponent />);

// Do
render(<MyComponent />);
expect(screen.getByRole("button")).toBeInTheDocument();
```

### Use Domain-Specific Matchers

```tsx
// Don't
expect(button.disabled).toBe(true);

// Do
expect(button).toBeDisabled();
expect(input).toHaveValue("hello");
expect(element).not.toBeVisible();
expect(checkbox).toBeChecked();
```

### Handle Async Properly

```tsx
// Don't - state update isn't awaited
test("loads user", () => {
  render(<UserProfile />);
  expect(screen.getByText("John")).toBeInTheDocument();
});

// Do
test("loads user", async () => {
  render(<UserProfile />);
  expect(await screen.findByText("John")).toBeInTheDocument();
});
```

### Avoid Snapshot Overuse

```tsx
// Don't - brittle, hard to review
expect(container).toMatchSnapshot();

// Do - assert on specific behavior
expect(screen.getByRole("heading")).toHaveTextContent("Welcome");
expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
```

## References

- Vitest docs: https://vitest.dev/
- Testing Library queries priority: https://testing-library.com/docs/queries/about#priority
- Common mistakes with React Testing Library: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
