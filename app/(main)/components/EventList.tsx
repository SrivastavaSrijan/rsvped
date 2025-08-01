import { EventRole } from '@prisma/client'
import { getAPI } from '@/server/api'
import { EventCard, EventsPagination } from '.'
import { NoEvents } from './NoEvents'

interface EventListProps {
	period: 'upcoming' | 'past'
	page: number
}

const now = new Date().toISOString()

export const EventList = async ({ period, page }: EventListProps) => {
	const api = await getAPI()
	const events = await api.event.list({
		sort: 'asc',
		after: period === 'upcoming' ? now : undefined,
		before: period === 'past' ? now : undefined,
		page: page,
		size: 5,
		roles: [EventRole.CHECKIN, EventRole.MANAGER, EventRole.CO_HOST],
	})

	if (events.length === 0) {
		return (
			<NoEvents>
				{period === 'upcoming'
					? 'Looks like there are no upcoming events.'
					: 'No past events found.'}
			</NoEvents>
		)
	}

	return (
		<>
			{events.map((event, index) => (
				<EventCard
					key={event.slug}
					{...event}
					isLast={index === events.length - 1}
				/>
			))}
			<EventsPagination
				currentPage={page}
				searchParams={{ period }}
				hasMore={events.length === 5}
			/>
		</>
	)
}
