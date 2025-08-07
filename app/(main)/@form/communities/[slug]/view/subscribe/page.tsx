import { notFound } from 'next/navigation'
import { CommunitySubscribeModal } from '@/app/(main)/components'
import { getAPI } from '@/server/api'

interface SubscribePageProps {
	params: Promise<{ slug: string }>
}

export default async function SubscribePage({ params }: SubscribePageProps) {
	const { slug } = await params
	const api = await getAPI()

	try {
		const community = await api.community.get.enhanced({ slug })
		if (!community) {
			return notFound()
		}
		return <CommunitySubscribeModal {...community} />
	} catch (error) {
		console.error('Error fetching community:', error)
		return notFound()
	}
}
