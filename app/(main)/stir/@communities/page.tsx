import { CommunityDiscoverCard } from '@/app/(main)/events/components/CommunityDiscoverCard'
import { ResponsiveGridCarousel } from '@/app/(main)/events/components/ResponsiveGridCarousel'
import { StirCommunitiesTab } from '@/app/(main)/stir/components'
import { getAPI } from '@/server/api'

interface CommunitiesSlotPageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CommunitiesSlotPage({
	searchParams,
}: CommunitiesSlotPageProps) {
	const params = await searchParams
	const q =
		typeof params.q === 'string'
			? params.q
			: Array.isArray(params.q)
				? params.q[0]
				: ''
	const pageParam =
		typeof params.page === 'string'
			? params.page
			: Array.isArray(params.page)
				? params.page[0]
				: '1'
	const page = Number(pageParam)
	const size = 10

	if (!q.trim()) {
		// Trending fallback: nearby communities using user's location or default
		const api = await getAPI()
		let locationId: string | null = null
		try {
			const user = await api.user.profile.enhanced()
			locationId = user?.locationId ?? null
		} catch {}
		if (!locationId) {
			try {
				const def = await api.location.get.default()
				locationId = def?.id ?? null
			} catch {}
		}
		if (!locationId) return null

		const trending = await api.community.nearby({ locationId, take: 12 })
		return (
			<ResponsiveGridCarousel
				config={{
					pageSize: { lg: 6, sm: 4 },
					cols: { lg: 3, sm: 2 },
					gap: { lg: 2, sm: 2 },
				}}
				data={trending}
				item={CommunityDiscoverCard}
			/>
		)
	}

	return (
		<StirCommunitiesTab
			query={q}
			page={Number.isFinite(page) && page > 0 ? page : 1}
			size={size}
		/>
	)
}
