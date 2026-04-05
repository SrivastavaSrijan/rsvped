Review this code against RSVP'd conventions: $ARGUMENTS

If $ARGUMENTS is a file path, read that file. If "--staged", review git staged changes.

## Checklist

### Imports & Modules
- [ ] Path aliases only (@/lib, @/components/ui, @/server/api)
- [ ] No relative imports (../../)
- [ ] No import * as React

### React 19
- [ ] No useCallback, useMemo, React.memo
- [ ] No forwardRef (use ref as prop)
- [ ] No useEffect for data fetching (use RSC or tRPC hooks)
- [ ] No useFormState (use useActionState)
- [ ] Ternary for conditional JSX (not &&)
- [ ] No components defined inside render

### Data Flow
- [ ] RouterOutput types for component props (not custom interfaces)
- [ ] tRPC hooks for client data fetching
- [ ] getAPI() for server-side fetching
- [ ] Server Actions for mutations (not direct API calls)

### Styling
- [ ] Tailwind tokens only (no var(), no arbitrary values, no inline styles)
- [ ] flex + gap (not margin utilities)
- [ ] size-* for icons (not h-*/w-*)
- [ ] cn() for conditional classes
- [ ] No new CSS files

### TypeScript
- [ ] No any type
- [ ] No as type assertion (use satisfies or explicit checks)
- [ ] interface over type for objects

### Server Actions
- [ ] Zod validation on all inputs
- [ ] redirect() outside try/catch
- [ ] Returns ServerActionResponse

### Next.js 15
- [ ] await on params, cookies(), headers()
- [ ] <Link> for navigation (not <a>)
- [ ] loading.tsx for async pages

## Output Format
For each violation found, report:
- Line number
- Rule violated
- Fix suggestion
