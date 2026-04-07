'use client'

import { makeAssistantToolUI } from '@assistant-ui/react'
import {
	CalendarDays,
	Clock,
	Globe,
	Loader2,
	MapPin,
	Ticket,
	Users,
	XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { Badge, Card, CardContent, Skeleton } from '@/components/ui'

interface EventDetailResult {
	id: string
	title: string
	slug: string
	description: string | null
	startDate: string
	endDate: string
	timezone: string | null
	locationType: string
	coverImage: string | null
	location: string
	community: { name: string; slug: string } | null
	host: { name: string; username: string | null } | null
	categories: string[]
	rsvpCount: number
	ticketTiers: {
		name: string
		priceCents: number
		available: number
		total: number
	}[]
}

type GetEventDetailsArgs = { eventIdOrSlug: string }
type GetEventDetailsResult = EventDetailResult | { error: string }

const LOCATION_TYPE_LABELS: Record<string, string> = {
	PHYSICAL: 'In-person',
	ONLINE: 'Online',
	HYBRID: 'Hybrid',
}

export const GetEventDetailsToolUI = makeAssistantToolUI<
	GetEventDetailsArgs,
	GetEventDetailsResult
>({
	toolName: 'getEventDetails',
	render: ({ result, status }) => {
		if (status.type === 'running') {
			return (
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Loader2 className="size-3 animate-spin" />
						Fetching event details...
					</div>
					<Card className="gap-0 py-0">
						<CardContent className="flex flex-col gap-2.5 p-3 lg:gap-3 lg:p-4">
							<Skeleton className="h-5 w-3/4" />
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-3 w-2/3" />
							<div className="flex gap-4">
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-3 w-24" />
							</div>
						</CardContent>
					</Card>
				</div>
			)
		}

		if (status.type === 'incomplete') {
			return (
				<div className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
					<XCircle className="size-3.5 shrink-0" />
					Failed to fetch event details
				</div>
			)
		}

		if (!result || 'error' in result) {
			return (
				<div className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
					<XCircle className="size-3.5 shrink-0" />
					{result && 'error' in result ? result.error : 'Event not found'}
				</div>
			)
		}

		const start = new Date(result.startDate)
		const end = new Date(result.endDate)
		const dateStr = start.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
		})
		const timeStr = `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`

		return (
			<Link href={`/events/${result.slug}/view`} className="group block w-full min-w-0 overflow-hidden">
				<Card className="gap-0 overflow-hidden py-0 transition-colors group-hover:border-brand/30">
					<CardContent className="flex flex-col gap-2.5 p-3 lg:gap-3 lg:p-4">
						<div className="flex flex-col gap-1">
							<p className="truncate font-semibold text-sm group-hover:text-brand">
								{result.title}
							</p>
							{result.host ? (
								<p className="text-xs text-muted-foreground">
									Hosted by {result.host.name}
								</p>
							) : null}
						</div>

						<div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
							<span className="flex items-center gap-1">
								<CalendarDays className="size-3" />
								{dateStr}
							</span>
							<span className="flex items-center gap-1">
								<Clock className="size-3" />
								{timeStr}
							</span>
							<span className="flex items-center gap-1">
								<MapPin className="size-3" />
								{result.location}
							</span>
							<span className="flex items-center gap-1">
								<Globe className="size-3" />
								{LOCATION_TYPE_LABELS[result.locationType] ??
									result.locationType}
							</span>
							<span className="flex items-center gap-1">
								<Users className="size-3" />
								{result.rsvpCount} RSVP{result.rsvpCount !== 1 ? 's' : ''}
							</span>
						</div>

						{result.ticketTiers.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{result.ticketTiers.map((tier) => (
									<Badge
										key={tier.name}
										variant="outline"
										className="flex items-center gap-1 text-xs"
									>
										<Ticket className="size-3" />
										{tier.name}
										{tier.priceCents > 0
											? ` · $${(tier.priceCents / 100).toFixed(2)}`
											: ' · Free'}
									</Badge>
								))}
							</div>
						) : null}

						{result.categories.length > 0 ? (
							<div className="flex flex-wrap gap-1">
								{result.categories.map((cat) => (
									<Badge
										key={cat}
										variant="outline"
										className="px-1.5 py-0 text-[10px]"
									>
										{cat}
									</Badge>
								))}
							</div>
						) : null}

						{result.community ? (
							<p className="text-xs text-muted-foreground">
								Community:{' '}
								<span className="text-foreground">{result.community.name}</span>
							</p>
						) : null}
					</CardContent>
				</Card>
			</Link>
		)
	},
})
