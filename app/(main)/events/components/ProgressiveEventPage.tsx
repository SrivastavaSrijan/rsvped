import { Suspense } from 'react'
import type { RouterOutput } from '@/server/api'
import { getAPI } from '@/server/api'
import { EventPage } from './EventPage'
import { SimilarEvents } from './SimilarEvents'

interface EnhancedEventPageProps {
	slug: string
}

const EnhancedEventPage = async ({ slug }: EnhancedEventPageProps) => {
	const api = await getAPI()
	const event = await api.event.get.enhanced({ slug })

	// Fetch similar events
	const similar = await api.user.recommendations.similar({
		eventId: event.id,
		limit: 3,
	})

	return (
		<EventPage {...event}>
			<SimilarEvents data={similar} />
		</EventPage>
	)
}

interface ProgressiveEventPageProps {
	coreEvent: RouterOutput['event']['get']['core']
}

export const ProgressiveEventPage = ({
	coreEvent,
}: ProgressiveEventPageProps) => {
	return (
		<Suspense fallback={<EventPage {...coreEvent} />}>
			<EnhancedEventPage slug={coreEvent.slug} />
		</Suspense>
	)
}
