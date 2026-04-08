import { ManageMessages } from '@/app/(main)/events/components'
import { getAPI } from '@/server/api'

export default async function MessagesSlot({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const sp = await searchParams
	const tab = typeof sp.tab === 'string' ? sp.tab : 'overview'
	if (tab !== 'messages') return null

	const { slug } = await params
	const api = await getAPI()
	const messages = await api.event.get.messages({ slug })

	return <ManageMessages messages={messages} />
}
