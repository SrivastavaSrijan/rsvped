import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const getEventDetails = tool({
	description:
		'Get full details for a specific event by slug or ID, including ticket tiers, host, and community info.',
	inputSchema: z.object({
		eventIdOrSlug: z
			.string()
			.describe('The event ID (cuid) or URL slug to look up'),
	}),
	execute: async ({ eventIdOrSlug }) => {
		try {
			const event = await prisma.event.findFirst({
				where: {
					isPublished: true,
					deletedAt: null,
					OR: [{ id: eventIdOrSlug }, { slug: eventIdOrSlug }],
				},
				select: {
					id: true,
					title: true,
					slug: true,
					description: true,
					startDate: true,
					endDate: true,
					timezone: true,
					locationType: true,
					coverImage: true,
					rsvpCount: true,
					location: { select: { name: true } },
					community: { select: { name: true, slug: true } },
					host: { select: { name: true, username: true } },
					categories: { select: { category: { select: { name: true } } } },
					ticketTiers: {
						select: {
							name: true,
							priceCents: true,
							quantityTotal: true,
							quantitySold: true,
						},
					},
				},
			})

			if (!event) return { error: 'Event not found' }

			return {
				id: event.id,
				title: event.title,
				slug: event.slug,
				description: event.description,
				startDate: event.startDate.toISOString(),
				endDate: event.endDate.toISOString(),
				timezone: event.timezone,
				locationType: event.locationType,
				coverImage: event.coverImage,
				location: event.location?.name ?? 'Online',
				community: event.community
					? { name: event.community.name, slug: event.community.slug }
					: null,
				host: event.host
					? { name: event.host.name, username: event.host.username }
					: null,
				categories: event.categories.map((c) => c.category.name),
				rsvpCount: event.rsvpCount,
				ticketTiers: event.ticketTiers.map((t) => ({
					name: t.name,
					priceCents: t.priceCents,
					available: (t.quantityTotal ?? 0) - t.quantitySold,
					total: t.quantityTotal ?? 0,
				})),
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error'
			return { error: `Failed to get event details: ${message}` }
		}
	},
})
