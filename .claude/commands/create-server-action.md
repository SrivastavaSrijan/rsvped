Create a server action for: $ARGUMENTS

## Steps
1. Define Zod schema for form data validation
2. Define error code enum in server/actions/types.ts (if new domain)
3. Define error code map in server/actions/constants.ts
4. Create the action function in server/actions/{domain}.ts following this pattern:
   - 'use server' directive
   - Accept (prevState, formData) signature
   - safeParse with Zod schema → return fieldErrors on failure
   - Call getAPI() for data operations
   - Wrap in try/catch, return error codes on failure
   - redirect() OUTSIDE try/catch on success
   - Return ServerActionResponse<TData, TError, TFormData>
5. Export from server/actions/index.ts barrel

## Security
- Every action is a public endpoint — validate ALL inputs
- Never trust FormData directly
- Never serialize sensitive data in closures

## Client Integration
Use useActionStateWithError hook:
```tsx
const { formAction, errorComponent, isPending } = useActionStateWithError({
  action: myAction,
  initialState: { success: false },
  errorCodeMap: MyActionErrorCodeMap,
})
```

## Reference Skills
- server-actions
