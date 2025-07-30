import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { AssetMap, Routes } from '@/lib/config'
import { getAPI } from '@/server/api'
import { EventCard, EventsPagination, PeriodTabs } from '../../components'
import { copy } from '../../copy'

const now = new Date().toISOString()

export const metadata: Metadata = {
	title: "Events  · RSVP'd",
	description: "View events you have RSVP'd to or are interested in.",
}
export default async function EventsHome({
	searchParams,
}: {
	searchParams: Promise<{ period?: string; page?: string }>
}) {
	const { period = 'upcoming', page = '1' } = await searchParams
	const api = await getAPI()
	const events = await api.event.list({
		sort: 'asc',
		after: period === 'upcoming' ? now : undefined,
		before: period === 'past' ? now : undefined,
		page: parseInt(page, 10) || 1,
		attendee: true,
		manager: true,
		cohost: true,
	})

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="flex w-full flex-row justify-between gap-4">
				<h1 className="font-bold text-2xl lg:px-0 lg:text-4xl">{copy.home.title}</h1>
				<PeriodTabs currentPeriod={period as 'upcoming' | 'past'} />
			</div>

			<div className="flex h-full w-full flex-col items-center justify-center">
				{events.length === 0 && (
					<div className="flex h-[90vw] w-full flex-col items-center justify-center gap-4 lg:h-[50vw]">
						<Image
							src={AssetMap.NoEvents}
							alt="No events"
							width={200}
							height={200}
							className="mb-4"
						/>
						<p className="text-muted-foreground text-sm">
							{period === 'upcoming'
								? 'Looks like there are no upcoming events!'
								: 'No past events found.'}
						</p>
						<Link href={Routes.Main.Events.Create} passHref>
							<Button variant="outline">Create Event</Button>
						</Link>
					</div>
				)}

				{events.map((event, index) => {
					return <EventCard key={event.slug} {...event} isLast={index === events.length - 1} />
				})}

				{events.length > 0 && (
					<EventsPagination
						currentPage={parseInt(page, 10)}
						searchParams={{ period }}
						hasMore={events.length === 5}
					/>
				)}
			</div>
		</div>
	)
}
