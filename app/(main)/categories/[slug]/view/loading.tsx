import { Skeleton } from '@/components/ui'

export default function Loading() {
	return (
		<div className="flex flex-col w-full">
			<div className="flex flex-col px-3 pt-6 lg:gap-4 lg:px-8 gap-3 lg:pt-8">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-64" />
				<div className="flex flex-row flex-wrap gap-2">
					{Array.from({ length: 5 }, (_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
						<Skeleton key={i} className="h-6 w-20 rounded-full" />
					))}
				</div>
			</div>
			<div className="mx-auto flex w-full max-w-wide-page flex-col gap-4">
				<div className="flex flex-col px-3 pb-6 lg:gap-8 lg:px-8 gap-4 lg:pb-8">
					<div className="grid grid-cols-12 lg:gap-4 gap-4">
						<div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
							{Array.from({ length: 3 }, (_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
								<Skeleton key={i} className="h-40 w-full rounded-md" />
							))}
						</div>
						<div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-64 w-full" />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
