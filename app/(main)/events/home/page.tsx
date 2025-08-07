import { EventRole } from '@prisma/client'
import type { Metadata } from 'next'
import { getAPI } from '@/server/api'
import { createEventListParams, ProgressiveEventsList } from '../../components'

export const metadata: Metadata = {
	title: "Events · RSVP'd",
	description: "View events you have RSVP'd to or are interested in.",
}

export default async function EventsHome({
	searchParams,
}: {
	searchParams: Promise<{ period?: string; page?: string }>
}) {
	const { period = 'upcoming', page = '1' } = await searchParams
	const api = await getAPI()

	const params = createEventListParams({
		period: period as 'upcoming' | 'past',
		page: parseInt(page, 10) || 1,
		roles: [EventRole.CHECKIN, EventRole.MANAGER, EventRole.CO_HOST],
	})

	const coreEvents = await api.event.list.core(params)

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<ProgressiveEventsList coreEvents={coreEvents} params={params} />
		</div>
	)
}
