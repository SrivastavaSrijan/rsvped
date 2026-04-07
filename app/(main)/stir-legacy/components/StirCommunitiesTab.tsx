import { nanoid } from 'nanoid'
import { Suspense } from 'react'
import { GenericPagination } from '@/app/(main)/components'
import type { RouterOutput } from '@/server/api'
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
	const result = await api.stir.search.communities({ query, page, size })
	const coreCommunities = result.data
	const pagination = result.pagination

	if (coreCommunities.length === 0) {
		return (
			<div className="flex flex-col gap-4">
				<p className="text-muted-foreground">No communities found.</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<Suspense
				fallback={coreCommunities.map((community) => (
					<UserCommunityItem key={community.id ?? nanoid()} {...community} />
				))}
			>
				<EnhancedStirCommunitiesList
					coreCommunities={coreCommunities}
					query={query}
				/>
			</Suspense>
			<GenericPagination {...pagination} />
		</div>
	)
}

async function EnhancedStirCommunitiesList({
	coreCommunities,
	query,
}: {
	coreCommunities: RouterOutput['stir']['search']['communities']['data']
	query: string
}) {
	// Enhance the search results with user-specific data
	const api = await getAPI()
	const enhancedCommunities = await api.community.list.enhanceByIds({
		ids: coreCommunities.map((c) => c.id),
	})

	// Create a map for O(1) lookup and maintain original order
	const enhancedMap = new Map(
		enhancedCommunities.map((community) => [community.id, community])
	)

	// Merge enhanced data with search metadata from core communities
	const orderedCommunities = coreCommunities.map((coreCommunity) => {
		const enhancedCommunity = enhancedMap.get(coreCommunity.id)
		if (enhancedCommunity) {
			// Merge search metadata into enhanced community
			return {
				...enhancedCommunity,
				_searchMetadata: coreCommunity._searchMetadata,
			}
		}
		// Fallback to core community if enhancement failed
		return coreCommunity
	})

	return (
		<>
			{orderedCommunities.map((community) => (
				<UserCommunityItem
					key={community.id ?? nanoid()}
					{...community}
					searchQuery={query}
				/>
			))}
		</>
	)
}
