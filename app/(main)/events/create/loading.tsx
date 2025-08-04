import { Skeleton } from '@/components/ui'

export default function Loading() {
	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<Skeleton className="h-40 w-full rounded-md sm:h-64" />
			<div className="flex flex-col gap-4">
				{new Array(6).fill(null).map((_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
					<Skeleton key={index} className="h-10 w-full" />
				))}
			</div>
			<div className="flex justify-end">
				<Skeleton className="h-10 w-32 rounded-md" />
			</div>
		</div>
	)
}
