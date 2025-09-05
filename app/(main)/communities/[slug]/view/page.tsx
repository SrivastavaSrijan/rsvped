import { notFound } from 'next/navigation'
import { CommunityHeader } from '@/app/(main)/communities/components'
import { FilteredEventsList } from '@/app/(main)/events/components'
import { type EventListSearchParams, getAPI } from '@/server/api'

interface ViewCommunityProps {
	params: Promise<{ slug: string }>
	searchParams: Promise<EventListSearchParams>
}

export default async function ViewCommunity({
	params,
	searchParams,
}: ViewCommunityProps) {
	const { slug } = await params
	const api = await getAPI()
	try {
		1
		const community = await api.community.get.enhanced({ slug })
		if (!community) {
			return notFound()
		}
		return (
			<div className="mx-auto flex w-full max-w-wide-page flex-col gap-4">
				<CommunityHeader {...community} />
				<div className="flex flex-col px-3 pb-6 lg:gap-8 lg:px-8 gap-4 lg:pb-8">
					<FilteredEventsList
						where={{ communityId: community.id }}
						{...(await searchParams)}
					/>
				</div>
			</div>
		)
	} catch (error) {
		console.error('Error fetching community:', error)
		return notFound()
	}
}
