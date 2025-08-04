import { Skeleton } from '@/components/ui'

export default function Loading() {
	return (
		<div className="mx-auto flex min-h-screen w-full max-w-page flex-col">
			<div className="border-border border-b px-4 py-6">
				<Skeleton className="h-8 w-40" />
			</div>
			<div className="flex-1 space-y-6 p-4">
				<Skeleton className="h-10 w-1/3" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
			</div>
		</div>
	)
}
