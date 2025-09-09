import { ArrowUpRight } from 'lucide-react'
import { nanoid } from 'nanoid'
import Link from 'next/link'
import { Button, Image, Skeleton } from '@/components/ui'
import { AssetMap, Routes } from '@/lib/config'
import {
	getEventDateTime,
	useHighlighter,
	useSearchMatchReason,
} from '@/lib/hooks'
import type { ExtractPaginatedData, RouterOutput } from '@/server/api'
import type { SearchMatchInfo } from '@/server/api/routers/stir/helpers'

type CommunityData =
	| ExtractPaginatedData<RouterOutput['community']['list']['core']>
	| ExtractPaginatedData<RouterOutput['community']['list']['enhanced']>
	| (ExtractPaginatedData<RouterOutput['stir']['search']['communities']> & {
			_searchMetadata?: {
				matches: SearchMatchInfo[]
				score: number
				query: string
			}
	  })

type UserCommunityItemProps = CommunityData & {
	nameRenderer?: (name: string) => React.ReactNode
	searchQuery?: string
}

// Type guard to check if community data has events (enhanced data)
function hasEvents(
	community: CommunityData
): community is ExtractPaginatedData<
	RouterOutput['community']['list']['enhanced']
> {
	return 'events' in community && Array.isArray(community.events)
}

export const UserCommunityEventItem = ({
	event,
}: {
	event: NonNullable<
		ExtractPaginatedData<
			RouterOutput['community']['list']['enhanced']
		>['events']
	>[number]
}) => {
	const { range } = getEventDateTime({
		start: event?.startDate,
		end: event?.endDate,
	})
	return (
		<div className="flex flex-col gap-1 w-full">
			<Link
				href={Routes.Main.Events.ViewBySlug(event.slug)}
				passHref
				className="contents"
			>
				<Button
					variant="link"
					size="sm"
					className="text-base w-full flex px-0 has-[>svg]:px-0"
				>
					<p className="truncate w-full text-left">{event.title}</p>
					<ArrowUpRight className="size-3" />
				</Button>
			</Link>
			<p className="text-xs text-muted-foreground">{range?.date}</p>
			<p className="text-xs text-muted-foreground">{range?.time}</p>

			<div className="flex flex-row items-center gap-2" />
		</div>
	)
}

// Add skeleton component for event item
const UserCommunityEventItemSkeleton = () => {
	return (
		<div className="flex flex-col gap-1 w-full">
			<div className="flex items-center gap-2 w-full">
				<Skeleton className="h-5 flex-1" />
				<Skeleton className="size-3" />
			</div>
			<Skeleton className="h-3 w-20" />
			<Skeleton className="h-3 w-16" />
		</div>
	)
}

// Add skeleton for the entire events section
const UserCommunityEventsListSkeleton = () => {
	return (
		<div className="flex flex-col gap-2">
			<Skeleton className="h-3 w-24" />
			{Array.from({ length: 2 }).map((_) => (
				<UserCommunityEventItemSkeleton key={nanoid()} />
			))}
		</div>
	)
}

export const UserCommunityItem = (props: UserCommunityItemProps) => {
	const {
		id,
		name,
		description,
		coverImage,
		_count,
		slug,
		searchQuery,
		nameRenderer,
	} = props
	const highlighter = useHighlighter(searchQuery || '')
	const communityEventsCount = _count?.events ?? 0
	// Check if this community has events data (enhanced)
	const communityEvents = hasEvents(props) ? props.events : []

	// Check for search metadata
	const searchMetadata =
		'_searchMetadata' in props ? props._searchMetadata : null
	const matchReason = useSearchMatchReason(
		searchMetadata || undefined,
		searchQuery,
		undefined,
		{ name, description: description || undefined },
		'name'
	)

	return (
		<div className="flex flex-col gap-4">
			{/* Search match display */}
			{matchReason && searchQuery && (
				<div className="rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2">
					<div className="flex items-center gap-2">
						<div className="size-1.5 rounded-full bg-green-400" />
						<p className="text-green-200 text-sm font-medium">
							<span className="opacity-75">Match in {matchReason.field}:</span>{' '}
							<span className="line-clamp-1">
								{nameRenderer
									? nameRenderer(matchReason.text)
									: highlighter(matchReason.text)}
							</span>
						</p>
					</div>
				</div>
			)}{' '}
			<div
				key={id}
				className="bg-card lg:grid lg:grid-cols-12 flex flex-col gap-4 p-4 rounded-lg shadow-sm"
			>
				<div className="col-span-12 lg:col-span-4 flex flex-col items-start lg:gap-4 gap-3 w-full">
					<Image
						src={coverImage || AssetMap.NoEvents}
						alt={name}
						className="aspect-video rounded-lg object-cover"
						fill
						wrapperClassName="relative aspect-square h-[75px] w-[75px] rounded-lg"
						sizes={{ lg: '30vw', sm: '50vw' }}
					/>
					<div className="col-span-12 lg:col-span-8 w-full flex flex-col justify-center">
						<div className="flex flex-col lg:gap-3 gap-3 w-full">
							<div className="flex flex-col lg:gap-1 gap-1 w-full">
								<h3 className="truncate lg:text-lg text-base font-semibold w-full">
									{props.nameRenderer ? props.nameRenderer(name) : name}
								</h3>
								<p className="text-sm text-muted-foreground">
									{_count.members} members
								</p>
							</div>
							<Link href={Routes.Main.Communities.ViewBySlug(slug)} passHref>
								<Button variant="secondary">View</Button>
							</Link>
						</div>
					</div>
				</div>
				<hr className="lg:hidden" />
				<div className="flex flex-col lg:col-span-8 gap-2">
					<div className="flex gap-2 flex-col lg:gap-3">
						{!communityEvents?.length && communityEventsCount > 0 ? (
							<UserCommunityEventsListSkeleton />
						) : (
							<>
								<p className="text-xs text-muted-foreground">Latest Events</p>
								{communityEventsCount > 0 ? (
									communityEvents.map((event) => (
										<UserCommunityEventItem key={event.id} event={event} />
									))
								) : (
									<p className="text-sm text-muted-foreground">
										No latest events
									</p>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
