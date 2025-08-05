import { MembershipRole } from '@prisma/client'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'
import { ManagedCommunitiesGrid, UserCommunitiesList } from '../components'
import { copy } from '../copy'

const getCommunities = async (
	roles: MembershipRole[],
	page?: string,
	invert?: boolean
) => {
	const api = await getAPI()
	return api.community.list({
		roles,
		page: parseInt(page ?? '1', 10) || 1,
		invert,
	})
}
export default async function ViewCommunities({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>
}) {
	const { page = '1' } = await searchParams
	const [managedCommunities, userCommunities] = await Promise.all([
		getCommunities([MembershipRole.ADMIN], page),
		getCommunities(
			[MembershipRole.ADMIN, MembershipRole.MODERATOR],
			page,
			true
		),
	])

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="flex w-full flex-row justify-between gap-4">
				<h1 className="font-bold text-2xl lg:px-0 lg:text-4xl">
					{copy.community.home.title}
				</h1>
			</div>

			<ManagedCommunitiesGrid
				communities={managedCommunities}
				title={copy.community.home.managed}
				emptyMessage={copy.community.home.emptyManaged}
				createButtonLabel="Create Community"
				createButtonHref={Routes.Main.Events.Create}
			/>

			<hr />

			<UserCommunitiesList
				communities={userCommunities}
				title={copy.community.home.user}
				emptyMessage={copy.community.home.empty}
			/>
		</div>
	)
}
