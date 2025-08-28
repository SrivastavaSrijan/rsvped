import { Clock } from 'lucide-react'
import { nanoid } from 'nanoid'
import Link from 'next/link'
import type { PropsWithChildren } from 'react'
import {
	AvatarWithFallback,
	Button,
	Image,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui'
import { Routes } from '@/lib/config'
import { getEventDateTime } from '@/lib/hooks'
import type { RouterOutput } from '@/server/api'
import { copy } from '../copy'
import { EventDateTime } from './EventDateTime'
import { EventLocation } from './EventLocation'

type EventPageData =
	| RouterOutput['event']['get']['enhanced']
	| RouterOutput['event']['get']['core']
type EventPageProps = EventPageData & PropsWithChildren

/**
 * Type guard to check if event data is enhanced with additional relations
 */
function isEnhancedEventData(
	event: EventPageData
): event is RouterOutput['event']['get']['enhanced'] {
	return 'metadata' in event && 'rsvps' in event
}

export const EventPage = (props: EventPageProps) => {
	const {
		startDate,
		endDate,
		slug,
		title,
		description,
		coverImage,
		host,
		venueName,
		location,
		venueAddress,
		locationType,
		onlineUrl,
		children,
	} = props

	// Enhanced properties with type guard
	const rsvps = isEnhancedEventData(props) ? props.rsvps : []
	const rsvpCount = props._count.rsvps
	const metadata = isEnhancedEventData(props) ? props.metadata : null
	const { image, name, email } = host ?? {}
	const canManage = metadata?.user?.access?.manager
	const userRsvp = metadata?.user?.rsvp
	const { relative } = getEventDateTime({ start: startDate, end: endDate })
	return (
		<div className="grid grid-cols-12 gap-4 lg:gap-5">
			<div className="col-span-full lg:col-span-5">
				<div className="flex flex-col gap-3 lg:gap-4">
					{coverImage && (
						<Image
							priority
							className="object-cover aspect-square rounded-lg"
							sizes={{ sm: '100vw', lg: '50vw' }}
							src={coverImage}
							alt={title}
							fill
							wrapperClassName="relative aspect-square h-auto w-full rounded-xl shadow-lg"
						/>
					)}
					{canManage && (
						<div className="p-2 rounded-lg lg:p-3 flex flex-row lg:gap-4 gap-3 bg-white/[0.04]">
							<p className="text-muted-foreground text-sm">
								You have manage access for this event.
							</p>
							<Link href={Routes.Main.Events.ManageBySlug(slug)} passHref>
								<Button variant="secondary">Manage Event</Button>
							</Link>
						</div>
					)}
					<div className="flex flex-col gap-2 lg:gap-2">
						<p className="font-semibold text-sm">Hosted By</p>
						<hr className="border-muted-foreground/20" />
						<div className="flex flex-row gap-3 items-center">
							<AvatarWithFallback src={image} alt={name ?? 'Host'} />
							<div className="flex flex-col mt-1">
								<p className="text-base font-semibold">{name}</p>
								<p className="text-sm text-muted-foreground">{email}</p>
							</div>
						</div>
					</div>
					<div className="flex flex-col gap-2 lg:gap-2">
						<p className="font-semibold text-sm">{rsvpCount} Going</p>
						<hr className="border-muted-foreground/20" />
						{isEnhancedEventData(props) ? (
							<div className="flex flex-col gap-2 items-start">
								<div className="-space-x-1 flex">
									{(rsvps ?? []).map(
										({ name: guestName, email: guestEmail }) =>
											guestEmail &&
											guestName && (
												<Tooltip key={guestEmail}>
													<TooltipTrigger>
														<AvatarWithFallback
															className="size-4 mt-1"
															name={guestName}
														/>
													</TooltipTrigger>
													<TooltipContent>{guestName}</TooltipContent>
												</Tooltip>
											)
									)}
								</div>
								<p className="text-sm text-muted-foreground">
									{(rsvps ?? [])
										.slice(0, 2)
										.map((rsvp) => rsvp?.name)
										.filter((value): value is string => !!value)
										.join(', ')}
									{(rsvps ?? []).length > 2 && ` and ${rsvpCount - 2} others`}
								</p>
							</div>
						) : (
							<RsvpListSkeleton />
						)}
					</div>
					<div className="lg:flex hidden">{children}</div>
				</div>
			</div>
			<div className="col-span-full lg:col-span-7 flex flex-col gap-3 lg:gap-4">
				<h1 className="lg:text-4xl text-2xl font-serif font-semibold">
					{title}
				</h1>
				<div className="flex flex-col gap-3 lg:gap-4">
					<EventDateTime startDate={startDate} endDate={endDate} />
					<EventLocation
						locationType={locationType}
						venueName={venueName}
						venueAddress={venueAddress}
						location={location}
						onlineUrl={onlineUrl}
						className="text-muted-foreground"
						size="lg"
					/>
				</div>
				<div className="flex flex-col rounded-xl ">
					<p className="text-sm w-full px-3 lg:px-4 py-2 rounded-tr-xl rounded-tl-xl bg-pale-white">
						Registration
					</p>
					<div className="flex flex-col gap-3 lg:gap-4 p-3 lg:p-4 rounded-br-xl rounded-bl-xl bg-faint-white">
						{isEnhancedEventData(props) ? (
							userRsvp ? (
								<div className="flex flex-col gap-3 lg:gap-3">
									<AvatarWithFallback
										src={userRsvp?.user?.image}
										alt={userRsvp?.user?.name ?? 'You'}
										name={userRsvp?.user?.name ?? 'You'}
										className="size-10 lg:size-12"
									/>
									<div className="flex flex-col w-full gap-0.5">
										<p className="text-xl font-serif">You're in!</p>
										<p className="text-base text-muted-foreground">
											Ticket: {userRsvp?.ticketTier?.name}
										</p>
									</div>
									<div className="p-3 lg:p-3 rounded-xl flex flex-col gap-2 lg:gap-2 bg-pale-white">
										<div className="flex flex-row  gap-2 lg:gap-3 items-center justify-between">
											<div className="flex flex-row gap-2 items-center">
												<Clock className="size-3 text-muted-foreground" />

												<p className="font-semibold text-muted-foreground text-sm">
													Starting In
												</p>
											</div>
											<p className="text-sm text-muted-foreground">
												{relative}
											</p>
										</div>
										<hr className="border-muted-foreground/20" />
										<Button variant="secondary" className="w-full">
											Add To Calendar
										</Button>
									</div>
								</div>
							) : (
								<>
									<p className="text-sm">{copy.welcome}</p>
									<Link
										href={Routes.Main.Events.ViewBySlugRegister(slug)}
										passHref
										replace
									>
										<Button className="w-full">Register Now</Button>
									</Link>
								</>
							)
						) : (
							<RegistrationSkeleton />
						)}
					</div>
				</div>
				{description && (
					<div className="flex flex-col gap-2 lg:gap-2">
						<p className="font-semibold text-sm">About Event</p>
						<hr className="border-muted-foreground/20" />
						<div className="flex flex-row gap-3 items-center">
							<p className="text-sm text-muted-foreground">{description}</p>
						</div>
					</div>
				)}
				<div className="flex lg:hidden">{children}</div>
			</div>
		</div>
	)
}

// Skeleton components for progressive loading
const RsvpListSkeleton = () => (
	<div className="flex flex-col gap-2 items-start">
		<div className="-space-x-1 flex">
			{Array.from({ length: 3 }).map(() => (
				<div
					key={nanoid()}
					className="size-4 mt-1 rounded-full bg-muted-foreground/20 animate-pulse"
				/>
			))}
		</div>
		<div className="h-4 w-32 bg-muted-foreground/20 rounded animate-pulse" />
	</div>
)

const RegistrationSkeleton = () => (
	<div className="flex flex-col gap-3 lg:gap-4">
		<div className="h-4 w-48 bg-muted-foreground/20 rounded animate-pulse" />
		<div className="h-10 w-full bg-muted-foreground/20 rounded animate-pulse" />
	</div>
)
