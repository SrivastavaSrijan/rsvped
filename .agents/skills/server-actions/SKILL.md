---
name: server-actions
description: Pattern enforcement for Next.js server actions in RSVP'd — covers ServerActionResponse types, Zod validation, error code enums/maps, redirect safety, and client consumption via useActionStateWithError.
---

# Server Actions Pattern

## Core Type: ServerActionResponse

Every server action returns this discriminated response type, defined in `server/actions/types.ts`:

```ts
export type ServerActionResponse<
  TData = unknown,
  TError = string,
  TFormData = Record<string, unknown>,
> = {
  success: boolean
  data?: TData
  message?: string
  error?: TError
  fieldErrors?: Partial<Record<keyof TFormData, string[]>>
}
```

Always specialize all three generics when defining an action's response type:

```ts
export type EventActionResponse = ServerActionResponse<
  EventData,
  EventErrorCodes,
  EventFormData
>
```

## Error Code Enum + Error Code Map

Every action domain defines a pair: an enum in `types.ts` and a map in `constants.ts`.

### Enum (types.ts)

```ts
export enum EventErrorCodes {
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  CREATION_FAILED = 'CREATION_FAILED',
  UPDATE_FAILED = 'UPDATE_FAILED',
  NOT_FOUND = 'NOT_FOUND',
}
```

### Map (constants.ts)

```ts
export const EventActionErrorCodeMap: Record<EventErrorCodes, string> = {
  [EventErrorCodes.VALIDATION_ERROR]: 'Please fix the errors in the form.',
  [EventErrorCodes.UNEXPECTED_ERROR]: 'An unexpected error occurred. Please try again later.',
  [EventErrorCodes.CREATION_FAILED]: 'Failed to create the event. Please try again.',
  [EventErrorCodes.UPDATE_FAILED]: 'Failed to update the event. Please try again.',
  [EventErrorCodes.NOT_FOUND]: 'Event not found.',
  [EventErrorCodes.UNAUTHORIZED]: 'You are not authorized to perform this action.',
}
```

The map must be exhaustive (`Record<MyErrorCodes, string>`) so TypeScript catches missing entries.

## Action Function Signature

```ts
'use server'

export async function saveEvent(
  _: EventActionResponse | null,   // previous state (from useActionState)
  formData: FormData
): Promise<EventActionResponse> {
```

- First param is the previous state (always typed `| null` for initial render).
- Second param is `FormData` from the form submission.
- Return type is always the specialized `ServerActionResponse`.

## Zod Validation with safeParse

Always validate with `safeParse`, never `parse`. Return field errors on failure:

```ts
const validation = eventSchema.safeParse(transformedData)
if (!validation.success) {
  return {
    success: false,
    error: EventErrorCodes.VALIDATION_ERROR,
    fieldErrors: validation.error.flatten().fieldErrors,
  }
}
```

### Schema Definition

Define the Zod schema inside the action file. Use `.refine()` for cross-field validation:

```ts
const eventSchema = z
  .object({
    title: z.string().min(1, 'Title is required.'),
    startDate: z.string().transform((val) => new Date(val)),
    locationType: z.nativeEnum(LocationType),
    onlineUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
    capacity: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)).optional(),
  })
  .refine(
    (data) => data.startDate < data.endDate,
    { message: 'End date must be after start date.', path: ['endDate'] }
  )
```

## Data Mutation via getAPI()

Never import Prisma directly. Use the tRPC server caller:

```ts
const api = await getAPI()
event = await api.event.create(validation.data)
```

## CRITICAL: redirect() Outside try/catch

`redirect()` throws an internal Next.js error. If called inside `try/catch`, the catch block swallows it and the redirect silently fails.

```ts
// After the try/catch block:
if (event) {
  redirect(Routes.Main.Events.ManageBySlug(event.slug))
}
return { success: true, data: event, message: 'Event created successfully.' }
```

## Error Handling in try/catch

Map tRPC error codes to action error codes. Re-throw nothing — always return a response:

```ts
try {
  const api = await getAPI()
  event = await api.event.create(validation.data)
} catch (error) {
  if (error && typeof error === 'object' && 'code' in error) {
    if (error.code === 'UNAUTHORIZED') {
      return { success: false, error: EventErrorCodes.UNAUTHORIZED }
    }
    if (error.code === 'NOT_FOUND') {
      return { success: false, error: EventErrorCodes.NOT_FOUND }
    }
  }
  return { success: false, error: EventErrorCodes.CREATION_FAILED }
}
```

## Client Consumption: useActionStateWithError

In the client component, wire the action with the error code map:

```ts
const { state, formAction, isPending, errorComponent } = useActionStateWithError({
  action: saveEvent,
  initialState: null,
  errorCodeMap: EventActionErrorCodeMap,
  displayMode: 'inline', // or 'toast'
})
```

- `formAction` goes on the `<Form>` action prop.
- `isPending` disables the submit button.
- `errorComponent` renders the mapped error message automatically.
- `state.fieldErrors` can be used for per-field error display.

## Barrel Export

All actions are re-exported from `server/actions/index.ts`:

```ts
export * from './events'
export * from './auth'
export * from './constants'
```

## Security

Every server action is a public HTTP endpoint. Treat it like an API route:

- Validate ALL inputs with Zod — never trust FormData.
- Check authorization inside the action or via `getAPI()` (which carries the session).
- Never put secrets in action closures — they serialize to the client.
- Avoid passing sensitive data through hidden form fields.

## Do / Don't

### DON'T: redirect inside try/catch

```ts
// BROKEN — redirect throw gets caught
try {
  const result = await api.event.create(data)
  redirect(Routes.Main.Events.ViewBySlug(result.slug))  // silently fails
} catch (error) {
  return { success: false, error: MyErrorCodes.CREATION_FAILED }
}
```

### DO: redirect after try/catch

```ts
let result
try {
  const api = await getAPI()
  result = await api.event.create(data)
} catch (error) {
  return { success: false, error: MyErrorCodes.CREATION_FAILED }
}
redirect(Routes.Main.Events.ViewBySlug(result.slug))
```

### DON'T: throw from a server action

```ts
// BROKEN — client gets an unhelpful error
export async function myAction(_, formData: FormData) {
  throw new Error('Something went wrong')
}
```

### DO: return a typed error response

```ts
export async function myAction(_, formData: FormData) {
  return { success: false, error: MyErrorCodes.UNEXPECTED_ERROR }
}
```

### DON'T: skip Zod validation

```ts
// BROKEN — trusting raw FormData
const title = formData.get('title') as string
await api.event.create({ title })
```

### DO: validate everything

```ts
const validation = schema.safeParse(Object.fromEntries(formData.entries()))
if (!validation.success) {
  return { success: false, error: MyErrorCodes.VALIDATION_ERROR, fieldErrors: validation.error.flatten().fieldErrors }
}
await api.event.create(validation.data)
```
