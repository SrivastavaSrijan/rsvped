import { MembershipRole } from '@prisma/client'
import {
	type CombinedMembershipRole,
	getAPI,
	MembershipRoleOwner,
} from '@/server/api'
import {
	createCommunityListParams,
	ProgressiveCommunitiesList,
} from '../components'
import { copy } from '../copy'

const getCommunities = async ({
	include,
	exclude,
	page = '1',
}: {
	include?: CombinedMembershipRole[]
	exclude?: CombinedMembershipRole[]
	page?: string
}) => {
	const api = await getAPI()
	const params = createCommunityListParams({
		include,
		exclude,
		page: parseInt(page ?? '1', 10) || 1,
	})
	return {
		communities: await api.community.list.core(params),
		params,
	}
}

export default async function ViewCommunities({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>
}) {
	const { page = '1' } = await searchParams

	const [managedResult, userResult] = await Promise.all([
		// Communities where user is admin or owner
		getCommunities({
			include: [MembershipRole.ADMIN, MembershipRoleOwner.OWNER],
			page,
		}),
		// Communities where user is a member but NOT admin, moderator, or owner
		getCommunities({
			include: [MembershipRole.MEMBER],
			exclude: [
				MembershipRole.ADMIN,
				MembershipRole.MODERATOR,
				MembershipRoleOwner.OWNER,
			],
			page,
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
