import { Skeleton } from '@/components/ui'

export default function FeedLoading() {
	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-6 px-4 py-12">
			<div className="flex flex-col gap-1">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-64" />
			</div>
			<div className="flex flex-col gap-3">
				{Array.from({ length: 5 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
					<Skeleton key={i} className="h-16 w-full rounded-lg" />
				))}
			</div>
		</div>
	)
}
