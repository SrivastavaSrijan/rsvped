import { ManageFeedback } from '@/app/(main)/events/components'
import { getAPI } from '@/server/api'

export default async function FeedbackSlot({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const sp = await searchParams
	const tab = typeof sp.tab === 'string' ? sp.tab : 'overview'
	if (tab !== 'feedback') return null

	const { slug } = await params
	const api = await getAPI()
	const feedback = await api.event.get.feedback({ slug })

	return <ManageFeedback feedback={feedback} />
}
