import { ManageTeam } from '@/app/(main)/events/components'
import { getAPI } from '@/server/api'

export default async function TeamSlot({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const sp = await searchParams
	const tab = typeof sp.tab === 'string' ? sp.tab : 'overview'
	if (tab !== 'team') return null

	const { slug } = await params
	const api = await getAPI()
	const event = await api.event.get.team({ slug })

	return (
		<ManageTeam host={event.host} collaborators={event.eventCollaborators} />
	)
}
