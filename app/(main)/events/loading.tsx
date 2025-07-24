import { Skeleton } from '@/components/ui'

function EventCardSkeleton() {
  return (
    <div className="rounded-lg p-3 lg:p-6">
      <Skeleton className="mb-4 h-40 w-full rounded-md sm:h-48" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-page flex-col">
      {/* Header skeleton */}
      <div className="border-border border-b px-3 py-4 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-28 sm:h-8 sm:w-32" />
            <Skeleton className="h-9 w-20 rounded-md sm:h-10 sm:w-24" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 py-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page title and description */}
          <div className="mb-6 flex flex-col gap-2 sm:mb-8">
            <Skeleton className="h-8 w-48 sm:h-10 sm:w-64" />
            <Skeleton className="h-4 w-full max-w-sm sm:h-5" />
          </div>

          {/* Event cards grid skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {new Array(6).fill(null).map((_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: mock data, not real content
              <EventCardSkeleton key={index} />
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="mt-12 flex items-center justify-center gap-2">
            <Skeleton className="h-7 w-24 rounded-md" />
            <div className="flex gap-2">
              {new Array(3).fill(null).map((_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: mock data, not real content
                <Skeleton key={index} className="size-7 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
