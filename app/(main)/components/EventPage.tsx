import { Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
	AvatarWithFallback,
	Button,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui'
import { Routes } from '@/lib/config'
import { useEventDateTime } from '@/lib/hooks'
import type { RouterOutput } from '@/server/api'
import { copy } from '../copy'
import { EventDateTime } from './EventDateTime'
import { EventLocation } from './EventLocation'

type EventPageData = RouterOutput['event']['get']
interface EventPageProps extends EventPageData {}
export const EventPage = ({
	startDate,
	endDate,
	slug,
	title,
	description,
	coverImage,
	host,
	rsvps,
	venueName,
	location,
	venueAddress,
	locationType,
	onlineUrl,
	rsvpCount,
	metadata,
}: EventPageProps) => {
	const { image, name, email } = host ?? {}
	const canManage = metadata?.user?.access?.manager
	const userRsvp = metadata?.user?.rsvp
	const { relative } = useEventDateTime({ start: startDate, end: endDate })
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
						<div className="flex flex-col gap-2 items-start">
							<div className="-space-x-1 flex">
								{(rsvps ?? []).map(
									({ name: guestName, email: guestEmail }) =>
										guestEmail &&
										guestName && (
											<Tooltip key={guestEmail}>
												<TooltipTrigger>
													<AvatarWithFallback className="size-4 mt-1" name={guestName} />
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
					</div>
				</div>
			</div>
			<div className="col-span-full lg:col-span-7 flex flex-col gap-3 lg:gap-4">
				<h1 className="lg:text-4xl text-2xl font-serif font-semibold">{title}</h1>
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
						{userRsvp ? (
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

											<p className="font-semibold text-muted-foreground text-sm">Starting In</p>
										</div>
										<p className="text-sm text-muted-foreground">{relative}</p>
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
								<Link href={Routes.Main.Events.ViewBySlugRegister(slug)} passHref replace>
									<Button className="w-full">Register Now</Button>
								</Link>
							</>
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
			</div>
		</div>
	)
}
