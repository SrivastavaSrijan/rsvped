import dayjs from 'dayjs'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { EventCard } from '@/app/(main)/components/EventCard'
import { EventsPagination } from '@/app/(main)/components/EventsPagination'
import { PeriodTabs } from '@/app/(main)/components/PeriodTabs'
import { copy } from '@/app/(main)/copy'
import { DateFilterMessage, EventCalendar } from '@/components/shared'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'

interface CommunityEventsProps {
	communityId: string
	period: 'upcoming' | 'past'
	page: number
	on?: string
	after?: string
	before?: string
}

function getDateFilters({
	on,
	after,
	before,
	period,
}: {
	on?: string
	after?: string
	before?: string
	period: string
}) {
	const now = dayjs().toISOString()

	if (on) {
		return {
			after: dayjs(on).startOf('day').toISOString(),
			before: dayjs(on).endOf('day').toISOString(),
		}
	}

	return {
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
	}
}

export const CommunityEvents = async ({
	communityId,
	period,
	page,
	on,
	after,
	before,
}: CommunityEventsProps) => {
	const { after: finalAfter, before: finalBefore } = getDateFilters({
		on,
		after,
		before,
		period,
	})
	const api = await getAPI()
	const events = await api.event.list({
		sort: 'asc',
		after: finalAfter,
		before: finalBefore,
		page,
		where: {
			communityId,
		},
	})

	return (
		<>
			<div className="grid grid-cols-12 lg:gap-4 gap-4">
				<div className="col-span-12 lg:col-span-4 lg:order-2 flex lg:flex-col flex-row gap-4">
					<Link href={Routes.Main.Events.Create} passHref>
						<Button variant="secondary">
							<Plus />
							Submit Event
						</Button>
					</Link>
					<EventCalendar />
				</div>
				<div className="col-span-12 lg:col-span-8 lg:order-1 flex flex-col gap-4 lg:gap-8">
					<div className="flex flex-col gap-3 lg:gap-2">
						<div className="flex w-full flex-row justify-between gap-4">
							<h1 className="font-bold text-2xl lg:px-0 lg:text-4xl">
								{copy.home.title}
							</h1>
							<PeriodTabs currentPeriod={period} />
						</div>
						<DateFilterMessage />
					</div>
					{events.map((event, index) => (
						<EventCard
							key={event.id}
							{...event}
							isLast={index === events.length - 1}
						/>
					))}
				</div>
			</div>
			{events.length > 0 && (
				<EventsPagination
					currentPage={page}
					searchParams={{ period }}
					hasMore={events.length === 5}
				/>
			)}
		</>
	)
}
