import { Skeleton } from '@/components/ui'

export default function Loading() {
	return (
		<div className="mx-auto w-full max-w-md px-4 py-16">
			<Skeleton className="mb-8 h-10 w-3/4" />
			<div className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
			</div>
		</div>
	)
}
