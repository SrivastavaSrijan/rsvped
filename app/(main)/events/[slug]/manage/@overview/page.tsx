import { ProgressiveManageEventCard } from '@/app/(main)/events/components'
import { getAPI } from '@/server/api'

export default async function OverviewSlot({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const sp = await searchParams
	const tab = typeof sp.tab === 'string' ? sp.tab : 'overview'
	if (tab !== 'overview') return null

	const { slug } = await params
	const api = await getAPI()
	const coreEvent = await api.event.get.core({ slug })

	return <ProgressiveManageEventCard coreEvent={coreEvent} />
}
