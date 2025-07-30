import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { AssetMap, Routes } from '@/lib/config'
import { getAPI } from '@/server/api'
import { EventCard, EventsPagination } from '.'

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
		attendee: true,
		manager: true,
		cohost: true,
	})

	if (events.length === 0) {
		return (
			<div className="flex h-[90vw] w-full flex-col items-center justify-center gap-4 lg:h-[50vw]">
				<Image src={AssetMap.NoEvents} alt="No events" width={200} height={200} className="mb-4" />
				<p className="text-muted-foreground text-sm">
					{period === 'upcoming'
						? 'Looks like there are no upcoming events!'
						: 'No past events found.'}
				</p>
				<Link href={Routes.Main.Events.Create} passHref>
					<Button variant="outline">Create Event</Button>
				</Link>
			</div>
		)
	}

	return (
		<>
			{events.map((event, index) => (
				<EventCard key={event.slug} {...event} isLast={index === events.length - 1} />
			))}
			<EventsPagination
				currentPage={page}
				searchParams={{ period }}
				hasMore={events.length === 5}
			/>
		</>
	)
}
