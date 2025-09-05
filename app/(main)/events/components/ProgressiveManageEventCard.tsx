import { unauthorized } from 'next/navigation'
import { Suspense } from 'react'
import type { RouterOutput } from '@/server/api'
import { getAPI } from '@/server/api'
import { ManageEventCard } from './ManageEventCard'

interface EnhancedManageEventCardProps {
	slug: string
}

const EnhancedManageEventCard = async ({
	slug,
}: EnhancedManageEventCardProps) => {
	const api = await getAPI()
	const event = await api.event.get.enhanced({ slug })
	if (!event?.metadata?.user?.access?.manager) {
		return unauthorized()
	}
	return <ManageEventCard {...event} />
}

interface ProgressiveManageEventCardProps {
	coreEvent: RouterOutput['event']['get']['core']
}

export const ProgressiveManageEventCard = ({
	coreEvent,
}: ProgressiveManageEventCardProps) => {
	return (
		<Suspense fallback={<ManageEventCard {...coreEvent} />}>
			<EnhancedManageEventCard slug={coreEvent.slug} />
		</Suspense>
	)
}
