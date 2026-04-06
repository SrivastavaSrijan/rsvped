---
name: trpc-patterns
description: Pattern enforcement for tRPC routers in RSVP'd — covers procedure types, input schemas from Prisma Zod models, error handling with TRPCErrors factories, middleware chaining, router composition, and getAPI() usage.
---

# tRPC Patterns

## Procedure Types

Defined in `server/api/trpc.ts` and `server/api/shared/middleware.ts`:

| Procedure | Auth | Pagination | Use For |
|-----------|------|------------|---------|
| `publicProcedure` | No | No | Public reads (event discovery, categories) |
| `protectedProcedure` | Yes | No | Mutations, user-specific queries |
| `paginatedProcedure` | No | Yes | Public paginated lists |
| `protectedPaginatedProcedure` | Yes | Yes | User's event lists, managed items |

All procedures include a dev delay middleware for simulating latency in development.

### protectedProcedure

Enforces auth and narrows `ctx.session` to non-nullable:

```ts
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw TRPCErrors.unauthorized()
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const protectedProcedure = baseProcedure.use(enforceUserIsAuthed)
```

### paginatedProcedure

Merges `PaginationSchema` into input and injects `ctx.pagination`:

```ts
export const paginatedProcedure = publicProcedure
  .input(PaginationSchema)
  .use(async ({ input, next }) => {
    const { page, size } = input
    return next({
      ctx: {
        pagination: {
          page, size,
          skip: (page - 1) * size,
          take: size,
          createMetadata: (total: number) => createPaginationMetadata(page, size, total),
        },
      },
    })
  })
```

Use `ctx.pagination.skip` and `ctx.pagination.take` in Prisma queries, then call `ctx.pagination.createMetadata(total)` for the response.

### PaginationSchema

From `server/api/shared/schemas.ts`:

```ts
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  size: z.number().int().min(1).max(100).default(5),
})
```

## Input Schemas from Prisma Zod Models

Derive input types from generated Prisma Zod models using `.pick()` and `.partial()`:

```ts
import { EventModel } from '@/server/api/routers/zod'

const CreateEventInput = EventModel.pick({
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  timezone: true,
  locationType: true,
  venueName: true,
  venueAddress: true,
  onlineUrl: true,
  capacity: true,
  requiresApproval: true,
  coverImage: true,
}).partial({
  description: true,
  venueName: true,
  venueAddress: true,
  onlineUrl: true,
  capacity: true,
  requiresApproval: true,
  coverImage: true,
})

const UpdateEventInput = CreateEventInput.partial().extend({
  slug: z.string(),
})
```

- `pick()` selects which fields the client can send.
- `partial()` makes optional fields nullable.
- Update inputs extend create inputs with `.partial()` + identifier.

## Error Handling with TRPCErrors Factories

All errors go through factory functions in `server/api/shared/errors.ts`:

```ts
// Available factories:
TRPCErrors.eventNotFound()       // NOT_FOUND
TRPCErrors.communityNotFound()   // NOT_FOUND
TRPCErrors.unauthorized()        // UNAUTHORIZED
TRPCErrors.forbidden()           // FORBIDDEN
TRPCErrors.eventEditForbidden()  // FORBIDDEN
TRPCErrors.alreadyMember()       // CONFLICT
TRPCErrors.alreadyRegistered()   // CONFLICT
TRPCErrors.eventFull()           // BAD_REQUEST
TRPCErrors.internal()            // INTERNAL_SERVER_ERROR
TRPCErrors.eventCreateFailed()   // INTERNAL_SERVER_ERROR
TRPCErrors.eventUpdateFailed()   // INTERNAL_SERVER_ERROR
```

### Mutation Error Pattern

In mutations, catch errors, re-throw if already a TRPCError, otherwise wrap:

```ts
.mutation(async ({ ctx, input }) => {
  try {
    const event = await ctx.prisma.event.create({ data: { ... } })
    return event
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error  // re-throw known errors (NOT_FOUND, FORBIDDEN, etc.)
    }
    console.error('Error creating event:', error)
    throw TRPCErrors.eventCreateFailed()  // wrap unknown errors
  }
})
```

Never expose raw Prisma errors to clients.

## Middleware Chaining for Computed Context

Use `.use()` to inject computed values into context before the query/mutation runs. Then consume them via `ctx`:

```ts
const eventListBaseProcedure = protectedPaginatedProcedure
  .input(GetEventsInput)
  .use(async ({ ctx, input, next }) => {
    const user = ctx.session?.user
    if (!user) throw TRPCErrors.unauthorized()
    return next({ ctx: { whereClause: buildWhereClause(input, user), user } })
  })

// Query consumes the computed context:
eventListBaseProcedure.query(async ({ ctx }) => {
  const events = await ctx.prisma.event.findMany({
    where: ctx.whereClause,
    skip: ctx.pagination.skip,
    take: ctx.pagination.take,
  })
})
```

## Router Composition

### Sub-Router Definition

Each domain gets its own router file(s) under `server/api/routers/`:

```ts
// server/api/routers/event/crud.ts
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { TRPCErrors } from '@/server/api/shared/errors'

export const eventCrudRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateEventInput)
    .mutation(async ({ ctx, input }) => { ... }),

  update: protectedProcedure
    .input(UpdateEventInput)
    .mutation(async ({ ctx, input }) => { ... }),
})
```

### Root Router Registration

All sub-routers are composed in `server/api/root.ts`:

```ts
export const appRouter = createTRPCRouter({
  stir: stirRouter,
  event: eventRouter,
  rsvp: rsvpRouter,
  image: imageRouter,
  category: categoryRouter,
  location: locationRouter,
  community: communityRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
```

Use `RouterOutput` and `RouterInput` for typing throughout the app (e.g., `RouterOutput['event']['create']`).

## getAPI() for Server-Side Callers

From `server/api/index.ts` — use in RSC pages and server actions:

```ts
import { getAPI } from '@/server/api'

// In a server component or server action:
const api = await getAPI()
const events = await api.event.list({ page: 1, size: 10 })
```

`getAPI()` creates a tRPC caller with the current request's session context. Never import Prisma directly in pages or actions.

## Context Shape

The tRPC context provides `session` (Session | null, non-null after `protectedProcedure`) and `prisma` (PrismaClient). The error formatter automatically attaches `zodError` (flattened) to the response shape when a Zod validation error occurs.

## Do / Don't

### DON'T: use raw Prisma in pages or actions

```ts
import { prisma } from '@/lib/prisma' // WRONG
```

### DO: use getAPI()

```ts
const api = await getAPI()
const events = await api.event.list({ page: 1, size: 10 })
```

### DON'T: create TRPCError manually

```ts
throw new TRPCError({ code: 'NOT_FOUND', message: 'event missing' }) // WRONG
```

### DO: use TRPCErrors factories

```ts
throw TRPCErrors.eventNotFound()
```

### DON'T: swallow TRPCErrors in catch blocks

```ts
catch (error) { throw TRPCErrors.internal() } // WRONG — loses original error
```

### DO: re-throw TRPCErrors, wrap others

```ts
catch (error) {
  if (error instanceof TRPCError) throw error
  throw TRPCErrors.internal()
}
```

### DON'T: write raw pagination logic — use paginatedProcedure

```ts
// WRONG: manual skip/take
.query(async ({ ctx, input }) => { const skip = (input.page - 1) * input.size })

// CORRECT: use ctx.pagination from paginatedProcedure
.query(async ({ ctx }) => {
  const [items, total] = await Promise.all([
    ctx.prisma.model.findMany({ skip: ctx.pagination.skip, take: ctx.pagination.take }),
    ctx.prisma.model.count(),
  ])
  return { data: items, pagination: ctx.pagination.createMetadata(total) }
})
```
