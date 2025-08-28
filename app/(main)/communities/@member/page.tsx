import { MembershipRole } from '@prisma/client'
import dayjs from 'dayjs'
import {
	type CommunityListSearchParams,
	EventTimeFrame,
	getAPI,
	MembershipRoleOwner,
	type RouterInput,
	SortDirection,
} from '@/server/api'
import { ProgressiveCommunitiesList } from '../../components'

type CommunityPageSearchParams = CommunityListSearchParams & { tab?: string }

const getMemberCommunities = async (
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
		size: +(size || '4'),
		include: [MembershipRole.MEMBER],
		exclude: [
			MembershipRole.ADMIN,
			MembershipRole.MODERATOR,
			MembershipRoleOwner.OWNER,
		],
	} satisfies RouterInput['community']['list']['core']

	return {
		coreCommunities: await api.community.list.core(params),
		params,
	}
}

export default async function MemberCommunitiesPage({
	searchParams,
}: {
	searchParams: Promise<CommunityPageSearchParams>
}) {
	const searchParamsRes = await searchParams
	const { tab, ...communitySearchParams } = searchParamsRes

	// Only render if member tab is active
	const isActive = tab === 'member'

	if (!isActive) {
		return null
	}

	const memberCommunities = await getMemberCommunities(communitySearchParams)

	return <ProgressiveCommunitiesList {...memberCommunities} variant="user" />
}
