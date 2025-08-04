import { Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
	EventCard,
	EventsPagination,
	NoEvents,
	PeriodTabs,
} from '@/app/(main)/components'
import { copy } from '@/app/(main)/copy'
import {
	AvatarWithFallback,
	Badge,
	Button,
	Calendar,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui'
import { Routes } from '@/lib/config'
import { MembershipBadgeVariants, MembershipLabels } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { getAPI } from '@/server/api'

const AVATAR_CLASSES = {
	lg: 'lg:size-24 -bottom-12',
	sm: 'size-18 -bottom-9',
}
const now = new Date().toISOString()

export default async function ViewCommunity({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<{ period?: string; page?: string }>
}) {
	const { slug } = await params
	const { period = 'upcoming', page = '1' } = await searchParams
	const api = await getAPI()
	const community = await api.community.get({ slug })
	const { coverImage, name, description, id, owner, metadata } = community
	const events = await api.event.list({
		sort: 'asc',
		after: period === 'upcoming' ? now : undefined,
		before: period === 'past' ? now : undefined,
		page: parseInt(page, 10) || 1,
		where: {
			communityId: id,
		},
	})

	const role = metadata?.role ? MembershipLabels[metadata.role] : null
	const membershipBadgeVariant = metadata?.role
		? MembershipBadgeVariants[metadata.role]
		: 'default'

	return (
		<div className="mx-auto flex w-full max-w-wide-page flex-col gap-4">
			{coverImage && owner && (
				<div className="lg:h-[240px] lg:w-full w-full h-[120px] relative">
					<Image
						src={coverImage}
						alt={name}
						className="aspect-video lg:rounded-xl object-cover"
						fill
						sizes="(min-width: 1024px) 60vw, 50vw"
					/>
					{owner?.name && owner?.image && (
						<AvatarWithFallback
							src={owner?.image}
							alt={owner?.name}
							name={owner?.name}
							className={cn(
								'absolute left-4',
								AVATAR_CLASSES.lg,
								AVATAR_CLASSES.sm
							)}
						/>
					)}
				</div>
			)}
			<div className="flex flex-col px-3 py-6 lg:gap-8 lg:px-8 gap-4 lg:py-8">
				<div className="flex flex-col gap-2 lg:gap-2">
					<div className="flex items-start justify-between">
						<div className="flex flex-col gap-1">
							<h2 className="text-sm text-muted-foreground">
								Curated by {owner?.name}
							</h2>
							<div className="flex flex-row items-center gap-2">
								<h1 className="text-2xl font-semibold">{name}</h1>
								{role && <Badge variant={membershipBadgeVariant}>{role}</Badge>}
							</div>
						</div>
						<Tooltip>
							<TooltipTrigger>
								<Link
									href={role ? '' : Routes.Main.Communities.SubscribeTo(slug)}
									passHref
								>
									<Button variant="secondary" disabled={!!role}>
										Subscribe
									</Button>
								</Link>
							</TooltipTrigger>
							<TooltipContent>
								{role
									? `You are already subscribed as ${role}`
									: 'Subscribe to this community'}
							</TooltipContent>
						</Tooltip>
					</div>
					<p className="text-muted-foreground text-sm">{description}</p>
				</div>
				<hr />
				<div className="grid grid-cols-12 lg:gap-4 gap-4">
					<div className="col-span-12 lg:col-span-4 lg:order-2 flex flex-col gap-4">
						<Link href={Routes.Main.Events.Create} passHref>
							<Button variant="secondary">
								<Plus />
								Submit Event
							</Button>
						</Link>
						<Calendar
							mode="single"
							className="rounded-lg mx-auto border p-2 [--cell-size:--spacing(10)] lg:p-3 lg:[--cell-size:--spacing(8)]"
						/>
					</div>
					<div className="col-span-12 lg:col-span-8 lg:order-1 flex flex-col gap-4 lg:gap-8 ">
						<div className="flex w-full flex-row justify-between gap-4">
							<h1 className="font-bold text-2xl lg:px-0 lg:text-4xl">
								{copy.home.title}
							</h1>
							<PeriodTabs currentPeriod={period as 'upcoming' | 'past'} />
						</div>
						{events.length === 0 && (
							<NoEvents>Looks like this community has no events.</NoEvents>
						)}
						{events.map((event, index) => (
							<EventCard
								key={event.id}
								{...event}
								isLast={index === events.length - 1}
							/>
						))}
					</div>
				</div>
				{events.length > 0 && (
					<EventsPagination
						currentPage={parseInt(page, 10)}
						searchParams={{ period }}
						hasMore={events.length === 5}
					/>
				)}
			</div>
		</div>
	)
}
