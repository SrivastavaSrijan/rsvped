import { EventRole } from '@prisma/client'
import type { Metadata } from 'next'
import {
	buildEventListQuery,
	ProgressiveEventsList,
} from '@/app/(main)/events/components'
import { type EventListSearchParams, getAPI } from '@/server/api'

export const metadata: Metadata = {
	title: "Events · RSVP'd",
	description: "View events you have RSVP'd to or are interested in.",
}

export default async function EventsHome({
	searchParams,
}: {
	searchParams: Promise<EventListSearchParams>
}) {
	const api = await getAPI()

	const params = buildEventListQuery({
		roles: [EventRole.CHECKIN, EventRole.MANAGER, EventRole.CO_HOST],
		...(await searchParams),
	})

	const coreEvents = await api.event.list.core(params)

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<ProgressiveEventsList coreEvents={coreEvents} params={params} />
		</div>
	)
}
