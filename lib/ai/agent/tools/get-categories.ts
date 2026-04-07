import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { ToolCategoryResult } from '../types'

export const getCategories = tool({
	description:
		'Get all event categories with their event counts. Use this to help users browse by category or suggest categories.',
	inputSchema: z.object({}),
	execute: async () => {
		try {
			const categories = await prisma.category.findMany({
				select: {
					name: true,
					slug: true,
					_count: { select: { events: true } },
				},
				orderBy: { events: { _count: 'desc' } },
			})

			return categories.map(
				(c): ToolCategoryResult => ({
					name: c.name,
					slug: c.slug,
					eventCount: c._count.events,
				})
			)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error'
			return { error: `Failed to get categories: ${message}` }
		}
	},
})
