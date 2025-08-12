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
import { ProgressiveCommunitiesList } from '../components'
import { copy } from '../copy'

type BuildCommunityListInputParams = Pick<
	RouterInput['community']['list']['core'],
	'exclude' | 'include'
> &
	CommunityListSearchParams

const getCommunities = async ({
	period = EventTimeFrame.UPCOMING,
	page,
	size,
	...rest
}: BuildCommunityListInputParams) => {
	const now = dayjs().toISOString()

	const api = await getAPI()
	const params = {
		sort:
			period === EventTimeFrame.UPCOMING
				? SortDirection.ASC
				: SortDirection.DESC,
		after: period === EventTimeFrame.UPCOMING ? now : undefined,
		before: period === EventTimeFrame.PAST ? now : undefined,
		page: parseInt(page ?? '1', 10) || 1,
		size: parseInt(size ?? '10', 10) || 10,
		...rest,
	} satisfies RouterInput['community']['list']['core']
	return {
		communities: await api.community.list.core(params),
		params,
	}
}

export default async function ViewCommunities({
	searchParams,
}: {
	searchParams: Promise<CommunityListSearchParams>
}) {
	const searchParmsRes = await searchParams

	const [managedResult, userResult] = await Promise.all([
		// Communities where user is admin or owner
		getCommunities({
			include: [
				MembershipRole.ADMIN,
				MembershipRoleOwner.OWNER,
				MembershipRole.MODERATOR,
			],
			...searchParmsRes,
		}),
		// Communities where user is a member but NOT admin, moderator, or owner
		getCommunities({
			include: [MembershipRole.MEMBER],
			exclude: [
				MembershipRole.ADMIN,
				MembershipRole.MODERATOR,
				MembershipRoleOwner.OWNER,
			],
			...searchParmsRes,
		}),
	])

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="flex w-full flex-row justify-between gap-4">
				<h1 className="font-bold text-2xl lg:px-0 lg:text-4xl">
					{copy.community.home.title}
				</h1>
			</div>

			<ProgressiveCommunitiesList
				coreCommunities={managedResult.communities}
				params={managedResult.params}
				variant="managed"
			/>

			<hr />

			<ProgressiveCommunitiesList
				coreCommunities={userResult.communities}
				params={userResult.params}
				variant="user"
			/>
		</div>
	)
}
