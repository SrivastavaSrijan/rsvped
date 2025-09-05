import { notFound } from 'next/navigation'
import { EventRegisterModal } from '@/app/(main)/events/components'
import { getAPI } from '@/server/api'

interface ManageFormProps {
	params: Promise<{ slug: string }>
}

export default async function ManageForm({ params }: ManageFormProps) {
	const api = await getAPI()
	const { slug } = await params
	const event = await api.event.get.register({ slug })

	if (!event || !event.ticketTiers.length) {
		// Or handle case where there are no ticket tiers
		return notFound()
	}

	return <EventRegisterModal {...event} />
}
