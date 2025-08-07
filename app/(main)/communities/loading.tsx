import { Skeleton } from '@/components/ui'

function ManagedCommunityCardSkeleton() {
	return (
		<div className="rounded-lg p-4 shadow-sm flex flex-col gap-3">
			<Skeleton className="aspect-square h-[75px] w-[75px] rounded-lg" />
			<div className="flex flex-col gap-2">
				<Skeleton className="h-5 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
			</div>
		</div>
	)
}

function UserCommunityItemSkeleton() {
	return (
		<div className="bg-card flex flex-col gap-4 p-4 rounded-lg shadow-sm lg:grid lg:grid-cols-12">
			<div className="flex items-start gap-4 lg:col-span-4">
				<Skeleton className="aspect-square h-[75px] w-[75px] rounded-lg" />
				<div className="flex flex-col gap-2">
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-6 w-20 rounded-md" />
				</div>
			</div>
			<hr className="lg:hidden" />
			<div className="flex flex-col gap-2 lg:col-span-8">
				<Skeleton className="h-4 w-24" />
				{Array.from({ length: 2 }).map((_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: mock data, not real content
					<Skeleton key={index} className="h-5 w-full" />
				))}
			</div>
		</div>
	)
}

export default function Loading() {
	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="flex w-full flex-row justify-between gap-4">
				<Skeleton className="h-8 w-40" />
			</div>

			<div className="flex flex-col gap-4 lg:gap-6">
				<div className="flex w-full flex-row justify-between gap-4">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-9 w-32 rounded-md" />
				</div>
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: mock data, not real content
						<ManagedCommunityCardSkeleton key={index} />
					))}
				</div>
			</div>

			<Skeleton className="h-px w-full" />

			<div className="flex flex-col gap-4 lg:gap-6">
				<Skeleton className="h-6 w-40" />
				<div className="flex flex-col gap-4 lg:gap-6">
					{Array.from({ length: 3 }).map((_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: mock data, not real content
						<UserCommunityItemSkeleton key={index} />
					))}
				</div>
			</div>
		</div>
	)
}
