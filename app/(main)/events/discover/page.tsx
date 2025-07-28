import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'
import { Categories, Locations, NearbyEvents } from '../../components'
import { copy } from '../../copy'

export const metadata: Metadata = {
	title: "Discover Events  · RSVP'd",
	description: 'Explore upcoming and past events in the community and RSVP to join.',
}

export default async function DiscoverEvents() {
	const api = await getAPI()
	const user = await api.user.getCurrentUser()
	const { locationId, location } = user || {}
	if (!locationId || !location) {
		redirect(Routes.Main.Events.DiscoverErrorNoLocation)
	}
	const nearbyEvents = await api.event.getEventsByLocation({ locationId })

	const categories = await api.category.list()
	const locations = await api.location.list()
	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="flex flex-col gap-2 lg:gap-3">
				<h1 className="font-bold text-2xl lg:px-0 lg:text-4xl">{copy.discover.title}</h1>
				<p className="text-muted-foreground text-sm lg:text-base">{copy.discover.description}</p>
			</div>
			<div className="flex flex-col gap-4 lg:gap-6">
				<div className="flex w-full flex-row justify-between gap-4">
					<div className="flex flex-col">
						<h2 className="text-xl font-semibold">{copy.discover.upcoming}</h2>
						<p className="text-lg text-muted-foreground">{location?.name}</p>
					</div>
					<Link href={Routes.Main.Events.DiscoverByLocation(location?.slug)} passHref>
						<Button variant="secondary">{copy.discover.viewAll}</Button>
					</Link>
				</div>
				<NearbyEvents nearbyEvents={nearbyEvents} />
			</div>
			<hr />
			<div className="flex flex-col gap-4 lg:gap-6">
				<div className="flex w-full flex-row justify-between gap-4">
					<div className="flex flex-col">
						<h2 className="text-xl font-semibold">{copy.discover.category}</h2>
					</div>
				</div>
				<Categories categories={categories} />
			</div>
			<hr />
			<div className="flex flex-col gap-2 lg:gap-3">
				<div className="flex w-full flex-row justify-between gap-4">
					<div className="flex flex-col">
						<h2 className="text-xl font-semibold">{copy.discover.location}</h2>
					</div>
				</div>
				<Locations locations={locations} defaultValue={location.continent} />
			</div>
		</div>
	)
}
