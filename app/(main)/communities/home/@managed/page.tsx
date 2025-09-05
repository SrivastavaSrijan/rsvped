import { MembershipRole } from '@prisma/client'
import dayjs from 'dayjs'
import { ProgressiveCommunitiesList } from '@/app/(main)/communities/components'
import {
	type CommunityListSearchParams,
	EventTimeFrame,
	getAPI,
	MembershipRoleOwner,
	type RouterInput,
	SortDirection,
} from '@/server/api'

type CommunityPageSearchParams = CommunityListSearchParams & { tab?: string }

const getManagedCommunities = async (
	searchParams: CommunityListSearchParams
) => {
	const { period = EventTimeFrame.UPCOMING, page, size } = searchParams
	const now = dayjs().toISOString()

	const api = await getAPI()
	const params = {
		sort:
			period === EventTimeFrame.UPCOMING
				? SortDirection.ASC
				: SortDirection.DESC,
		after: period === EventTimeFrame.UPCOMING ? now : undefined,
		before: period === EventTimeFrame.PAST ? now : undefined,
		page: +(page || '1'),
		size: +(size || '6'),
		include: [
			MembershipRole.ADMIN,
			MembershipRoleOwner.OWNER,
			MembershipRole.MODERATOR,
		],
	} satisfies RouterInput['community']['list']['core']

	return {
		coreCommunities: await api.community.list.core(params),
		params,
	}
}

export default async function ManagedCommunitiesPage({
	searchParams,
}: {
	searchParams: Promise<CommunityPageSearchParams>
}) {
	const searchParamsRes = await searchParams
	const { tab, ...communitySearchParams } = searchParamsRes

	// Only render if this tab is active (default to managed if no tab specified)
	const isActive = !tab || tab === 'managed'

	if (!isActive) {
		return null
	}

	const managedCommunities = await getManagedCommunities(communitySearchParams)

	return (
		<ProgressiveCommunitiesList {...managedCommunities} variant="managed" />
	)
}
