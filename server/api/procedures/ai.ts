import { initTRPC } from '@trpc/server'
import { llm } from '@/lib/ai'
import { TRPCErrors } from '@/server/api/shared/errors'
import type { Context } from '@/server/api/trpc'
import { createTRPCRouter } from '@/server/api/trpc'

// Create a local t instance to build custom procedures without duplicating globals
const t = initTRPC.context<Context>().create()

export type AIUserContext = {
	userId?: string
	locationId?: string | null
	interests: { categoryId: string; level: number }[]
	communities: { communityId: string; role: string }[]
	recentEvents: {
		eventId: string
		startDate: Date
		locationId: string | null
	}[]
}

/**
 * aiEnrichedProcedure
 * - Adds `aiContext` to ctx with user interests, memberships, and recent events
 */
export const aiEnrichedProcedure = t.procedure.use(async ({ ctx, next }) => {
	const aiContext: AIUserContext = {
		userId: ctx.session?.user?.id,
		locationId: null,
		interests: [],
		communities: [],
		recentEvents: [],
	}

	try {
		if (ctx.session?.user?.id) {
			const userId = ctx.session.user.id

			// Load user profile light data
			const user = await ctx.prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					locationId: true,
					categoryInterests: {
						select: { categoryId: true, interestLevel: true },
					},
					communityMemberships: { select: { communityId: true, role: true } },
				},
			})

			if (user) {
				aiContext.locationId = user.locationId
				aiContext.interests = user.categoryInterests.map((ci) => ({
					categoryId: ci.categoryId,
					level: ci.interestLevel,
				}))
				aiContext.communities = user.communityMemberships.map((m) => ({
					communityId: m.communityId,
					role: m.role,
				}))
			}

			// Recent events the user attended (confirmed RSVPs only)
			const recentRsvps = await ctx.prisma.rsvp.findMany({
				where: { userId, status: 'CONFIRMED' },
				select: {
					eventId: true,
					event: { select: { startDate: true, locationId: true } },
				},
				orderBy: { createdAt: 'desc' },
				take: 20,
			})

			aiContext.recentEvents = recentRsvps.map((r) => ({
				eventId: r.eventId,
				startDate: r.event.startDate,
				locationId: r.event.locationId,
			}))
		}
	} catch (err) {
		// Non-fatal: proceed without enrichment if something fails
		console.warn(
			'aiEnrichedProcedure: enrichment failed, continuing without context',
			err
		)
	}

	return next({
		ctx: { ...ctx, aiContext },
	})
})

/**
 * llmProcedure
 * - Ensures LLM is configured and available
 */
export const ensureLLM = t.middleware(async ({ next }) => {
	if (!llm.isAvailable()) {
		throw TRPCErrors.internal()
	}
	return next()
})

export const llmProcedure = t.procedure.use(ensureLLM)

export const aiProceduresRouter = createTRPCRouter({})

export type WithAIContext = Context & { aiContext?: AIUserContext }
