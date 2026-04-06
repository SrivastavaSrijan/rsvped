import { EventDiscoverCard } from '@/app/(main)/events/components/EventDiscoverCard'
import { ResponsiveGridCarousel } from '@/app/(main)/events/components/ResponsiveGridCarousel'
import { StirEventsTab } from '@/app/(main)/stir/components'
import { StirAISummaryCard } from '@/app/(main)/stir/components/StirAISummaryCard'
import { generatePlainText, isAvailable } from '@/lib/ai/llm'
import { getAPI } from '@/server/api'

interface EventsSlotPageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function generateAISummary(
	results: {
		title: string
		startDate: Date
		location?: { name: string } | null
	}[],
	query: string
): Promise<string | null> {
	if (!isAvailable() || results.length < 3) return null

	const metadata = results.slice(0, 5).map((e) => ({
		title: e.title,
		startDate: e.startDate.toISOString().split('T')[0],
		location: e.location?.name ?? 'Online',
	}))

	try {
		const result = await Promise.race([
			generatePlainText(
				`Query: "${query}"\nResults:\n${metadata.map((m) => `- ${m.title} (${m.startDate}, ${m.location})`).join('\n')}`,
				'Synthesize these event search results into a 1-2 sentence summary. Mention patterns: common topics, date clusters, locations, pricing. Be concise and helpful.',
				'search-summary'
			),
			new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
		])
		return result
	} catch {
		return null
	}
}

export default async function EventsSlotPage({
	searchParams,
}: EventsSlotPageProps) {
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
		// Trending fallback: nearby upcoming events using user's location or default
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
		const trending = await api.event.nearby({ locationId, take: 12 })
		return (
			<ResponsiveGridCarousel
				config={{
					pageSize: { lg: 6, sm: 4 },
					cols: { lg: 3, sm: 2 },
					gap: { lg: 2, sm: 2 },
				}}
				data={trending}
				item={EventDiscoverCard}
			/>
		)
	}

	// Fetch search results via tRPC caller
	const api = await getAPI()
	const result = await api.stir.search.events({
		query: q,
		page: Number.isFinite(page) && page > 0 ? page : 1,
		size,
	})

	// Generate AI summary if results are AI-enhanced and have enough data
	let aiSummary: string | null = null
	if (result.aiEnhanced && result.data.length >= 3) {
		aiSummary = await generateAISummary(result.data, q)
	}

	return (
		<div className="flex flex-col gap-4">
			{aiSummary || result.interpretation ? (
				<StirAISummaryCard
					summary={aiSummary}
					interpretation={result.interpretation}
				/>
			) : null}
			<StirEventsTab
				coreEvents={result.data}
				pagination={result.pagination}
				query={q}
			/>
		</div>
	)
}
