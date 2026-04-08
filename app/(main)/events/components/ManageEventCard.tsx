import {
	Camera,
	Clock,
	Edit,
	Eye,
	Globe,
	Lock,
	ShieldCheck,
	Users as UsersIcon,
} from 'lucide-react'
import Link from 'next/link'
import { ShareActions, ShareLink, Stats } from '@/app/(main)/components'
import { Badge, Button, Card, Image } from '@/components/ui'
import { Routes } from '@/lib/config'
import { cn } from '@/lib/utils'
import type { RouterOutput } from '@/server/api'
import { EventDateTime } from './EventDateTime'
import { EventLocation } from './EventLocation'

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

const statusConfig = {
	DRAFT: { label: 'Draft', variant: 'secondary' as const },
	PUBLISHED: { label: 'Published', variant: 'success' as const },
	CANCELLED: { label: 'Cancelled', variant: 'destructive' as const },
}

const visibilityConfig = {
	PUBLIC: { label: 'Public', icon: Globe },
	PRIVATE: { label: 'Private', icon: Lock },
	MEMBER_ONLY: { label: 'Members Only', icon: UsersIcon },
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
		checkInCount,
		rsvpCount,
		viewCount,
		status,
		visibility,
		capacity,
		description,
		subtitle,
		timezone,
		requiresApproval,
		paidRsvpCount,
	} = props

	const enhanced = isEnhancedEventData(props) ? props : null
	const community = enhanced?.community ?? null
	const categories = enhanced?.categories ?? []

	const statusCfg = statusConfig[status]
	const visibilityCfg = visibilityConfig[visibility]
	const VisibilityIcon = visibilityCfg.icon

	const confirmedCount = rsvpCount || props._count?.rsvps || 0
	const capacityPercent =
		capacity !== null && capacity > 0
			? Math.min(Math.round((confirmedCount / capacity) * 100), 100)
			: null

	return (
		<Card className="w-full p-3 text-white lg:p-6">
			<div className="grid grid-cols-12 items-start justify-stretch gap-6 lg:flex-row lg:gap-6">
				{/* Cover Image */}
				<div className="col-span-full flex w-full flex-col justify-between gap-2 lg:col-span-6 lg:w-fit lg:justify-center lg:gap-2">
					<div className="relative flex h-72 w-full shrink-0 items-center justify-between lg:size-84">
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
						{/* Status & Visibility Badges */}
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
							<Badge variant="outline" className="gap-1">
								<VisibilityIcon className="size-3" />
								{visibilityCfg.label}
							</Badge>
							{requiresApproval ? (
								<Badge variant="outline" className="gap-1">
									<ShieldCheck className="size-3" />
									Approval Required
								</Badge>
							) : null}
						</div>

						{/* Subtitle */}
						{subtitle ? (
							<p className="text-muted-foreground text-sm">{subtitle}</p>
						) : null}

						{/* When & Where */}
						<div className="flex flex-col gap-3 lg:flex-col lg:gap-3">
							<h2 className="font-semibold font-stretch-semi-condensed text-base lg:text-lg">
								When & Where
							</h2>
							<div className="flex flex-col gap-2">
								<EventDateTime startDate={startDate} endDate={endDate} />
								<div className="flex items-center gap-1 text-muted-foreground text-xs">
									<Clock className="size-3" />
									<span>{timezone}</span>
								</div>
							</div>
						</div>

						<EventLocation
							locationType={locationType}
							venueName={venueName}
							venueAddress={venueAddress}
							onlineUrl={onlineUrl}
							className="text-muted-foreground"
							size="lg"
						/>

						{/* Stats */}
						<Stats
							checkInCount={checkInCount}
							rsvpCount={confirmedCount}
							viewCount={viewCount}
							paidRsvpCount={paidRsvpCount}
						/>

						{/* Capacity Bar */}
						{capacityPercent !== null ? (
							<div className="flex flex-col gap-1">
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">Capacity</span>
									<span>
										{confirmedCount} / {capacity}
									</span>
								</div>
								<div className="h-1.5 w-full rounded-full bg-white/10">
									<div
										className={cn(
											'h-full rounded-full transition-all',
											capacityPercent >= 90 ? 'bg-destructive' : 'bg-brand'
										)}
										style={{ width: `${capacityPercent}%` }}
									/>
								</div>
							</div>
						) : null}

						{/* Community & Categories */}
						{community !== null || categories.length > 0 ? (
							<div className="flex flex-wrap items-center gap-2">
								{community !== null ? (
									<Link
										href={Routes.Main.Communities.ViewBySlug(community.slug)}
									>
										<Badge variant="secondary" className="gap-1">
											<UsersIcon className="size-3" />
											{community.name}
										</Badge>
									</Link>
								) : null}
								{categories.map((ec) => (
									<Badge key={ec.category.id} variant="outline">
										{ec.category.name}
									</Badge>
								))}
							</div>
						) : null}

						{/* Description Preview */}
						{description ? (
							<div className="flex flex-col gap-1">
								<h2 className="font-semibold font-stretch-semi-condensed text-base lg:text-lg">
									About
								</h2>
								<p className="line-clamp-3 text-muted-foreground text-sm">
									{description}
								</p>
							</div>
						) : null}
					</div>

					{/* Action Buttons */}
					<div className="flex w-full flex-col gap-2 lg:gap-2">
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
						<Button variant="outline" className="gap-2" asChild>
							<Link href={Routes.Main.Events.ViewBySlug(slug)}>
								<Eye className="size-3" />
								View Public Page
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</Card>
	)
}
