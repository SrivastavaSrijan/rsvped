import { Suspense } from 'react'
import type { RouterOutput } from '@/server/api'
import { getAPI } from '@/server/api'
import { EventPage } from './EventPage'

interface EnhancedEventPageProps {
	slug: string
}

const EnhancedEventPage = async ({ slug }: EnhancedEventPageProps) => {
	const api = await getAPI()
	const event = await api.event.get.enhanced({ slug })
	return <EventPage {...event} />
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
