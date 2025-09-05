import { Suspense } from 'react'
import type { RouterInput, RouterOutput } from '@/server/api'
import { getAPI } from '@/server/api'
import { ManagedCommunitiesGrid } from './ManagedCommunitiesGrid'
import { UserCommunitiesList } from './UserCommunitiesList'

type CommunityListInput = RouterInput['community']['list']['core']

/**
 * Type guard to check if communities data is enhanced with additional relations
 */
export function isEnhancedCommunitiesData(
	communities: unknown[]
): communities is Array<{ events?: unknown }> {
	return communities.length > 0 && 'events' in (communities[0] as object)
}

interface EnhancedCommunitiesListProps {
	params: RouterInput['community']['list']['core']
	variant: 'managed' | 'user'
}

export const EnhancedCommunitiesList = async ({
	params,
	variant,
}: EnhancedCommunitiesListProps) => {
	const api = await getAPI()
	const enhancedCommunities = await api.community.list.enhanced(params)

	if (variant === 'managed') {
		return <ManagedCommunitiesGrid {...enhancedCommunities} />
	}

	return <UserCommunitiesList {...enhancedCommunities} />
}

type CoreCommunityData = RouterOutput['community']['list']['core']

interface ProgressiveCommunitiesListProps {
	coreCommunities: CoreCommunityData
	params: CommunityListInput
	variant: 'managed' | 'user'
}

export const ProgressiveCommunitiesList = ({
	coreCommunities,
	params,
	variant,
}: ProgressiveCommunitiesListProps) => {
	// Render core data as fallback while enhanced data loads
	const CoreFallback = () => {
		if (variant === 'managed') {
			return <ManagedCommunitiesGrid {...coreCommunities} />
		}

		return <UserCommunitiesList {...coreCommunities} />
	}

	return (
		<Suspense fallback={<CoreFallback />}>
			<EnhancedCommunitiesList params={params} variant={variant} />
		</Suspense>
	)
}
