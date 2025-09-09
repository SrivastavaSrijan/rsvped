import { nanoid } from 'nanoid'
import { Suspense } from 'react'
import { GenericPagination } from '@/app/(main)/components'
import { EventCard } from '@/app/(main)/events/components'
import type { RouterOutput } from '@/server/api'
import { getAPI } from '@/server/api'

interface StirEventsTabProps {
	query: string
	page: number
	size: number
}

export async function StirEventsTab({ query, page, size }: StirEventsTabProps) {
	const api = await getAPI()
	const result = await api.stir.search.events({ query, page, size })
	const coreEvents = result.data
	const pagination = result.pagination

	if (coreEvents.length === 0) {
		return (
			<div className="flex flex-col gap-4">
				<p className="text-muted-foreground">No events found.</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<Suspense
				fallback={coreEvents.map((event, idx) => (
					<EventCard
						key={event.id ?? nanoid()}
						{...event}
						isLast={idx === coreEvents.length - 1}
					/>
				))}
			>
				<EnhancedStirEventsList coreEvents={coreEvents} query={query} />
			</Suspense>
			<GenericPagination {...pagination} />
		</div>
	)
}

async function EnhancedStirEventsList({
	coreEvents,
	query,
}: {
	coreEvents: RouterOutput['stir']['search']['events']['data']
	query: string
}) {
	// Enhance the search results with user-specific data
	const api = await getAPI()
	const enhancedEvents = await api.event.list.enhanceByIds({
		ids: coreEvents.map((e) => e.id),
	})

	// Create a map for O(1) lookup and maintain original order
	const enhancedMap = new Map(enhancedEvents.map((event) => [event.id, event]))

	// Merge enhanced data with search metadata from core events
	const orderedEvents = coreEvents.map((coreEvent) => {
		const enhancedEvent = enhancedMap.get(coreEvent.id)
		if (enhancedEvent) {
			// Merge search metadata into enhanced event
			return {
				...enhancedEvent,
				_searchMetadata: coreEvent._searchMetadata,
			}
		}
		// Fallback to core event if enhancement failed
		return coreEvent
	})

	return (
		<>
			{orderedEvents.map((event, idx) => (
				<EventCard
					key={event.id ?? nanoid()}
					{...event}
					isLast={idx === orderedEvents.length - 1}
					searchQuery={query}
				/>
			))}
		</>
	)
}
