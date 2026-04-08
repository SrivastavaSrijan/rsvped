import { ManageInsights } from '@/app/(main)/events/components'
import { getAPI } from '@/server/api'

export default async function InsightsSlot({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const sp = await searchParams
	const tab = typeof sp.tab === 'string' ? sp.tab : 'overview'
	if (tab !== 'insights') return null

	const { slug } = await params
	const api = await getAPI()
	const [analytics, dailyStats] = await Promise.all([
		api.event.get.analytics({ slug }),
		api.event.get.dailyStats({ slug }),
	])

	return (
		<ManageInsights
			rsvpCount={analytics.rsvpCount}
			viewCount={analytics.viewCount}
			checkInCount={analytics.checkInCount}
			paidRsvpCount={analytics.paidRsvpCount}
			dailyStats={dailyStats}
		/>
	)
}
