import { Camera, Edit } from 'lucide-react'
import Link from 'next/link'
import { ShareActions, ShareLink } from '@/app/(main)/components'
import { Button, Card, Image } from '@/components/ui'
import { Routes } from '@/lib/config'
import type { RouterOutput } from '@/server/api'
import { EventDateTime } from './EventDateTime'
import { EventLocation } from './EventLocation'

// import { Stats } from './Stats'

type RouterOutputEvent =
	| RouterOutput['event']['get']['enhanced']
	| RouterOutput['event']['get']['core']
type ManageEventCardProps = RouterOutputEvent

/**
 * Type guard to check if event data is enhanced with additional relations
 */
function isEnhancedEventData(
	event: RouterOutputEvent
): event is RouterOutput['event']['get']['enhanced'] {
	return 'metadata' in event && 'rsvps' in event
}

export function ManageEventCard(props: ManageEventCardProps) {
	const {
		title,
		id,
		startDate,
		endDate,
		coverImage,
		venueName,
		venueAddress,
		locationType,
		onlineUrl,
		slug,
	} = props
	const _metadata = isEnhancedEventData(props) ? props.metadata : null
	return (
		<Card className="w-full p-3 text-white lg:p-6">
			<div className="grid grid-cols-12 items-start justify-stretch gap-6 lg:flex-row lg:gap-6">
				<div className="col-span-full flex w-full flex-col justify-between gap-2 lg:col-span-6 lg:w-fit lg:justify-center lg:gap-2">
					<div className="relative flex h-72 w-full flex-shrink-0 items-center justify-between lg:size-84">
						{coverImage ? (
							<Image
								src={coverImage}
								alt={title}
								fill
								className="h-full w-full rounded-lg object-cover"
								wrapperClassName="h-full w-full"
								sizes={{ lg: '336px', sm: '288px' }}
							/>
						) : (
							<div className="aspect-square text-center font-medium text-sm tracking-wider">
								<p>YOU</p>
								<p className="my-2">ARE</p>
								<p>INVITED</p>
							</div>
						)}
						<div className="absolute inset-0 flex items-end justify-end">
							<ShareLink
								display={`rs.vped/${id}`}
								url={Routes.Main.Events.ViewBySlug(slug)}
								className="rounded-br-lg rounded-bl-lg bg-white/10"
							/>
						</div>
					</div>
					<ShareActions title={title} slug={slug} />
				</div>

				{/* Event Info */}
				<div className="col-span-full flex h-full flex-1 flex-col justify-between gap-6 lg:col-span-6 lg:gap-8">
					<div className="flex flex-col gap-6 lg:gap-8">
						<div className="flex flex-col gap-3 lg:flex-col lg:gap-3">
							<h1 className="font-semibold font-stretch-semi-condensed text-base lg:text-lg">
								When & Where
							</h1>
							<EventDateTime startDate={startDate} endDate={endDate} />
						</div>

						<EventLocation
							locationType={locationType}
							venueName={venueName}
							venueAddress={venueAddress}
							onlineUrl={onlineUrl}
							className="text-muted-foreground"
							size="lg"
						/>
						{/* <Stats
							checkInCount={checkInCount}
							rsvpCount={rsvpCount || props._count?.rsvps || 0}
							viewCount={viewCount}
						/> */}
					</div>
					<div className="flex w-full flex-col gap-2 lg:gap-2">
						{/* Action Buttons */}
						<div className="flex gap-2">
							<Button variant="secondary" className="flex-1 gap-2" asChild>
								<Link href={Routes.Main.Events.EditBySlug(slug)}>
									<Edit className="size-3" />
									Edit Event
								</Link>
							</Button>
							<Button variant="secondary" className="flex-1 gap-2">
								<Camera className="size-3" />
								Change Photo
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Card>
	)
}
