import { Skeleton } from '@/components/ui'

export default function Loading() {
	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-8 px-3 pb-6 lg:gap-12 lg:px-8 lg:pb-8">
			<div className="flex flex-col gap-4">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-8 w-2/3" />
				<div className="flex gap-2">
					<Skeleton className="h-9 w-24 rounded-md" />
					<Skeleton className="h-9 w-24 rounded-md" />
					<Skeleton className="h-9 w-24 rounded-md" />
				</div>
			</div>
			<Skeleton className="h-64 w-full rounded-md" />
		</div>
	)
}
