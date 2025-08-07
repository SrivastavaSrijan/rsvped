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
		<div className="mx-auto flex w-full max-w-wide-page flex-col gap-4">
			<div className="relative h-[120px] w-full lg:h-[240px]">
				<Skeleton className="h-full w-full rounded-xl" />
				<Skeleton className="absolute left-4 -bottom-9 size-18 rounded-full lg:size-24 lg:-bottom-12" />
			</div>
			<div className="flex flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
				<div className="flex flex-col gap-2">
					<div className="flex flex-col items-start justify-between gap-2 lg:flex-row lg:gap-2">
						<div className="flex flex-col gap-1">
							<Skeleton className="h-4 w-32" />
							<div className="flex items-center gap-2">
								<Skeleton className="h-8 w-48" />
								<Skeleton className="h-5 w-16 rounded-md" />
							</div>
						</div>
						<Skeleton className="h-9 w-28 rounded-md" />
					</div>
					<Skeleton className="h-4 w-full max-w-md" />
				</div>
				<Skeleton className="h-px w-full" />
				<div className="grid grid-cols-12 gap-4 lg:gap-4">
					<div className="col-span-12 flex flex-row gap-4 lg:col-span-4 lg:flex-col">
						<Skeleton className="h-10 w-32 rounded-md" />
						<Skeleton className="h-64 w-full rounded-md" />
					</div>
					<div className="col-span-12 flex flex-col gap-4 lg:col-span-8">
						{Array.from({ length: 3 }).map((_, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: mock data, not real content
							<EventCardSkeleton key={index} />
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
