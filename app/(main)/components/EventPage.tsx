import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config'
import { useEventDateTime } from '@/lib/hooks'
import { getRandomColor } from '@/lib/utils'
import type { RouterOutput } from '@/server/api/root'
import { copy } from '../copy'
import { EventDateTime } from './EventDateTime'
import { EventLocation } from './EventLocation'

type EventPageData = RouterOutput['event']['getBySlug']
interface EventPageProps extends EventPageData {
	canManage: boolean
}
export const EventPage = ({
	startDate,
	endDate,
	slug,
	title,
	description,
	coverImage,
	host,
	eventCollaborators,
	venueName,
	venueAddress,
	locationType,
	onlineUrl,
	canManage,
}: EventPageProps) => {
	const { start, end, range } = useEventDateTime({ start: startDate, end: endDate })
	const backgroundColor = getRandomColor({ seed: slug, intensity: 70 })
	return (
		<div className="grid grid-cols-12 gap-4 lg:gap-5">
			<div className="col-span-full lg:col-span-5">
				<div className="flex flex-col gap-3 lg:gap-4">
					{coverImage && (
						<div className="relative aspect-square h-auto w-full rounded-xl shadow-lg">
							<Image
								priority
								className="object-cover aspect-square rounded-lg"
								sizes="(max-width: 640px) 100vw, (min-width: 641px) 50vw"
								src={coverImage}
								alt={title}
								fill
							/>
						</div>
					)}
					{canManage && (
						<div
							className="p-2 rounded-lg lg:p-3 flex flex-row lg:gap-4 gap-3"
							style={{ backgroundColor }}
						>
							<p className="text-muted-foreground text-sm">
								You have manage access for this event.
							</p>
							<Link href={Routes.Main.Events.ManageBySlug(slug)} passHref>
								<Button variant="secondary">Manage Event</Button>
							</Link>
						</div>
					)}
				</div>
			</div>
			<div className="col-span-full lg:col-span-7 flex flex-col gap-3 lg:gap-4">
				<h1 className="lg:text-4xl text-2xl font-serif font-semibold">{title}</h1>
				<div className="flex flex-col gap-2">
					<EventDateTime startDate={startDate} endDate={endDate} />
					<EventLocation
						locationType={locationType}
						venueName={venueName}
						venueAddress={venueAddress}
						onlineUrl={onlineUrl}
						className="text-muted-foreground"
						size="lg"
					/>
				</div>
				<div className="block">
					<p
						className="text-sm w-full px-3 lg:px-4 py-2 rounded-tr-xl rounded-tl-xl"
						style={{ backgroundColor }}
					>
						Registration
					</p>
					<div
						className="flex flex-col gap-3 lg:gap-4 p-3 lg:p-4 rounded-br-xl rounded-bl-xl border"
						style={{ borderColor: backgroundColor }}
					>
						<p className="text-sm">{copy.welcome}</p>
						<Link href={Routes.Main.Events.ViewBySlugWithRegister(slug)} passHref>
							<Button className="w-full">Register Now</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
