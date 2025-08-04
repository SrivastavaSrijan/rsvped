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
			</div>
		</div>
	)
}

export default function Loading() {
	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="flex flex-col gap-2 lg:gap-3">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-2/3" />
			</div>
			<div className="flex flex-col gap-4 lg:gap-6">
				<div className="flex flex-row justify-between gap-4">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-6 w-32" />
						<div className="flex flex-row items-center gap-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-4" />
						</div>
					</div>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{new Array(3).fill(null).map((_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
						<EventCardSkeleton key={index} />
					))}
				</div>
			</div>
			<hr />
			<div className="flex flex-col gap-4 lg:gap-6">
				<Skeleton className="h-6 w-32" />
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
					{new Array(3).fill(null).map((_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
						<Skeleton key={index} className="h-40 w-full rounded-md" />
					))}
				</div>
			</div>
			<hr />
			<div className="flex flex-col gap-4 lg:gap-6">
				<Skeleton className="h-6 w-32" />
				<div className="grid grid-cols-3 gap-4">
					{new Array(6).fill(null).map((_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
						<Skeleton key={index} className="h-24 w-full rounded-md" />
					))}
				</div>
			</div>
		</div>
	)
}
