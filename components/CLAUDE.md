# Components — Claude Code Rules

## ShadCN UI

### Imports
- Always import from the barrel: `import { Button, Input, Card } from '@/components/ui'`
- Never import directly from `shadcn-ui` package or individual files

### Button vs Link
- `<Button>` is for actions (onClick, form submit). Never wrap `<Link>` inside `<Button>`.
- For navigation that looks like a button: use `<Link className={cn(buttonVariants({ variant: "default" }))}>`
- Import `buttonVariants` alongside `Button` from `@/components/ui`

### Loading States
- Use ShadCN's `Skeleton` component for loading states
- Pair with `loading.tsx` files and `<Suspense>` boundaries

## Component Patterns

### RSC vs Client
- Default to React Server Components (no directive needed)
- Add `"use client"` only when the component needs: hooks, event handlers, browser APIs, or local state
- Never pass server-only handlers or data to client components
- Keep client components as leaves — push `"use client"` boundary as deep as possible

### Props Typing
```ts
import type { RouterOutput } from '@/server/api'

interface EventCardProps {
  event: RouterOutput['event']['list']['data'][number]
}
```
- Always use `RouterOutput` types for data from tRPC — never create parallel interfaces
- Destructure props in the function signature: `({ title, startDate, host }: EventCardProps)`
- Use `interface` over `type` for component props

### Component Structure
```ts
'use client' // only if needed

// 1. Imports (react → next → libraries → local)
// 2. Types/interfaces
// 3. Constants (default props, configs)
// 4. Exported component (arrow function)
// 5. Sub-components (extracted, not inline)
// 6. Helpers (pure functions)
```

### Reuse Patterns
- Create/edit forms share one component with `mode: 'create' | 'edit'` prop
- Route-colocated components live in `app/(group)/feature/components/`
- Reusable components go in `components/shared/`
- Barrel exports via `index.ts` in each components directory — no logic in barrels

### Forms
- Use `<Form>` from `@/components/shared` (prevents accidental reset)
- Wire server actions via `useActionStateWithError` hook
- Error display: `errorCodeMap` renders user-friendly messages from error codes
- Use native HTML validation (`required`, `type="email"`) alongside Zod server-side

## Styling

### Tailwind v4 Tokens
- All colors, spacing, radii, fonts defined in `app/theme.css` via `@theme` block
- Use only mapped utilities: `bg-brand`, `text-text-primary`, `border-border-primary`
- Never use `var(...)` in className or arbitrary values like `h-[123px]`
- No `tailwind.config.ts` — v4 configures via CSS

### Layout
- `flex` + `gap` for spacing — avoid margin utilities (`mb-4`, `mt-2`)
- Mobile-first: base styles for mobile, `lg:` for desktop. Avoid `md:` and `sm:`
- Max widths: `max-w-page` (820px) and `max-w-wide-page` (960px)
- Use `cn()` utility for conditional class merging

### Icons
- Lucide React icons only
- Size with `size-*` (e.g., `size-4`), never `h-*`/`w-*`

### Tailwind v4 Gotchas
- `shadow-sm` is now `shadow-xs`, `shadow` is now `shadow-sm`
- `ring` defaults to 1px (use `ring-3` for old 3px behavior)
- `outline-none` → `outline-hidden`
- Opacity: `bg-black/50`, not `bg-opacity-50`
- `flex-shrink-*` → `shrink-*`, `flex-grow-*` → `grow-*`
- Buttons default to `cursor: default` — add `cursor-pointer` explicitly if needed

## React 19 Patterns

- No `useCallback`, `useMemo` unless you've measured a real perf issue
- `ref` is a standard prop — `forwardRef` is deprecated
- `useEffect` is an escape hatch: prefer event handlers, server-side fetching, `useSyncExternalStore`
- Always clean up `useEffect` side effects (return cleanup function)
- `useActionState` replaces `useFormState` — never use the old API
- `useOptimistic` for optimistic UI on mutations
- Conditional JSX: `{condition ? <El /> : null}` not `{condition && <El />}`
- Never define components inside render — extract as siblings
- Set `displayName` on complex components or context providers
- Define default props as constants outside the component, not inline objects/arrays
