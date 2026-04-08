import { ArrowUpLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import {
	ManageGuests,
	ManageInsights,
	ManageTeam,
	ProgressiveManageEventCard,
} from '@/app/(main)/events/components'
import {
	Button,
	Card,
	Skeleton,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'

export const generateMetadata = async ({
	params,
}: {
	params: Promise<{ slug: string }>
}) => {
	const { slug } = await params
	const api = await getAPI()
	const event = await api.event.get.core({ slug })
	return {
		title: `${event.title} · RSVP'd`,
		description: `View details for the event: ${event.title}`,
	}
}

interface ManageEventPageProps {
	params: Promise<{ slug: string }>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

const GuestsTab = async ({
	slug,
	guestStatus,
	guestSearch,
	guestPage,
}: {
	slug: string
	guestStatus?: string
	guestSearch?: string
	guestPage: number
}) => {
	const api = await getAPI()
	const result = await api.rsvp.byEvent.list({
		slug,
		status: guestStatus as 'CONFIRMED' | 'CANCELLED' | 'WAITLIST' | undefined,
		search: guestSearch,
		page: guestPage,
		size: 20,
	})
	return (
		<ManageGuests
			guests={result.data}
			pagination={result.pagination}
			currentStatus={guestStatus}
			currentSearch={guestSearch}
		/>
	)
}

const InsightsTab = async ({ slug }: { slug: string }) => {
	const api = await getAPI()
	const analytics = await api.event.get.analytics({ slug })
	return (
		<ManageInsights
			rsvpCount={analytics.rsvpCount}
			viewCount={analytics.viewCount}
			checkInCount={analytics.checkInCount}
			paidRsvpCount={analytics.paidRsvpCount}
		/>
	)
}

const TeamTab = async ({ slug }: { slug: string }) => {
	const api = await getAPI()
	const event = await api.event.get.enhanced({ slug })
	return (
		<ManageTeam host={event.host} collaborators={event.eventCollaborators} />
	)
}

const TabSkeleton = () => (
	<Card className="flex flex-col gap-3 p-6">
		<Skeleton className="h-4 w-48" />
		<Skeleton className="h-4 w-32" />
		<Skeleton className="h-32 w-full" />
	</Card>
)

export default async function ManageEvent({
	params,
	searchParams,
}: ManageEventPageProps) {
	const { slug } = await params
	const sp = await searchParams

	const guestStatus =
		typeof sp.guestStatus === 'string' ? sp.guestStatus : undefined
	const guestSearch =
		typeof sp.guestSearch === 'string' ? sp.guestSearch : undefined
	const guestPage = typeof sp.guestPage === 'string' ? Number(sp.guestPage) : 1
	const activeTab = typeof sp.tab === 'string' ? sp.tab : 'overview'

	const api = await getAPI()
	try {
		const coreEvent = await api.event.get.core({ slug })
		if (!coreEvent) {
			return notFound()
		}
		return (
			<Tabs
				className="mx-auto flex w-full max-w-page flex-col gap-8 px-3 pb-6 lg:gap-12 lg:px-8 lg:pb-8"
				defaultValue={activeTab}
			>
				<div className="flex flex-col gap-4 lg:gap-6">
					<div className="flex flex-col gap-1">
						<Link href={Routes.Main.Events.Home} passHref>
							<Button
								variant="link"
								size="sm"
								className="text-muted-foreground opacity-50"
							>
								<ArrowUpLeft className="text-muted-foreground" /> Back home
							</Button>
						</Link>
						<h1 className="font-bold text-2xl lg:text-3xl">
							{coreEvent.title}
						</h1>
					</div>
					<TabsList className="w-full overflow-x-auto">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="guests">Guests</TabsTrigger>
						<TabsTrigger value="insights">Insights</TabsTrigger>
						<TabsTrigger value="team">Team</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="overview">
					<ProgressiveManageEventCard coreEvent={coreEvent} />
				</TabsContent>

				<TabsContent value="guests">
					<Suspense fallback={<TabSkeleton />}>
						<GuestsTab
							slug={slug}
							guestStatus={guestStatus}
							guestSearch={guestSearch}
							guestPage={guestPage}
						/>
					</Suspense>
				</TabsContent>

				<TabsContent value="insights">
					<Suspense fallback={<TabSkeleton />}>
						<InsightsTab slug={slug} />
					</Suspense>
				</TabsContent>

				<TabsContent value="team">
					<Suspense fallback={<TabSkeleton />}>
						<TeamTab slug={slug} />
					</Suspense>
				</TabsContent>
			</Tabs>
		)
	} catch (error) {
		console.error('Error fetching event:', error)
		return notFound()
	}
}
