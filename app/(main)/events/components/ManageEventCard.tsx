import {
	Camera,
	Edit,
	Eye,
	Globe,
	Lock,
	ShieldCheck,
	Users as UsersIcon,
} from 'lucide-react'
import Link from 'next/link'
import { ShareActions, ShareLink } from '@/app/(main)/components'
import { Badge, Button, Image } from '@/components/ui'
import { Routes } from '@/lib/config'
import { cn } from '@/lib/utils'
import type { RouterOutput } from '@/server/api'
import { EventDateTime } from './EventDateTime'
import { EventLocation } from './EventLocation'

type RouterOutputEvent =
	| RouterOutput['event']['get']['enhanced']
	| RouterOutput['event']['get']['core']
type ManageEventCardProps = RouterOutputEvent

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

	return (
		<div className="flex flex-col gap-4 lg:gap-5">
			{/* Hero: Image + Core Info */}
			<div className="grid grid-cols-12 gap-4 lg:gap-5">
				{/* Cover Image */}
				<div className="col-span-full flex flex-col gap-3 lg:col-span-5">
					<div className="relative aspect-square w-full overflow-hidden rounded-xl">
						{coverImage ? (
							<Image
								src={coverImage}
								alt={title}
								fill
								className="h-full w-full object-cover"
								wrapperClassName="h-full w-full"
								sizes={{ lg: '336px', sm: '100vw' }}
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center bg-faint-white text-center font-medium text-sm tracking-wider">
								<div>
									<p>YOU</p>
									<p className="my-2">ARE</p>
									<p>INVITED</p>
								</div>
							</div>
						)}
						{/* Status overlay */}
						<div className="absolute top-3 left-3 flex gap-1.5">
							<Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
							{requiresApproval ? (
								<Badge
									variant="outline"
									className="gap-1 bg-black/40 backdrop-blur-sm"
								>
									<ShieldCheck className="size-3" />
									Approval
								</Badge>
							) : null}
						</div>
						{/* Share link overlay */}
						<div className="absolute right-0 bottom-0">
							<ShareLink
								display={`rs.vped/${id}`}
								url={Routes.Main.Events.ViewBySlug(slug)}
								className="rounded-br-xl rounded-tl-lg bg-black/40 backdrop-blur-sm"
							/>
						</div>
					</div>

					{/* Tags below image */}
					<div className="flex flex-wrap items-center gap-1.5">
						<Badge variant="outline" className="gap-1">
							<VisibilityIcon className="size-3" />
							{visibilityCfg.label}
						</Badge>
						{community !== null ? (
							<Link href={Routes.Main.Communities.ViewBySlug(community.slug)}>
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
				</div>

				{/* Core Info Column */}
				<div className="col-span-full flex flex-col gap-3 lg:col-span-7 lg:gap-4">
					{/* Date & Time */}
					<div className="flex flex-col gap-2">
						<p className="font-semibold text-sm">Date & Time</p>
						<hr className="border-muted-foreground/20" />
						<EventDateTime startDate={startDate} endDate={endDate} />
					</div>

					{/* Location */}
					<div className="flex flex-col gap-2">
						<p className="font-semibold text-sm">Location</p>
						<hr className="border-muted-foreground/20" />
						<EventLocation
							locationType={locationType}
							venueName={venueName}
							venueAddress={venueAddress}
							onlineUrl={onlineUrl}
							className="text-muted-foreground"
							size="lg"
						/>
					</div>

					{/* Quick Stats */}
					<div className="flex flex-col gap-2">
						<p className="font-semibold text-sm">At a Glance</p>
						<hr className="border-muted-foreground/20" />
						<div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
							<StatPill label="RSVPs" value={confirmedCount} />
							<StatPill label="Views" value={viewCount} />
							<StatPill label="Check-ins" value={checkInCount} />
							<StatPill label="Paid" value={paidRsvpCount} />
						</div>
						{/* Capacity */}
						{capacity !== null && capacity > 0 ? (
							<div className="flex items-center gap-2">
								<div className="h-1.5 flex-1 rounded-full bg-pale-white">
									<div
										className={cn(
											'h-full rounded-full transition-all',
											confirmedCount / capacity >= 0.9 ? 'bg-red' : 'bg-brand'
										)}
										style={{
											width: `${Math.min(Math.round((confirmedCount / capacity) * 100), 100)}%`,
										}}
									/>
								</div>
								<span className="text-muted-foreground text-xs">
									{confirmedCount}/{capacity}
								</span>
							</div>
						) : null}
					</div>
				</div>
			</div>

			{/* Description */}
			{description ? (
				<div className="flex flex-col gap-2">
					<p className="font-semibold text-sm">About Event</p>
					<hr className="border-muted-foreground/20" />
					<p className="line-clamp-3 text-muted-foreground text-sm">
						{description}
					</p>
				</div>
			) : null}

			{/* Action Buttons */}
			<div className="flex flex-1 gap-2">
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
				<Button variant="secondary" className="flex-1 gap-2" asChild>
					<Link href={Routes.Main.Events.ViewBySlug(slug)}>
						<Eye className="size-3" />
						View Public Page
					</Link>
				</Button>
			</div>

			{/* Share */}
			<ShareActions title={title} slug={slug} />
		</div>
	)
}

const StatPill = ({ label, value }: { label: string; value: number }) => (
	<div className="flex flex-col gap-0.5 rounded-xl bg-faint-white p-3">
		<p className="font-bold text-lg">{value || '-'}</p>
		<p className="text-muted-foreground text-xs">{label}</p>
	</div>
)
