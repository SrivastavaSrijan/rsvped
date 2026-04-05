Create a React component named $ARGUMENTS.

## Decision Tree
1. Is this an interactive component (hooks, state, events, browser APIs)? → Add "use client" directive
2. Otherwise → React Server Component (no directive)

## Template
- Import order: react → next → libraries → local (@/ aliases)
- Props: use interface, derive from RouterOutput when data comes from tRPC
- Arrow function export: `export const ComponentName = ({ ... }: Props) => { ... }`
- Use cn() for conditional classes
- Use Tailwind tokens from app/theme.css only
- Mobile-first: base styles for mobile, lg: for desktop

## Placement
- Reusable → components/shared/ComponentName.tsx
- Route-specific → app/(group)/feature/components/ComponentName.tsx
- Add to barrel export (index.ts) in the components directory

## Anti-Patterns (Never)
- No useCallback, useMemo, forwardRef
- No relative imports (use @/)
- No inline styles or arbitrary Tailwind values
- No var() in className
- No components defined inside other components

## Reference Skills
- react-patterns, tailwind-styling, typescript-type-safety
