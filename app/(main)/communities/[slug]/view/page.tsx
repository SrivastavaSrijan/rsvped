import { notFound } from 'next/navigation'
import { CommunityEvents, CommunityHeader } from '@/app/(main)/components'
import { getAPI } from '@/server/api'

interface ViewCommunityProps {
	params: Promise<{ slug: string }>
	searchParams: Promise<{
		period?: string
		page?: string
		on?: string
		after?: string
		before?: string
	}>
}

export default async function ViewCommunity({
	params,
	searchParams,
}: ViewCommunityProps) {
	const { slug } = await params
	const {
		period = 'upcoming',
		page = '1',
		on,
		after,
		before,
	} = await searchParams
	const api = await getAPI()
	try {
		const community = await api.community.get({ slug })
		if (!community) {
			return notFound()
		}
		return (
			<div className="mx-auto flex w-full max-w-wide-page flex-col gap-4">
				<CommunityHeader community={community}>
					<CommunityEvents
						communityId={community.id}
						period={period as 'upcoming' | 'past'}
						page={parseInt(page, 10)}
						on={on}
						after={after}
						before={before}
					/>
				</CommunityHeader>
			</div>
		)
	} catch (error) {
		console.error('Error fetching community:', error)
		return notFound()
	}
}
