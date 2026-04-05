---
name: nextjs-app-router
description: Pattern enforcement for Next.js 15 App Router in RSVP'd — covers RSC defaults, async params, route groups, Routes constants, middleware, redirect safety, navigation, and copy patterns.
---

# Next.js App Router Patterns

## RSC by Default

Every component is a React Server Component unless it needs interactivity. Add `"use client"` only when the component requires hooks, event handlers, browser APIs, or local state. Push the client boundary as deep as possible.

```ts
// Server component (default) — no directive needed
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const api = await getAPI()
  const event = await api.event.get.bySlug({ slug })
  return <EventView event={event} />
}
```

```ts
// Client component — only when needed
'use client'

const EventRegisterButton = ({ eventId }: { eventId: string }) => {
  const [isPending, startTransition] = useTransition()
  // ...
}
```

## Async Params, Cookies, Headers (Next.js 15)

In Next.js 15, `params`, `searchParams`, `cookies()`, `headers()`, and `draftMode()` all return Promises. Always `await` them:

```ts
// Page params
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}

// Search params
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
}
```

## Data Fetching with getAPI()

Use the tRPC server-side caller for all data fetching in RSC pages and server actions:

```ts
import { getAPI } from '@/server/api'

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const api = await getAPI()
  const event = await api.event.get.bySlug({ slug })
  return <EventView event={event} />
}
```

Never import Prisma directly in pages or layouts. `getAPI()` carries the current session context automatically.

## Loading States and Suspense

Add `loading.tsx` alongside `page.tsx` for automatic Suspense boundaries:

```
app/(main)/events/[slug]/
  page.tsx       # async RSC page
  loading.tsx    # shown while page.tsx streams
```

Use ShadCN `Skeleton` components in loading files:

```ts
import { Skeleton } from '@/components/ui'

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
```

For more granular control, use `<Suspense>` boundaries within the page.

## Route Groups

| Group | Purpose | Auth Required | Notes |
|-------|---------|--------------|-------|
| `(auth)/` | Login, register, profile | Public (redirects if already logged in) | Client + Server components |
| `(main)/` | Events, communities, categories, locations | Protected (middleware redirects) | Mixed RSC + client |
| `(static)/` | Landing, pricing, legal pages | Public | RSC only |
| `(dev)/` | Component playground | Dev only | Mixed |

Each route group has its own layout for group-specific chrome (nav, footer).

## Routes Constants

Never hardcode paths. Use `Routes` from `lib/config/routes.ts`:

```ts
import { Routes } from '@/lib/config'

Routes.Home                              // '/'
Routes.Auth.SignIn                       // '/login'
Routes.Auth.SignUp                       // '/register'
Routes.Main.Events.Create               // dynamic getter
Routes.Main.Events.ViewBySlug(slug)     // '/events/{slug}/view'
Routes.Main.Events.ManageBySlug(slug)   // '/events/{slug}/manage'
Routes.Main.Communities.ViewBySlug(slug) // '/communities/{slug}/view'
Routes.Main.Communities.Discover         // '/communities/discover'
Routes.Static.About                     // '/about'
Routes.Static.Privacy                   // '/privacy'
```

`RouteDefs.Protected` and `RouteDefs.Public` arrays control middleware auth behavior.

## Middleware

The root `middleware.ts` does two things:

1. Runs NextAuth to check authentication status.
2. Sets an `x-pathname` header for layouts to read the current path.

```ts
export default auth((request) => {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
})
```

The matcher excludes static assets, images, and auth API routes.

## redirect() Outside try/catch

This is critical and applies in both server actions and RSC pages. `redirect()` throws an internal Next.js error. If called inside a `try/catch`, the redirect silently fails.

```ts
// WRONG
try {
  redirect(Routes.Main.Events.ViewBySlug(slug))
} catch (error) {
  // redirect throw gets caught here — redirect never happens
}

// CORRECT
let result
try {
  result = await api.event.create(data)
} catch (error) {
  return { success: false, error: 'CREATION_FAILED' }
}
redirect(Routes.Main.Events.ViewBySlug(result.slug))
```

## Navigation

### Use `<Link>` for All Navigation

```ts
import Link from 'next/link'
import { Routes } from '@/lib/config'

<Link href={Routes.Main.Events.ViewBySlug(event.slug)}>View Event</Link>
```

Never use raw `<a>` tags for internal navigation.

### useRouter Only When Link Won't Work

Use `useRouter` only for programmatic navigation after an action (e.g., after a form submission in a modal):

```ts
'use client'
import { useRouter } from 'next/navigation'

const router = useRouter()
// After some client-side action:
router.push(Routes.Main.Events.ViewBySlug(slug))
```

### Navigation That Looks Like a Button

Use `buttonVariants` with `<Link>`, not `<Button>` wrapping `<Link>`:

```ts
import Link from 'next/link'
import { buttonVariants } from '@/components/ui'
import { cn } from '@/lib/utils'

<Link
  href={Routes.Main.Events.Create}
  className={cn(buttonVariants({ variant: 'default' }))}
>
  Create Event
</Link>
```

## Copy Pattern

Static text lives in colocated `copy.ts` files, not inline in components:

```
app/(auth)/copy.ts
app/(static)/copy.ts
app/(main)/copy.ts
```

Structure:

```ts
export const copy = {
  hero: {
    title: 'Discover Events Near You',
    subtitle: 'Find and RSVP to events in your community.',
  },
  cta: {
    primary: 'Get Started',
  },
}
```

No inline hardcoded strings except aria-labels.

## Providers

The root layout wraps children in `<Providers>` (`app/providers.tsx`), which includes `TRPCProvider` (client-side tRPC context) and `ProgressProvider` (page transition progress bar). Both are client components.

## Do / Don't

### DON'T: hardcode route paths

```ts
<Link href="/events/my-event/view">View</Link>
```

### DO: use Routes constants

```ts
<Link href={Routes.Main.Events.ViewBySlug('my-event')}>View</Link>
```

### DON'T: forget to await params

```ts
// BROKEN in Next.js 15
export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug  // params is a Promise now
}
```

### DO: await params

```ts
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}
```

### DON'T: use "use client" on data-fetching pages

```ts
'use client'  // WRONG — loses RSC benefits
export default function EventPage() {
  const { data } = trpc.event.get.useQuery(...)
}
```

### DO: fetch data server-side with getAPI()

```ts
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const api = await getAPI()
  const event = await api.event.get.bySlug({ slug })
  return <EventView event={event} />
}
```

### DON'T: import Prisma in page files

```ts
import { prisma } from '@/lib/prisma'
```

### DO: use getAPI()

```ts
import { getAPI } from '@/server/api'
```
