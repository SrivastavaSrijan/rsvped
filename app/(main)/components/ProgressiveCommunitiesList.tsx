import { Suspense } from 'react'
import type {
	CombinedMembershipRole,
	RouterInput,
	RouterOutput,
} from '@/server/api'
import { getAPI } from '@/server/api'
import { ManagedCommunitiesGrid } from './ManagedCommunitiesGrid'
import { UserCommunitiesList } from './UserCommunitiesList'

export interface CreateCommunityListParams {
	page?: number
	include?: CombinedMembershipRole[]
	exclude?: CombinedMembershipRole[]
	sort?: 'asc' | 'desc'
}

/**
 * Creates a consistent set of parameters for core and enhanced community list queries
 * Based on common filtering patterns used across the app
 */
type CreateCommunityListReturn = RouterInput['community']['list']['core']

export function createCommunityListParams({
	page = 1,
	include,
	exclude,
	sort = 'asc',
}: CreateCommunityListParams): CreateCommunityListReturn {
	return {
		page,
		include,
		exclude,
		sort,
		where: {
			isPublic: true,
		},
	} satisfies CreateCommunityListReturn
}

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
		return <ManagedCommunitiesGrid communities={enhancedCommunities} />
	}

	return <UserCommunitiesList communities={enhancedCommunities} />
}

type CoreCommunityData = RouterOutput['community']['list']['core'][number]

interface ProgressiveCommunitiesListProps {
	coreCommunities: CoreCommunityData[]
	params: CreateCommunityListReturn
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
			return <ManagedCommunitiesGrid communities={coreCommunities} />
		}

		return <UserCommunitiesList communities={coreCommunities} />
	}

	return (
		<Suspense fallback={<CoreFallback />}>
			<EnhancedCommunitiesList params={params} variant={variant} />
		</Suspense>
	)
}
