import { nanoid } from 'nanoid'
import { Suspense } from 'react'
import { GenericPagination } from '@/app/(main)/components'
import { EventCard } from '@/app/(main)/events/components'
import { getAPI } from '@/server/api'

interface StirEventsTabProps {
	query: string
	page: number
	size: number
}

export async function StirEventsTab({ query, page, size }: StirEventsTabProps) {
	const api = await getAPI()
	const core = await api.stir.search.core({ query, page, size, type: 'events' })
	const coreEvents = core.events.data
	const pagination = core.events.pagination

	return (
		<div className="flex flex-col gap-4">
			<Suspense
				fallback={
					coreEvents.length === 0 ? (
						<p className="text-muted-foreground">No events found.</p>
					) : (
						coreEvents.map((event, idx) => (
							<EventCard
								key={event.id ?? nanoid()}
								{...event}
								isLast={idx === coreEvents.length - 1}
							/>
						))
					)
				}
			>
				<EnhancedStirEventsList ids={coreEvents.map((e) => e.id)} />
			</Suspense>
			<GenericPagination {...pagination} />
		</div>
	)
}

async function EnhancedStirEventsList({ ids }: { ids: string[] }) {
	if (ids.length === 0) {
		return <p className="text-muted-foreground">No events found.</p>
	}

	const api = await getAPI()
	const events = await api.event.list.enhanceByIds({ ids })

	return (
		<>
			{events.map((event, idx) => (
				<EventCard
					key={event.id ?? nanoid()}
					{...event}
					isLast={idx === events.length - 1}
				/>
			))}
		</>
	)
}
