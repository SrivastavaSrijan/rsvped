import { Skeleton } from '@/components/ui'

export default function Loading() {
	return (
		<div className="mx-auto w-full max-w-3xl px-6 py-12">
			<Skeleton className="mb-6 h-10 w-1/2" />
			<div className="space-y-4">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
				<Skeleton className="h-4 w-4/6" />
				<Skeleton className="h-4 w-3/6" />
			</div>
		</div>
	)
}
