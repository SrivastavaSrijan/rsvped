import { MembershipRole } from '@prisma/client'
import { getAPI } from '@/server/api'

export default async function ViewCommunities({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>
}) {
	const api = await getAPI()
	const { page = '1' } = await searchParams
	const communities = await api.community.list({
		roles: [
			MembershipRole.ADMIN,
			MembershipRole.MEMBER,
			MembershipRole.MODERATOR,
		],
		page: parseInt(page, 10) || 1,
	})
}
