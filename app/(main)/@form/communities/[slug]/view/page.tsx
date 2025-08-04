import { notFound } from 'next/navigation'
import { CommunitySubscribeModal } from '@/app/(main)/components'
import { getAPI } from '@/server/api'

interface SubscribePageProps {
	params: Promise<{ slug: string }>
}

export default async function SubscribePage({ params }: SubscribePageProps) {
	const api = await getAPI()
	const { slug } = await params
	const community = await api.community.get({ slug })

	if (!community || !community.membershipTiers.length) {
		return notFound()
	}

	return <CommunitySubscribeModal {...community} />
}
