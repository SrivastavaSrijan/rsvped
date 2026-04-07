import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { ToolEventResult } from '../types'

export const searchEvents = tool({
	description:
		'Search for events by keyword, category, date range, or city. Returns matching published events sorted by relevance.',
	inputSchema: z.object({
		query: z
			.string()
			.describe('Search query for event titles and descriptions'),
		category: z
			.string()
			.optional()
			.describe(
				'Category name to filter by (e.g. "Tech & Startups", "Music & Concerts")'
			),
		city: z.string().optional().describe('City name to filter by'),
		dateAfter: z
			.string()
			.optional()
			.describe(
				'ISO date string — only return events starting after this date'
			),
		dateBefore: z
			.string()
			.optional()
			.describe(
				'ISO date string — only return events starting before this date'
			),
		limit: z
			.number()
			.optional()
			.default(10)
			.describe('Max results to return (default 10)'),
	}),
	execute: async ({ query, category, city, dateAfter, dateBefore, limit }) => {
		try {
			// If query is a wildcard or very short, skip text filtering and just return popular events
			const isGenericQuery =
				!query || query === '*' || query === '**' || query.trim().length < 2

			const events = await prisma.event.findMany({
				where: {
					isPublished: true,
					deletedAt: null,
					AND: [
						isGenericQuery
							? {}
							: {
									OR: [
										{ title: { contains: query, mode: 'insensitive' } },
										{
											description: { contains: query, mode: 'insensitive' },
										},
									],
								},
						city
							? { location: { name: { contains: city, mode: 'insensitive' } } }
							: {},
						category
							? {
									categories: {
										some: {
											category: {
												name: { contains: category, mode: 'insensitive' },
											},
										},
									},
								}
							: {},
						dateAfter ? { startDate: { gte: new Date(dateAfter) } } : {},
						dateBefore ? { startDate: { lte: new Date(dateBefore) } } : {},
					],
				},
				take: limit,
				orderBy: [{ rsvpCount: 'desc' }, { startDate: 'asc' }],
				select: {
					id: true,
					title: true,
					slug: true,
					description: true,
					startDate: true,
					endDate: true,
					rsvpCount: true,
					location: { select: { name: true } },
					community: { select: { name: true } },
					categories: { select: { category: { select: { name: true } } } },
				},
			})

			return events.map(
				(e): ToolEventResult => ({
					id: e.id,
					title: e.title,
					slug: e.slug,
					description: e.description?.slice(0, 200) ?? null,
					startDate: e.startDate.toISOString(),
					endDate: e.endDate.toISOString(),
					location: e.location?.name ?? 'Online',
					community: e.community?.name ?? null,
					categories: e.categories.map((c) => c.category.name),
					rsvpCount: e.rsvpCount,
				})
			)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error'
			return { error: `Failed to search events: ${message}` }
		}
	},
})
