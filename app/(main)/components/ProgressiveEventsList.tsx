import dayjs from 'dayjs'
import { Suspense } from 'react'
import { DateFilterMessage } from '@/components/shared'
import type {
	EventListSearchParams,
	RouterInput,
	RouterOutput,
} from '@/server/api'
import { EventTimeFrame, getAPI, SortDirection } from '@/server/api'
import { copy } from '../copy'
import { EventCard } from './EventCard'
import { EventsPagination } from './EventsPagination'
import { NoEvents } from './NoEvents'
import { PeriodTabs } from './PeriodTabs'

export type BuildEventListInputParams = Pick<
	RouterInput['event']['list']['core'],
	'roles' | 'where'
> &
	EventListSearchParams

export type EventListInput = RouterInput['event']['list']['core']

export function buildEventListQuery({
	on,
	page,
	size,
	after,
	before,
	period = EventTimeFrame.UPCOMING,
	...rest
}: BuildEventListInputParams): EventListInput {
	const now = dayjs().toISOString()

	if (on) {
		return {
			after: dayjs(on).startOf('day').toISOString(),
			before: dayjs(on).endOf('day').toISOString(),
		}
	}
	return {
		period,
		page: +(page ?? 1),
		size: +(size ?? 10),
		sort:
			period === EventTimeFrame.UPCOMING
				? SortDirection.ASC
				: SortDirection.DESC,
		after: after
			? dayjs(after).startOf('day').toISOString()
			: period === EventTimeFrame.UPCOMING
				? now
				: undefined,
		before: before
			? dayjs(before).endOf('day').toISOString()
			: period === EventTimeFrame.PAST
				? now
				: undefined,
		...rest,
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
	params: EventListInput
	isEmpty?: boolean
	emptyStateSlot?: React.ReactNode
}

export const ProgressiveEventsList = ({
	coreEvents,
	params,
}: ProgressiveEventsListProps) => {
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
				{coreEvents.length === 0 && <NoEvents />}
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
