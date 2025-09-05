import { Edit3 } from 'lucide-react'
import { nanoid } from 'nanoid'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { copy } from '@/app/(main)/copy'
import {
	CategoryDiscoverCard,
	CommunityDiscoverCard,
	EventDiscoverCard,
	ResponsiveGridCarousel,
} from '@/app/(main)/events/components'
import { LocationsDiscover } from '@/app/(main)/locations/components'
import { Button, Skeleton } from '@/components/ui'
import { CookieNames, Routes } from '@/lib/config'
import { getEncryptedCookie } from '@/lib/cookies'
import type { LocationFormData } from '@/server/actions'
import { getAPI } from '@/server/api'

export const metadata: Metadata = {
	title: "Discover Events  · RSVP'd",
	description:
		'Explore upcoming and past events in the community and RSVP to join.',
}

const PageConfig = {
	nearbyEvents: {
		pageSize: 12,
		get lg() {
			return this.pageSize / 2
		},
		get sm() {
			return this.pageSize / 3
		},
	},
	recommended: {
		pageSize: 12,
		get lg() {
			return this.pageSize / 2
		},
		get sm() {
			return this.pageSize / 3
		},
	},
	categories: {
		pageSize: 12,
		get lg() {
			return this.pageSize / 2
		},
		get sm() {
			return this.pageSize / 12
		},
	},
	communities: {
		pageSize: 12,
		get lg() {
			return this.pageSize / 2
		},
		get sm() {
			return this.pageSize / 3
		},
	},
}

/**
 * Resolves the user's location based on a priority order:
 * 1. Authenticated user's saved location.
 * 2. Location ID stored in the unauthenticated user's cookie.
 * 3. A default location from the system.
 * Redirects to an error page if no location can be determined.
 */
async function resolveUserLocation() {
	const api = await getAPI()
	const user = await api.user.profile.enhanced()

	// 1. Use authenticated user's location if available
	if (user?.locationId && user.location) {
		return { locationId: user.locationId, location: user.location }
	}

	// 2. Try to find location from cookie for guests
	const { locationId: savedLocationId } =
		(await getEncryptedCookie<Partial<LocationFormData>>(
			CookieNames.PrefillLocation
		)) ?? {}

	if (savedLocationId) {
		try {
			const location = await api.location.get.byId({
				id: savedLocationId,
			})
			if (location) {
				return { locationId: savedLocationId, location }
			}
		} catch (error) {
			console.error('Error fetching location by ID from cookie:', error)
			// Could log this error. Cookie might contain an old/invalid ID.
			// Proceed to fallback.
		}
	}

	// 3. Fallback to the first available location in the system
	const defaultLocation = await api.location.get.default()
	if (defaultLocation) {
		return { locationId: defaultLocation.id, location: defaultLocation }
	}

	// If no location can be found, redirect
	redirect(Routes.Main.Events.DiscoverLocationSelect)
}

// Skeleton Components
const EventsSkeleton = () => (
	<div className="grid lg:grid-cols-6 grid-cols-4 gap-4">
		{Array.from({ length: 6 }, () => (
			<div key={nanoid()} className="flex flex-col gap-2">
				<Skeleton className="aspect-video w-full rounded-lg" />
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-3 w-1/2" />
			</div>
		))}
	</div>
)

const CommunitiesSkeleton = () => (
	<div className="grid lg:grid-cols-3 grid-cols-2 gap-4">
		{Array.from({ length: 6 }, () => (
			<div key={nanoid()} className="flex flex-col gap-2">
				<Skeleton className="aspect-square w-full rounded-lg" />
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-3 w-1/2" />
			</div>
		))}
	</div>
)

const CategoriesSkeleton = () => (
	<div className="grid lg:grid-cols-3 grid-cols-2 gap-4">
		{Array.from({ length: 6 }, () => (
			<div key={nanoid()} className="flex flex-col gap-2">
				<Skeleton className="aspect-square w-full rounded-lg" />
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-3 w-1/2" />
			</div>
		))}
	</div>
)

const LocationsSkeleton = () => (
	<div className="flex flex-col gap-4">
		<Skeleton className="h-10 w-full" />
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
			{Array.from({ length: 8 }, () => (
				<Skeleton key={nanoid()} className="h-8 w-full" />
			))}
		</div>
	</div>
)

const RecommendationsSkeleton = () => (
	<div className="grid lg:grid-cols-6 grid-cols-4 gap-4">
		{Array.from({ length: 6 }, () => (
			<div key={nanoid()} className="flex flex-col gap-2">
				<Skeleton className="aspect-video w-full rounded-lg" />
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-3 w-1/2" />
			</div>
		))}
	</div>
)

// Individual async components for streaming
interface NearbyEventsProps {
	locationId: string
}

const NearbyEvents = async ({ locationId }: NearbyEventsProps) => {
	const api = await getAPI()
	const nearbyEvents = await api.event.nearby({
		locationId,
		take: PageConfig.nearbyEvents.pageSize,
	})
	return (
		<ResponsiveGridCarousel
			config={{
				pageSize: {
					lg: PageConfig.nearbyEvents.lg,
					sm: PageConfig.nearbyEvents.sm,
				},
			}}
			data={nearbyEvents}
			item={EventDiscoverCard}
		/>
	)
}

interface NearbyCommunitiesProps {
	locationId: string
}

const NearbyCommunities = async ({ locationId }: NearbyCommunitiesProps) => {
	const api = await getAPI()
	const communities = await api.community.nearby({
		locationId,
		take: PageConfig.communities.pageSize,
	})

	return (
		<ResponsiveGridCarousel
			config={{
				pageSize: {
					lg: PageConfig.communities.lg,
					sm: PageConfig.communities.sm,
				},
				gap: {
					sm: 2,
					lg: 2,
				},
				cols: {
					lg: 3,
					sm: 2,
				},
			}}
			data={communities}
			item={CommunityDiscoverCard}
		/>
	)
}

interface NearbyCategoriesProps {
	locationId: string
}

const NearbyCategories = async ({ locationId }: NearbyCategoriesProps) => {
	const api = await getAPI()
	const categories = await api.category.list.nearby({
		locationId,
		take: PageConfig.categories.pageSize,
	})

	return (
		<ResponsiveGridCarousel
			config={{
				pageSize: {
					lg: PageConfig.categories.lg,
					sm: PageConfig.categories.sm,
				},
				gap: {
					sm: 2,
					lg: 2,
				},
				cols: {
					lg: 3,
					sm: 2,
				},
			}}
			data={categories}
			item={CategoryDiscoverCard}
		/>
	)
}

interface LocationsListProps {
	defaultContinent: string
}

const LocationsList = async ({ defaultContinent }: LocationsListProps) => {
	const api = await getAPI()
	const { continents } = await api.location.list.core()

	return (
		<LocationsDiscover
			continents={continents}
			defaultValue={defaultContinent}
		/>
	)
}

interface RecommendedEventsProps {
	locationId: string
}

const RecommendedEvents = async (_props: RecommendedEventsProps) => {
	const api = await getAPI()

	try {
		// Check if user is authenticated - if not, don't show recommendations
		const user = await api.user.profile.enhanced()
		if (!user) return null

		const recommendations = await api.user.recommendations.events({
			limit: PageConfig.recommended.pageSize,
		})

		return (
			<div className="flex flex-col gap-4 lg:gap-6">
				<div className="flex w-full flex-row justify-between gap-4">
					<div className="flex flex-col gap-2 lg:gap-2">
						<h2 className="text-xl font-semibold">
							{copy.discover.recommended}
						</h2>
					</div>
				</div>
				<ResponsiveGridCarousel
					config={{
						pageSize: {
							lg: PageConfig.recommended.lg,
							sm: PageConfig.recommended.sm,
						},
					}}
					data={recommendations}
					item={EventDiscoverCard}
				/>
			</div>
		)
	} catch {
		// If there's an error (like user not authenticated), silently return null
		return null
	}
}

export default async function DiscoverEvents() {
	const { locationId, location } = await resolveUserLocation()

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="flex flex-col gap-2 lg:gap-3">
				<h1 className="font-bold text-2xl lg:px-0 lg:text-4xl">
					{copy.discover.title}
				</h1>
				<p className="text-muted-foreground text-sm lg:text-base">
					{copy.discover.description}
				</p>
			</div>

			<div className="flex flex-col gap-4 lg:gap-6">
				{/* Add hr only if recommendations exist */}
				<div className="flex w-full flex-row justify-between gap-4">
					<div className="flex flex-col gap-2 lg:gap-2">
						<h2 className="text-xl font-semibold">{copy.discover.upcoming}</h2>
						<div className="flex items-center flex-row gap-2">
							<p className="text-lg text-muted-foreground">{location.name}</p>
							<Link href={Routes.Main.Events.DiscoverLocationSelect} passHref>
								<Button variant="link" size="sm">
									<Edit3 className="size-3" />
									{copy.discover.changeLocation}
								</Button>
							</Link>
						</div>
					</div>
				</div>
				<Suspense fallback={<EventsSkeleton />}>
					<NearbyEvents locationId={locationId} />
				</Suspense>
			</div>

			<hr />

			{/* Recommended Events Section */}
			<Suspense fallback={<RecommendationsSkeleton />}>
				<RecommendedEvents locationId={locationId} />
			</Suspense>

			<hr />

			<div className="flex flex-col gap-4 lg:gap-6">
				<div className="flex w-full flex-row justify-between gap-4">
					<div className="flex flex-col">
						<h2 className="text-xl font-semibold">
							{copy.discover.communities}
						</h2>
					</div>
				</div>
				<Suspense fallback={<CommunitiesSkeleton />}>
					<NearbyCommunities locationId={locationId} />
				</Suspense>
			</div>

			<hr />

			<div className="flex flex-col gap-4 lg:gap-6">
				<div className="flex w-full flex-row justify-between gap-4">
					<div className="flex flex-col">
						<h2 className="text-xl font-semibold">{copy.discover.category}</h2>
					</div>
				</div>
				<Suspense fallback={<CategoriesSkeleton />}>
					<NearbyCategories locationId={locationId} />
				</Suspense>
			</div>

			<hr />

			<div className="flex flex-col gap-2 lg:gap-3">
				<div className="flex w-full flex-row justify-between gap-4">
					<div className="flex flex-col">
						<h2 className="text-xl font-semibold">{copy.discover.location}</h2>
					</div>
				</div>
				<Suspense fallback={<LocationsSkeleton />}>
					<LocationsList defaultContinent={location.continent} />
				</Suspense>
			</div>
		</div>
	)
}
