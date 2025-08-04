import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import {
	Avatar,
	AvatarFallback,
	AvatarWithFallback,
	Badge,
	Button,
	Card,
	Image,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui'
import { Routes } from '@/lib/config'
import { RSVPBadgeVariants, RSVPLabels } from '@/lib/constants'
import { useEventDateTime } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import type { RouterOutput } from '@/server/api'
import { EventLocation } from './EventLocation'

type EventCardData = RouterOutput['event']['list'][number]
export interface EventCardProps extends EventCardData {
	isLast: boolean
}

export const EventCard = ({
	title,
	startDate,
	endDate,
	slug,
	venueAddress,
	locationType,
	onlineUrl,
	venueName,
	coverImage,
	host,
	rsvps,
	rsvpCount,
	eventCollaborators,
	metadata,
	isLast,
}: EventCardProps) => {
	const { start, relative, range } = useEventDateTime({
		start: startDate,
		end: endDate,
	})

	const canManage = metadata?.user?.access?.manager
	const rsvp = metadata?.user?.rsvp

	const status = rsvp?.status ? RSVPLabels[rsvp.status] : null
	const rsvpBadgeVariant = rsvp?.status
		? RSVPBadgeVariants[rsvp.status]
		: 'default'

	const renderEventCollaborators = () => (
		<div className="-space-x-1 flex">
			{(eventCollaborators ?? []).map(
				({ user: collaborator }) =>
					collaborator?.image &&
					collaborator?.name && (
						<Tooltip key={collaborator.id}>
							<TooltipTrigger>
								<AvatarWithFallback
									className="size-4"
									src={collaborator.image}
									name={collaborator.name}
								/>
							</TooltipTrigger>
							<TooltipContent>{collaborator.name}</TooltipContent>
						</Tooltip>
					)
			)}
			{host?.name && (
				<AvatarWithFallback
					src={host?.image}
					name={host?.name}
					className="size-4"
				/>
			)}
		</div>
	)

	return (
		<div className="grid w-full grid-cols-[repeat(24,_1fr)] gap-x-1 lg:gap-x-2">
			<div className="col-span-0 hidden flex-row gap-2 lg:col-span-3 lg:flex lg:flex-col">
				<p className="font-medium text-base text-bold">{relative}</p>
				<p className="text-muted-foreground text-sm">{start.dayOfWeek}</p>
			</div>
			<div
				className={cn(
					isLast && 'mask-b-from-1',
					'relative flex justify-start lg:justify-center'
				)}
			>
				<div className="-left-1 absolute top-1.5 size-2 rounded-full bg-white/30 lg:left-[unset]" />
				<div className="mt-3 h-[calc(100%-10px)] w-px border-white/20 border-l border-dashed" />
			</div>

			<div className="col-span-23 flex w-full flex-col gap-3 lg:col-span-20">
				<div className="flex items-center gap-2 text-left lg:hidden lg:flex-col">
					<p className="font-medium text-base text-bold">{relative}</p>
					<p className="text-muted-foreground text-sm">{start.dayOfWeek}</p>
				</div>
				<Card className="mb-3 w-full border-0 p-3 text-white lg:mb-6 lg:p-6">
					<div className="grid grid-cols-3 flex-col justify-between gap-4">
						<div className="col-span-2 flex flex-col gap-3.5 lg:gap-3.5">
							<Link
								href={Routes.Main.Events.ViewBySlug(slug)}
								passHref
								className="contents hover:[&_h2]:underline underline-offset-2"
							>
								<p className="text-muted-foreground text-sm">{range.time}</p>
								<h2 className="font-semibold text-xl">{title}</h2>
								{!canManage && (
									<div className="flex flex-row items-center gap-2">
										<div className="flex items-center gap-2">
											{renderEventCollaborators()}

											<p className="truncate font-medium text-muted-foreground text-sm">
												By {host.name}{' '}
												{eventCollaborators?.length > 0 &&
													`& ${eventCollaborators?.length} others`}
											</p>
										</div>
									</div>
								)}
							</Link>

							<div className="flex flex-row items-center gap-2">
								<EventLocation
									className="text-muted-foreground"
									locationType={locationType}
									venueName={venueName}
									venueAddress={venueAddress}
									onlineUrl={onlineUrl}
								/>
							</div>
							<div className="flex flex-row items-center gap-2">
								{status && <Badge variant={rsvpBadgeVariant}>{status}</Badge>}
								{rsvps.length > 0 && (
									<div className="-space-x-1 flex">
										{(rsvps ?? []).map(
											({ user: guestUser, name: guestName }) =>
												(guestUser?.name || guestName) && (
													<Tooltip key={guestUser?.id ?? guestName}>
														<TooltipTrigger>
															<AvatarWithFallback
																className="size-4"
																src={guestUser?.image ?? undefined}
																name={guestUser?.name ?? guestName ?? undefined}
															/>
														</TooltipTrigger>
														<TooltipContent>
															{guestUser?.name ?? guestName}
														</TooltipContent>
													</Tooltip>
												)
										)}
										{rsvpCount > 5 && (
											<Avatar>
												<AvatarFallback>
													<p className="text-[10px] text-muted-foreground">
														+{rsvpCount - 5}
													</p>
												</AvatarFallback>
											</Avatar>
										)}
									</div>
								)}
							</div>
							{canManage && (
								<div className="mt-2 flex flex-row gap-3">
									<Link
										passHref
										href={`${Routes.Main.Events.ManageBySlug(slug)}?next=${encodeURIComponent(Routes.Main.Events.Home)}`}
									>
										<Button variant="secondary">
											Manage Event
											<ArrowUpRight />
										</Button>
									</Link>
									<div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center">
										{renderEventCollaborators()}
										<p className="truncate font-medium text-muted-foreground text-sm">
											By you
											{eventCollaborators?.length > 0 &&
												` & ${eventCollaborators?.length} others`}
										</p>
									</div>
								</div>
							)}
						</div>
						<Link
							href={Routes.Main.Events.ViewBySlug(slug)}
							passHref
							className="contents"
						>
							<div className=" col-span-1 flex flex-col items-end">
								{coverImage && (
									<Image
										src={coverImage}
										alt={title}
										height={240}
										width={240}
										className="aspect-square rounded-md object-cover"
									/>
								)}
							</div>
						</Link>
					</div>
				</Card>
			</div>
		</div>
	)
}
