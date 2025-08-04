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
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="flex w-full flex-row justify-between gap-4">
				<Skeleton className="h-8 w-40" />
				<div className="flex gap-2">
					<Skeleton className="h-9 w-24 rounded-md" />
					<Skeleton className="h-9 w-24 rounded-md" />
				</div>
			</div>
			<div className="flex flex-col gap-4">
				{new Array(3).fill(null).map((_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
					<EventCardSkeleton key={index} />
				))}
			</div>
			<div className="mt-6 flex items-center justify-center gap-2">
				<Skeleton className="h-8 w-24 rounded-md" />
				<div className="flex gap-2">
					{new Array(3).fill(null).map((_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
						<Skeleton key={index} className="size-8 rounded-md" />
					))}
				</div>
				<Skeleton className="h-8 w-24 rounded-md" />
			</div>
		</div>
	)
}
