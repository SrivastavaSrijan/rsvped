import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { canUserManageEvent } from '@/lib/utils'
import { getAPI } from '@/server/api'
import { EventPage } from '../../components'

export default async function ViewEvent({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const api = await getAPI()
	const session = await auth()
	const event = await api.event.getBySlug({ slug })

	if (!event) {
		notFound()
	}
	const canManage = canUserManageEvent(
		{ eventCollaborators: event.eventCollaborators, host: event.host },
		session?.user
	)

	return (
		<div className="mx-auto flex w-full max-w-wide-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<EventPage {...event} canManage={canManage} />
		</div>
	)
}
