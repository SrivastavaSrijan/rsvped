import type { EventRole } from '@prisma/client'
import dayjs from 'dayjs'
import { Suspense } from 'react'
import { DateFilterMessage } from '@/components/shared'
import type { RouterInput, RouterOutput } from '@/server/api'
import { getAPI } from '@/server/api'
import { copy } from '../copy'
import { EventCard } from './EventCard'
import { EventsPagination } from './EventsPagination'
import { NoEvents } from './NoEvents'
import { PeriodTabs } from './PeriodTabs'

export interface CreateEventListParams {
	period?: 'upcoming' | 'past'
	page?: number
	roles?: EventRole[]
	communityId?: string
	locationId?: string
	on?: string
	after?: string
	before?: string
}
/**
 * Creates a consistent set of parameters for core and enhanced event list queries
 * Based on common filtering patterns used across the app
 */
type CreateEventListReturn = RouterInput['event']['list']['core'] & {
	period?: 'upcoming' | 'past'
}
export function createEventListParams({
	on,
	after,
	before,
	period,
	page = 1,
	roles,
	communityId,
	locationId,
}: CreateEventListParams): CreateEventListReturn {
	const now = dayjs().toISOString()

	if (on) {
		return {
			after: dayjs(on).startOf('day').toISOString(),
			before: dayjs(on).endOf('day').toISOString(),
		}
	}
	return {
		period,
		sort: period === 'upcoming' ? 'asc' : 'desc',
		after: after
			? dayjs(after).startOf('day').toISOString()
			: period === 'upcoming'
				? now
				: undefined,
		before: before
			? dayjs(before).endOf('day').toISOString()
			: period === 'past'
				? now
				: undefined,
		page,
		roles,
		where: {
			communityId,
			locationId,
		},
	}
}

/**
 * Type guard to check if events data is enhanced with additional relations
 */
export function isEnhancedEventsData(
	events: unknown[]
): events is Array<{ rsvps?: unknown; community?: unknown }> {
	return events.length > 0 && 'rsvps' in (events[0] as object)
}

interface EnhancedEventsListProps {
	params: RouterInput['event']['list']['core']
}

export const EnhancedEventsList = async ({
	params,
}: EnhancedEventsListProps) => {
	const api = await getAPI()
	const enhancedEvents = await api.event.list.enhanced(params)

	return (
		<>
			{enhancedEvents.map((event, index) => (
				<EventCard
					key={`enhanced-${event.slug}`}
					{...event}
					isLast={index === enhancedEvents.length - 1}
				/>
			))}
		</>
	)
}

type CoreEventData = RouterOutput['event']['list']['core'][number]

interface ProgressiveEventsListProps {
	coreEvents: CoreEventData[]
	params: CreateEventListReturn
	isEmpty?: boolean
	emptyStateSlot?: React.ReactNode
}

export const ProgressiveEventsList = ({
	coreEvents,
	params,
}: ProgressiveEventsListProps) => {
	if (coreEvents.length === 0) {
		return <NoEvents />
	}

	return (
		<>
			<div className="flex w-full flex-row justify-between gap-4">
				<div className="flex flex-col w-full gap-3 lg:gap-4">
					<div className="flex w-full flex-row justify-between gap-4">
						<h1 className="font-bold text-2xl lg:px-0 lg:text-4xl">
							{copy.home.title}
						</h1>
						<PeriodTabs currentPeriod={params.period} />
					</div>
					<DateFilterMessage />
				</div>
			</div>

			<div className="flex h-full w-full flex-col items-center justify-center">
				<Suspense
					fallback={coreEvents.map((event, index) => (
						<EventCard
							key={event.slug}
							{...event}
							isLast={index === coreEvents.length - 1}
						/>
					))}
				>
					<EnhancedEventsList params={params} />
					{coreEvents.length > 0 && (
						<EventsPagination
							currentPage={params.page || 1}
							hasMore={coreEvents.length !== 5}
						/>
					)}
				</Suspense>
			</div>
		</>
	)
}
