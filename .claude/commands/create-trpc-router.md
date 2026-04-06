Create a tRPC router for: $ARGUMENTS

## Steps
1. Create directory: server/api/routers/{domain}/
2. Create index.ts — compose sub-routers:
   ```ts
   import { createTRPCRouter } from '@/server/api/trpc'
   import { crudRouter } from './crud'
   import { listRouter } from './list'
   export const {domain}Router = createTRPCRouter({ ...crudRouter, ...listRouter })
   ```
3. Create crud.ts — mutations (create, update, delete) using protectedProcedure
4. Create list.ts — paginated queries using protectedPaginatedProcedure
5. Register in server/api/root.ts: add to appRouter

## Patterns
- Input schemas: derive from Prisma Zod models with .pick().partial()
- Errors: use TRPCErrors.*() factories from server/api/shared/errors.ts
- Mutations: check instanceof TRPCError before wrapping
- Pagination: use PaginationSchema from server/api/shared/schemas.ts
- Middleware: use .use() for computed where clauses

## Reference Skills
- trpc-patterns
