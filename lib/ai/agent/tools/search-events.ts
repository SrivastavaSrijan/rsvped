import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { AGENT_CONFIG } from '../constants'
import type { ToolEventResult } from '../types'

export const searchEvents = tool({
	description:
		'Search for events by keyword, category, date range, or city. Results are sorted by popularity (RSVP count). For broad queries like "trending" or "popular", pass an empty string as query to get the most popular events.',
	inputSchema: z.object({
		query: z
			.string()
			.optional()
			.default('')
			.describe(
				'Search keywords for event titles/descriptions. Use empty string "" for broad/popular/trending queries. Optional — omit or pass "" when filtering by category/city/date only.'
			),
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
			.default(AGENT_CONFIG.defaultSearchLimit)
			.describe('Max results to return (default 10)'),
	}),
	execute: async ({ query, category, city, dateAfter, dateBefore, limit }) => {
		try {
			// Words that express intent but won't match event titles/descriptions
			const conceptualWords = new Set([
				'trending',
				'popular',
				'best',
				'top',
				'recommended',
				'interesting',
				'cool',
				'fun',
				'good',
				'great',
				'nice',
				'awesome',
				'hot',
				'new',
				'latest',
				'upcoming',
				'happening',
				'nearby',
				'local',
				'all',
				'any',
				'everything',
				'events',
				'event',
				'find',
				'show',
				'me',
				'or',
				'and',
				'the',
				'in',
				'for',
				'a',
				'an',
				'some',
				'what',
				'which',
				'are',
				'is',
				'there',
				'right',
				'now',
			])

			// Strip conceptual words and check if anything meaningful remains
			const meaningfulQuery = query
				.split(/\s+/)
				.filter((w) => !conceptualWords.has(w.toLowerCase()))
				.join(' ')
				.trim()

			const isGenericQuery =
				!meaningfulQuery ||
				meaningfulQuery === '*' ||
				meaningfulQuery === '**' ||
				meaningfulQuery.length < 2

			const events = await prisma.event.findMany({
				where: {
					isPublished: true,
					deletedAt: null,
					AND: [
						isGenericQuery
							? {}
							: {
									OR: meaningfulQuery.split(/\s+/).flatMap((word) => [
										{
											title: {
												contains: word,
												mode: 'insensitive' as const,
											},
										},
										{
											description: {
												contains: word,
												mode: 'insensitive' as const,
											},
										},
									]),
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
					description:
						e.description?.slice(0, AGENT_CONFIG.maxDescriptionLength) ?? null,
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
