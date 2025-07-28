'use client'
import { chunk } from 'lodash'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui'
import type { RouterOutput } from '@/server/api/root'
import { EventDiscoverCard } from './EventDiscoverCard'

type NearbyEventsData = RouterOutput['event']['getEventsByLocation'][number]
interface NearbyEventsProps {
	nearbyEvents: NearbyEventsData[]
}
const DESKTOP_PAGE_SIZE = 6 // 2 columns * 3 rows
const MOBILE_PAGE_SIZE = 3 // 1 column * 3 rows

export const NearbyEvents = ({ nearbyEvents }: NearbyEventsProps) => {
	const mobilePages = chunk(nearbyEvents, MOBILE_PAGE_SIZE)
	const desktopPages = chunk(nearbyEvents, DESKTOP_PAGE_SIZE)

	return (
		<>
			{/* Mobile Carousel: 3 items per page. Hidden on sm screens and up. */}
			<Carousel opts={{ align: 'start' }} className="w-full sm:hidden">
				<CarouselContent className="-ml-2">
					{mobilePages.map((page, index) => (
						<CarouselItem
							key={`mobile-${
								// biome-ignore lint/suspicious/noArrayIndexKey: reasonable use of index as key
								index
							}`}
							className="pl-2 basis-10/12 flex flex-col gap-4"
						>
							{page.map((event) => (
								<EventDiscoverCard key={event.id} {...event} />
							))}
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>

			{/* Desktop Carousel: 6 items per page. Hidden below sm screens. */}
			<Carousel opts={{ align: 'start' }} className="hidden w-full sm:block">
				<CarouselContent>
					{desktopPages.map((page, index) => (
						<CarouselItem
							key={`desktop-${
								// biome-ignore lint/suspicious/noArrayIndexKey: reasonable use of index as key
								index
							}`}
							className="grid grid-cols-2 gap-4"
						>
							{page.map((event) => (
								<EventDiscoverCard key={event.id} {...event} />
							))}
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</>
	)
}
