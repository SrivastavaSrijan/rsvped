import { Skeleton } from '@/components/ui'

export default function Loading() {
	return (
		<div className="mx-auto flex w-full max-w-wide-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="grid grid-cols-12 gap-4 lg:gap-5">
				<div className="col-span-full lg:col-span-5 flex flex-col gap-4">
					<Skeleton className="aspect-square w-full rounded-xl" />
					<Skeleton className="h-4 w-1/2" />
					<Skeleton className="h-4 w-2/3" />
				</div>
				<div className="col-span-full lg:col-span-7 flex flex-col gap-4">
					<Skeleton className="h-10 w-3/4" />
					<Skeleton className="h-6 w-1/2" />
					<Skeleton className="h-6 w-1/3" />
					<div className="rounded-xl p-4">
						<Skeleton className="h-8 w-1/2" />
						<Skeleton className="mt-4 h-10 w-full" />
					</div>
					<Skeleton className="h-4 w-full" />
				</div>
			</div>
		</div>
	)
}
