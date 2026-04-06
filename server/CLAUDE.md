# Server — Claude Code Rules

## tRPC Routers

### Procedure Types
- `publicProcedure` — No auth required, has dev delay middleware
- `protectedProcedure` — Requires authenticated session, injects `ctx.session.user`
- `paginatedProcedure` / `protectedPaginatedProcedure` — Adds `ctx.pagination` with `skip`, `take`, `createMetadata(total)`

### Router Pattern
```ts
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { TRPCErrors } from '@/server/api/shared/errors'
import { z } from 'zod'

export const myRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.prisma.model.findUnique({ where: { id: input.id } })
      if (!item) throw TRPCErrors.eventNotFound()
      return item
    }),
})
```

### Input Schemas
- Derive from Prisma-generated Zod models: `EventModel.pick({ ... }).partial({ ... })`
- Shared schemas in `server/api/shared/schemas.ts` (PaginationSchema, etc.)
- Always validate with Zod — the tRPC error formatter includes `zodError` in shape

### Error Handling
- Use `TRPCErrors.*()` factory functions from `server/api/shared/errors.ts`
- Available: `eventNotFound`, `unauthorized`, `forbidden`, `alreadyMember`, `internal`, etc.
- In mutations: catch errors, check `instanceof TRPCError` to re-throw, otherwise wrap with factory
- Never expose raw Prisma errors to clients

### Router Composition
- Sub-routers per domain in `server/api/routers/` (can split into files like `event/crud.ts`, `event/list.ts`)
- Aggregate in `server/api/root.ts` via `createTRPCRouter({ event: eventRouter, ... })`
- Types: `RouterOutput`, `RouterInput`, `AppRouter` exported from `root.ts`

### Middleware Chaining
- Use `.use()` for injecting computed context (e.g., where clauses, permission checks)
- Chain: `protectedPaginatedProcedure.input(Schema).use(customMiddleware).query(...)`
- Pattern: compute in middleware, consume in query/mutation via `ctx`

## Server Actions

### Full Pattern
```ts
'use server'
import { z } from 'zod'
import { getAPI } from '@/server/api'
import { MyErrorCodes, type ServerActionResponse } from './types'

const schema = z.object({ ... })

export async function myAction(
  _: ServerActionResponse<Data, MyErrorCodes, FormData> | null,
  formData: FormData
): Promise<ServerActionResponse<Data, MyErrorCodes, FormData>> {
  const validation = schema.safeParse(Object.fromEntries(formData.entries()))
  if (!validation.success) {
    return { success: false, error: MyErrorCodes.VALIDATION_ERROR, fieldErrors: validation.error.flatten().fieldErrors }
  }
  try {
    const api = await getAPI()
    const result = await api.model.create(validation.data)
    redirect(Routes.Main.Events.ViewBySlug(result.slug))
  } catch (error) {
    return { success: false, error: MyErrorCodes.UNEXPECTED_ERROR }
  }
}
```

### Rules
- Every action is a public endpoint — always validate inputs with Zod
- Return `ServerActionResponse<TData, TError, TFormData>` — never throw from actions
- `redirect()` must be called OUTSIDE try/catch (Next.js throws internally)
- Error codes: define an enum (`MyErrorCodes`) + error map (`MyActionErrorCodeMap`) in `constants.ts`
- Client consumption: `useActionStateWithError({ action, initialState, errorCodeMap })`
- Encrypt/avoid sensitive data in closures — they get serialized to the client

## API Helper

```ts
// In RSC or Server Actions:
import { getAPI } from '@/server/api'
const api = await getAPI()  // Creates caller with current session context
```

- `getAPI()` creates a tRPC caller with the current request's session
- Always use this, never import Prisma client directly in pages/actions
