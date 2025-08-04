import { Skeleton } from '@/components/ui'

export default function Loading() {
	return (
		<div className="space-y-4 p-4">
			<Skeleton className="h-6 w-1/2" />
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-2/3" />
		</div>
	)
}
