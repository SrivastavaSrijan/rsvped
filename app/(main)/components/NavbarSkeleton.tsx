import { Skeleton } from '@/components/ui'

export const NavbarSkeleton = () => (
	<nav className="sticky top-0 z-10 bg-black/10 px-3 py-2 backdrop-blur-sm lg:px-4 lg:py-3">
		<div className="flex items-center gap-2">
			<Skeleton className="size-6 rounded" />
			<div className="flex-1" />
			<div className="flex w-full max-w-extra-wide-page items-center justify-between">
				<div className="flex items-center space-x-1 lg:space-x-2">
					<Skeleton className="h-8 w-16 rounded" />
					<Skeleton className="h-8 w-24 rounded" />
					<Skeleton className="h-8 w-20 rounded" />
					<Skeleton className="h-8 w-14 rounded" />
				</div>
				<div className="flex-1" />
				<div className="flex items-center space-x-2 lg:space-x-4">
					<Skeleton className="h-8 w-24 rounded" />
					<Skeleton className="size-8 rounded-full" />
				</div>
			</div>
		</div>
	</nav>
)
