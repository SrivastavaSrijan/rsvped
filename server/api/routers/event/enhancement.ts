import { EventRole } from '@prisma/client'
import type { SearchMatchInfo } from '@/server/api/routers/stir/helpers'
import type { Context } from '@/server/api/trpc'

// Helper function to enhance events with user metadata
export async function enhanceEvents<
	T extends {
		id: string
		host: { id: string }
		communityId: string | null
		eventCollaborators?: Array<{ user: { id: string }; role: EventRole }>
		_searchMetadata?: {
			matches: SearchMatchInfo[]
			score: number
			query: string
		}
	},
>(
	events: T[],
	user: {
		id: string
		name?: string | null
		image?: string | null
		email?: string | null
	},
	prisma: Context['prisma']
) {
	if (events.length === 0) {
		return []
	}

	const eventIds = events.map((event) => event.id)

	// Get user RSVPs and community memberships in parallel
	const [userRsvps, communityMemberships] = await Promise.all([
		prisma.rsvp.findMany({
			where: { userId: user.id, eventId: { in: eventIds } },
			include: { ticketTier: true },
		}),
		prisma.communityMembership.findMany({
			where: {
				userId: user.id,
				communityId: {
					in: events
						.map((e) => e.communityId)
						.filter((id): id is string => id !== null),
				},
			},
			select: { communityId: true, role: true },
		}),
	])

	// Create lookup maps
	const rsvpMap = new Map(userRsvps.map((r) => [r.eventId, r]))
	const membershipMap = new Map(
		communityMemberships.map((m) => [m.communityId, m.role])
	)

	// Enhance events with metadata
	return events.map((event) => {
		const isHost = event.host.id === user.id
		const collaboratorRole = event.eventCollaborators?.find(
			(c) => c.user.id === user.id
		)?.role

		const metadata = {
			user: {
				id: user.id,
				name: user.name,
				image: user.image,
				email: user.email,
				rsvp: rsvpMap.get(event.id) ?? null,
				access: {
					manager: isHost || collaboratorRole === EventRole.MANAGER,
					cohost: collaboratorRole === EventRole.CO_HOST,
				},
				communityRole: event.communityId
					? (membershipMap.get(event.communityId) ?? null)
					: null,
			},
			// Include search metadata if present
			...(event._searchMetadata && {
				search: {
					matches: event._searchMetadata.matches,
					score: event._searchMetadata.score,
					query: event._searchMetadata.query,
					primaryMatch: event._searchMetadata.matches[0] || null,
				},
			}),
		}

		return { ...event, metadata }
	})
}
