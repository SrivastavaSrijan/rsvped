import type { RouterOutput } from '@/server/api'
import { EventDiscoverCard } from './EventDiscoverCard'

type SimilarEventsData = RouterOutput['user']['recommendations']['similar']

interface SimilarEventsProps {
	data: SimilarEventsData
}

export const SimilarEvents = ({ data }: SimilarEventsProps) => {
	if (!data?.length) {
		return null
	}

	return (
		<div className="flex flex-col gap-2 lg:gap-2">
			<p className="font-semibold text-sm">Similar Events</p>
			<hr className="border-muted-foreground/20" />
			<div className="flex flex-col lg:gap-4 gap-2">
				{data.length > 0 &&
					data.map((event) => <EventDiscoverCard key={event.id} {...event} />)}
			</div>
		</div>
	)
}
