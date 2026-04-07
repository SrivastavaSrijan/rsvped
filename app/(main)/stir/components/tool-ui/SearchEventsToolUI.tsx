'use client'

import { makeAssistantToolUI } from '@assistant-ui/react'
import { CheckCircle2, Loader2, MapPin, Users, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Badge, Card, CardContent, Skeleton } from '@/components/ui'
import type { ToolEventResult } from '@/lib/ai/agent'

type SearchEventsArgs = {
	query: string
	category?: string
	city?: string
	dateAfter?: string
	dateBefore?: string
	limit?: number
}

type SearchEventsResult = ToolEventResult[] | { error: string }

export const SearchEventsToolUI = makeAssistantToolUI<
	SearchEventsArgs,
	SearchEventsResult
>({
	toolName: 'searchEvents',
	render: ({ args, result, status }) => {
		if (status.type === 'running') {
			return <SearchEventsSkeleton query={args.query} />
		}

		if (status.type === 'incomplete') {
			return (
				<div className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
					<XCircle className="size-3.5 shrink-0" />
					Failed to search events
				</div>
			)
		}

		if (!result || 'error' in result) {
			return (
				<div className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
					<XCircle className="size-3.5 shrink-0" />
					{result && 'error' in result ? result.error : 'No results returned'}
				</div>
			)
		}

		if (result.length === 0) {
			return (
				<div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
					No matching events found
				</div>
			)
		}

		return (
			<div className="flex w-full min-w-0 flex-col gap-2 overflow-hidden">
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<CheckCircle2 className="size-3 text-green-600" />
					Found {result.length} event{result.length !== 1 ? 's' : ''}
				</div>
				<div className="grid gap-2">
					{result.slice(0, 5).map((event) => (
						<EventResultCard key={event.id} event={event} />
					))}
				</div>
				{result.length > 5 ? (
					<p className="text-xs text-muted-foreground">
						+{result.length - 5} more result
						{result.length - 5 !== 1 ? 's' : ''}
					</p>
				) : null}
			</div>
		)
	},
})

const EventResultCard = ({ event }: { event: ToolEventResult }) => {
	const startDate = new Date(event.startDate)
	const month = startDate.toLocaleDateString('en-US', { month: 'short' })
	const day = startDate.getDate()

	return (
		<Link href={`/events/${event.slug}/view`} className="group block">
			<Card className="gap-0 overflow-hidden py-0 transition-colors group-hover:border-brand/30 group-hover:bg-muted/50">
				<CardContent className="flex items-start gap-2.5 p-2.5 lg:gap-3 lg:p-3">
					<div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-md bg-brand/10 text-brand lg:size-10">
						<span className="text-[10px] font-medium uppercase leading-none">
							{month}
						</span>
						<span className="font-bold text-xs leading-tight lg:text-sm">
							{day}
						</span>
					</div>
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<p className="truncate font-medium text-xs group-hover:text-brand lg:text-sm">
							{event.title}
						</p>
						<div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
							<span className="flex items-center gap-1 truncate">
								<MapPin className="size-3 shrink-0" />
								<span className="truncate">{event.location}</span>
							</span>
							<span className="flex items-center gap-1">
								<Users className="size-3 shrink-0" />
								{event.rsvpCount} RSVP{event.rsvpCount !== 1 ? 's' : ''}
							</span>
						</div>
						{event.categories.length > 0 ? (
							<div className="flex flex-wrap gap-1">
								{event.categories.slice(0, 2).map((cat) => (
									<Badge
										key={cat}
										variant="outline"
										className="px-1.5 py-0 text-[10px]"
									>
										{cat}
									</Badge>
								))}
								{event.categories.length > 2 ? (
									<Badge
										variant="outline"
										className="px-1.5 py-0 text-[10px]"
									>
										+{event.categories.length - 2}
									</Badge>
								) : null}
							</div>
						) : null}
					</div>
				</CardContent>
			</Card>
		</Link>
	)
}

const SearchEventsSkeleton = ({ query }: { query?: string }) => {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
				<Loader2 className="size-3 animate-spin" />
				Searching events{query ? ` for "${query}"` : ''}...
			</div>
			<div className="grid gap-2">
				{['a', 'b', 'c'].map((id) => (
					<Card key={`skeleton-${id}`} className="gap-0 py-0">
						<CardContent className="flex items-start gap-2.5 p-2.5 lg:gap-3 lg:p-3">
							<Skeleton className="size-9 shrink-0 rounded-md lg:size-10" />
							<div className="flex flex-1 flex-col gap-1.5">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-1/2" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
