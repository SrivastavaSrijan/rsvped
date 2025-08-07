import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Button, Image } from '@/components/ui'
import { AssetMap, Routes } from '@/lib/config'
import { getEventDateTime } from '@/lib/hooks'
import type { RouterOutput } from '@/server/api'

type CommunityData = RouterOutput['community']['list'][number]
type UserCommunityItemProps = CommunityData

export const UserCommunityEventItem = ({
	event,
}: {
	event: CommunityData['events'][number]
}) => {
	const { range } = getEventDateTime({
		start: event?.startDate,
		end: event?.endDate,
	})
	return (
		<div className="flex flex-col gap-1">
			<Link href={Routes.Main.Events.ViewBySlug(event.slug)} passHref>
				<Button variant="link" size="sm" className="text-base -mx-2">
					{event.title}
					<ArrowUpRight className="size-3" />
				</Button>
			</Link>
			<p className="text-xs text-muted-foreground">{range?.date}</p>
			<p className="text-xs text-muted-foreground">{range?.time}</p>

			<div className="flex flex-row items-center gap-2" />
		</div>
	)
}

export const UserCommunityItem = ({
	id,
	name,
	coverImage,
	_count,
	events,
}: UserCommunityItemProps) => {
	return (
		<div
			key={id}
			className="bg-card lg:grid lg:grid-cols-12 flex flex-col gap-4 p-4 rounded-lg shadow-sm"
		>
			<div className="col-span-12 lg:col-span-4 flex flex-col items-start lg:gap-4 gap-2">
				<Image
					src={coverImage || AssetMap.NoEvents}
					alt={name}
					className="aspect-video rounded-lg object-cover"
					fill
					wrapperClassName="relative aspect-square h-[75px] w-[75px] rounded-lg"
					sizes={{ lg: '30vw', sm: '50vw' }}
				/>
				<div className="col-span-12 lg:col-span-8 flex flex-col justify-center">
					<div className="flex flex-col lg:gap-2 gap-1">
						<h3 className="lg:text-lg text-base font-semibold">{name}</h3>
						<p className="text-sm text-muted-foreground">
							{_count.members} members
						</p>
						<Link href={Routes.Main.Communities.ViewBySlug(name)} passHref>
							<Button variant="secondary">View</Button>
						</Link>
					</div>
				</div>
			</div>
			<hr className="lg:hidden" />
			<div className="flex flex-col lg:col-span-8 gap-2">
				<div className="flex gap-2 flex-col lg:gap-3">
					<p className="text-xs text-muted-foreground">Upcoming Events</p>
					{events.length > 0 ? (
						events.map((event) => (
							<UserCommunityEventItem key={event.id} event={event} />
						))
					) : (
						<p className="text-sm text-muted-foreground">No upcoming events</p>
					)}
				</div>
			</div>
		</div>
	)
}
