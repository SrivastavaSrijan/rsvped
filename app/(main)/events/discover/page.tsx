import { Edit3 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui'
import { CookieNames, Routes } from '@/lib/config'
import { getEncryptedCookie } from '@/lib/cookies'
import type { LocationFormData } from '@/server/actions'
import { getAPI } from '@/server/api'
import {
	CategoryDiscoverCard,
	CommunityDiscoverCard,
	EventDiscoverCard,
	Locations,
	ResponsiveGridCarousel,
} from '../../components'
import { copy } from '../../copy'

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
	const user = await api.user.getCurrentUser()

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
			const location = await api.location.byId({ id: savedLocationId })
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
	const defaultLocation = await api.location.getDefault()
	if (defaultLocation) {
		return { locationId: defaultLocation.id, location: defaultLocation }
	}

	// If no location can be found, redirect
	redirect(Routes.Main.Events.DiscoverLocationSelect)
}

export default async function DiscoverEvents() {
	const api = await getAPI()
	const { locationId, location } = await resolveUserLocation()
	let data:
		| [
				nearbyEvents: Awaited<ReturnType<typeof api.event.listNearby>>,
				categories: Awaited<ReturnType<typeof api.category.listNearby>>,
				communities: Awaited<ReturnType<typeof api.community.listNearby>>,
				continents: Awaited<ReturnType<typeof api.location.list>>,
		  ]
		| undefined
	try {
		// Fetch all data in parallel with caching
		data = await Promise.all([
			api.event.listNearby({
				locationId,
				take: PageConfig.nearbyEvents.pageSize,
			}),
			api.category.listNearby({
				locationId,
				take: PageConfig.categories.pageSize,
			}),
			api.community.listNearby({
				locationId,
				take: PageConfig.communities.pageSize,
			}),
			api.location.list(),
		])
	} catch (error) {
		console.error('Error fetching discover data:', error)
		// Redirect to location selection if any fetch fails
		redirect(Routes.Main.Events.DiscoverLocationSelect)
	}
	const [nearbyEvents, categories, communities, { continents }] = data

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
			</div>
			<hr />
			<div className="flex flex-col gap-4 lg:gap-6">
				<div className="flex w-full flex-row justify-between gap-4">
					<div className="flex flex-col">
						<h2 className="text-xl font-semibold">
							{copy.discover.communities}
						</h2>
					</div>
				</div>
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
			</div>
			<hr />
			<div className="flex flex-col gap-4 lg:gap-6">
				<div className="flex w-full flex-row justify-between gap-4">
					<div className="flex flex-col">
						<h2 className="text-xl font-semibold">{copy.discover.category}</h2>
					</div>
				</div>
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
			</div>
			<hr />
			<div className="flex flex-col gap-2 lg:gap-3">
				<div className="flex w-full flex-row justify-between gap-4">
					<div className="flex flex-col">
						<h2 className="text-xl font-semibold">{copy.discover.location}</h2>
					</div>
				</div>
				<Locations continents={continents} defaultValue={location.continent} />
			</div>
		</div>
	)
}
