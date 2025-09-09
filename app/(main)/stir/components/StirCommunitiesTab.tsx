import { nanoid } from 'nanoid'
import { Suspense } from 'react'
import { GenericPagination } from '@/app/(main)/components'
import { getAPI } from '@/server/api'
import { UserCommunityItem } from '../../communities/components'

interface StirCommunitiesTabProps {
	query: string
	page: number
	size: number
}

export async function StirCommunitiesTab({
	query,
	page,
	size,
}: StirCommunitiesTabProps) {
	const api = await getAPI()
	const core = await api.stir.search.core({
		query,
		page,
		size,
		type: 'communities',
	})
	const coreCommunities = core.communities.data
	const pagination = core.communities.pagination

	return (
		<div className="flex flex-col gap-4">
			<Suspense
				fallback={
					coreCommunities.length === 0 ? (
						<p className="text-muted-foreground">No communities found.</p>
					) : (
						coreCommunities.map((community) => (
							<UserCommunityItem
								key={community.id ?? nanoid()}
								{...community}
							/>
						))
					)
				}
			>
				<EnhancedStirCommunitiesList ids={coreCommunities.map((c) => c.id)} />
			</Suspense>
			<GenericPagination {...pagination} />
		</div>
	)
}

async function EnhancedStirCommunitiesList({ ids }: { ids: string[] }) {
	if (ids.length === 0) {
		return <p className="text-muted-foreground">No communities found.</p>
	}

	const api = await getAPI()
	const enhancedCommunities = await api.community.list.enhanceByIds({ ids })

	return (
		<>
			{enhancedCommunities.map((community) => (
				<UserCommunityItem key={community.id ?? nanoid()} {...community} />
			))}
		</>
	)
}
