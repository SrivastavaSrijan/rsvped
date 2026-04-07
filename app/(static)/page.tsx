import { Suspense } from 'react'
import { Skeleton } from '@/components/ui'
import { FeaturedCommunities, FeaturedEvents, Hero } from './components'

// Revalidate homepage every 30 minutes — featured content is CDN-cached
export const revalidate = 1800

export default function Home() {
	return (
		<div className="flex w-full flex-col gap-12 pb-12 lg:gap-16 lg:pb-16">
			<Hero />
			<Suspense fallback={<SectionSkeleton />}>
				<FeaturedEvents />
			</Suspense>
			<Suspense fallback={<SectionSkeleton />}>
				<FeaturedCommunities />
			</Suspense>
		</div>
	)
}

function SectionSkeleton() {
	return (
		<div className="container mx-auto w-full max-w-extra-wide-page px-4">
			<Skeleton className="h-8 w-48" />
			<Skeleton className="mt-2 h-4 w-64" />
			<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Skeleton className="h-20 rounded-lg" />
				<Skeleton className="h-20 rounded-lg" />
				<Skeleton className="h-20 rounded-lg" />
				<Skeleton className="h-20 rounded-lg" />
			</div>
		</div>
	)
}
