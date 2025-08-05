import { notFound } from 'next/navigation'
import { CommunitySubscribeModal } from '@/app/(main)/components'
import { getAPI } from '@/server/api'

interface SubscribePageProps {
	params: Promise<{ slug: string }>
}

export default async function SubscribePage({ params }: SubscribePageProps) {
	const { slug } = await params
	const api = await getAPI()
	let community: Awaited<ReturnType<typeof api.community.get>> | null = null
	try {
		community = await api.community.get({ slug })
		if (!community) {
			return notFound()
		}
	} catch (error) {
		console.error('Error fetching community:', error)
		return notFound()
	}

	return <CommunitySubscribeModal {...community} />
}
