import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

const AutocompleteInput = z.object({
	query: z.string().min(1),
	limit: z.number().int().min(1).max(20).default(8),
})

export const stirAutocompleteRouter = createTRPCRouter({
	suggestions: publicProcedure
		.input(AutocompleteInput)
		.query(async ({ ctx, input }) => {
			const { query, limit } = input
			const q = query.trim()
			if (!q) return []

			const [eventsRaw, communities] = await Promise.all([
				ctx.prisma.event.findMany({
					where: {
						isPublished: true,
						deletedAt: null,
						title: { contains: q, mode: 'insensitive' },
					},
					select: { id: true, title: true, slug: true },
					take: limit * 2,
					orderBy: { startDate: 'desc' },
				}),
				ctx.prisma.community.findMany({
					where: {
						isPublic: true,
						name: { contains: q, mode: 'insensitive' },
					},
					select: { id: true, name: true, slug: true },
					take: limit * 2,
					orderBy: { name: 'asc' },
				}),
			])

			// Simple relevance scoring
			const lc = q.toLowerCase()
			const score = (text: string) => {
				const lower = text.toLowerCase()
				if (lower === lc) return 100
				if (lower.startsWith(lc)) return 80
				if (lower.includes(lc)) return 60
				return 0
			}

			const results = [
				...eventsRaw.map((e) => ({
					id: e.id,
					title: e.title,
					slug: e.slug,
					type: 'event' as const,
					_score: score(e.title),
				})),
				...communities.map((c) => ({
					id: c.id,
					title: c.name,
					slug: c.slug,
					type: 'community' as const,
					_score: score(c.name),
				})),
			]
				.sort((a, b) => b._score - a._score)
				.slice(0, limit)
				.map(({ _score, ...item }) => item)

			return results
		}),
})
