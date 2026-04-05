---
name: shadcn-usage
description: Pattern enforcement for ShadCN UI component usage in RSVP'd — covers barrel imports, Button vs Link, Skeleton loading states, cn() utility, form elements, and Radix primitive awareness.
---

# ShadCN UI Usage Patterns

## Import from the Barrel

Always import from `@/components/ui` — never from individual component files:

```ts
// CORRECT
import { Button, Card, CardHeader, CardTitle, Input, Skeleton } from '@/components/ui'

// WRONG — never import from individual files
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

The barrel at `components/ui/index.ts` re-exports all components. This keeps imports clean and consistent.

## Available Components

The barrel exports include (non-exhaustive):

- **Layout**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction`
- **Feedback**: `Alert`, `AlertDescription`, `AlertTitle`, `Badge`, `badgeVariants`, `Skeleton`
- **Forms**: `Button`, `buttonVariants`, `Input`, `Checkbox`, `Select`, `DateTimePicker`, `Calendar`
- **Overlay**: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger`, `AlertDialog`, `DropdownMenu`
- **Navigation**: `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbList`, `BreadcrumbPage`, `BreadcrumbSeparator`
- **Data Display**: `Avatar`, `AvatarFallback`, `AvatarImage`, `AvatarWithFallback`, `Carousel`

## Button vs Link

`<Button>` is strictly for actions (onClick handlers, form submissions). Never wrap a `<Link>` inside a `<Button>`.

For navigation that should look like a button, use `buttonVariants` with `<Link>`:

```ts
import Link from 'next/link'
import { buttonVariants } from '@/components/ui'
import { cn } from '@/lib/utils'
import { Routes } from '@/lib/config'

// Navigation styled as a button
<Link
  href={Routes.Main.Events.Create}
  className={cn(buttonVariants({ variant: 'default' }))}
>
  Create Event
</Link>

// Actual action button
<Button onClick={handleSubmit} disabled={isPending}>
  Save Event
</Button>

// Form submit button
<Button type="submit" disabled={isPending}>
  Register
</Button>
```

### buttonVariants

`buttonVariants` accepts `variant` and `size` props and returns the appropriate class string:

```ts
buttonVariants({ variant: 'default' })
buttonVariants({ variant: 'outline', size: 'sm' })
buttonVariants({ variant: 'ghost', size: 'icon' })
```

## Skeleton for Loading States

Use `Skeleton` in `loading.tsx` files and `<Suspense>` fallbacks:

```ts
import { Skeleton } from '@/components/ui'

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}
```

Match the skeleton dimensions to the actual content layout for a smooth transition.

## cn() for Conditional Class Composition

Use `cn()` from `@/lib/utils` for merging Tailwind classes. Always put the `className` prop last so consumer overrides win:

```ts
import { cn } from '@/lib/utils'

// Inside a component — className prop LAST
const EventCard = ({ className, ...props }: EventCardProps) => {
  return (
    <Card className={cn('flex flex-col gap-2', className)}>
      {/* ... */}
    </Card>
  )
}

// Conditional classes
<Badge className={cn(
  'text-xs',
  isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
)}>
  {status}
</Badge>
```

### Why className Last

Tailwind class merging is order-dependent. `cn()` uses `tailwind-merge` under the hood, so putting the consumer's `className` last ensures their overrides take precedence:

```ts
// Component defines base styles, consumer can override
cn('rounded-lg p-4 bg-card', className)
//                            ^ consumer overrides win
```

## Form Elements

Use ShadCN form components for consistent styling:

```ts
import { Input, Checkbox, Select, DateTimePicker } from '@/components/ui'

<Input
  name="title"
  placeholder="Event title"
  defaultValue={event?.title}
  required
/>

<Checkbox
  name="requiresApproval"
  defaultChecked={event?.requiresApproval}
/>

<DateTimePicker
  name="startDate"
  defaultValue={event?.startDate}
/>
```

Wire form elements with server actions via the `<Form>` component from `@/components/shared` (not the ShadCN Form). Use native HTML validation attributes (`required`, `type="email"`, `min`, `max`) alongside Zod server-side validation.

## ShadCN Components Are Radix Wrappers

ShadCN components wrap Radix UI primitives. Do not reinvent behavior that Radix already provides:

- **Dialog** wraps `@radix-ui/react-dialog` — use `DialogTrigger`, `DialogContent`, etc.
- **DropdownMenu** wraps `@radix-ui/react-dropdown-menu` — use compound component pattern.
- **AlertDialog** wraps `@radix-ui/react-alert-dialog` — for destructive confirmations.
- **Select** wraps `@radix-ui/react-select` — accessible select with keyboard navigation.
- **Checkbox** wraps `@radix-ui/react-checkbox` — accessible checkbox with indeterminate state.

If you need modal behavior, dropdowns, or other complex interactions, check if a ShadCN/Radix component exists before building custom.

## Do / Don't

### DON'T: import from individual files

```ts
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

### DO: import from the barrel

```ts
import { Button, Card } from '@/components/ui'
```

### DON'T: wrap Link inside Button

```ts
// WRONG — produces nested interactive elements
<Button>
  <Link href="/events">View Events</Link>
</Button>
```

### DO: use buttonVariants on Link

```ts
<Link href={Routes.Main.Events.Root} className={cn(buttonVariants({ variant: 'default' }))}>
  View Events
</Link>
```

### DON'T: build custom loading skeletons with divs

```ts
<div className="animate-pulse bg-gray-200 h-8 w-full rounded" />
```

### DO: use ShadCN Skeleton

```ts
<Skeleton className="h-8 w-full" />
```

### DON'T: put className before base classes in cn()

```ts
// WRONG — consumer overrides may be overridden by base
cn(className, 'rounded-lg p-4')
```

### DO: put className last

```ts
cn('rounded-lg p-4', className)
```

### DON'T: build a custom modal from scratch

```ts
// WRONG — accessibility issues, no focus trapping
<div className="fixed inset-0 z-50">
  <div className="bg-white rounded-lg p-6">{children}</div>
</div>
```

### DO: use ShadCN Dialog (Radix)

```ts
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {children}
  </DialogContent>
</Dialog>
```
