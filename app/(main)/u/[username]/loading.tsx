import { Skeleton } from '@/components/ui'

export default function ProfileLoading() {
	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-8 px-4 py-12">
			{/* Header skeleton */}
			<div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-6">
				<Skeleton className="size-24 rounded-full" />
				<div className="flex flex-col items-center gap-2 lg:items-start">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-4 w-64" />
					<div className="flex gap-2">
						<Skeleton className="h-6 w-20" />
						<Skeleton className="h-6 w-24" />
						<Skeleton className="h-6 w-16" />
					</div>
				</div>
			</div>
			{/* Stats skeleton */}
			<div className="flex justify-center gap-8">
				{Array.from({ length: 4 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
					<Skeleton key={i} className="h-12 w-16" />
				))}
			</div>
			{/* Tabs skeleton */}
			<Skeleton className="h-10 w-full" />
			<div className="flex flex-col gap-3">
				{Array.from({ length: 3 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
					<Skeleton key={i} className="h-16 w-full rounded-lg" />
				))}
			</div>
		</div>
	)
}
