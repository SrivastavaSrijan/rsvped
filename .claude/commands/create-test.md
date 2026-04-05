Create tests for: $ARGUMENTS

## Steps
1. Read the target file to understand exports and behavior
2. Create test file at __tests__/{filename}.test.ts (or colocated .test.ts)
3. Structure: describe block per exported function, it block per behavior

## Framework: Vitest
- Import: import { describe, it, expect, vi } from 'vitest'
- Mocking: vi.mock('@/server/api') for getAPI, vi.fn() for functions
- Use screen.getByRole over getByTestId (Testing Library query priority)
- Use userEvent over fireEvent for realistic interactions
- Use findBy* for async assertions (not waitFor + getBy)

## Test Patterns by Type
- **tRPC Router**: use createCaller from @/server/api with mock context
- **Server Action**: mock getAPI(), verify Zod validation, error code returns
- **Component**: render, userEvent for interaction, screen.getByRole for assertions
- **Utility**: direct function call, assert return value

## Rules
- One assertion concern per test
- Descriptive names: "should return validation error when title is empty"
- Behavior > coverage — skip trivial pass-throughs
- No snapshot tests for full component trees

## Reference Skills
- testing-patterns
