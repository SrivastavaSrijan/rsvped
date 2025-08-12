import type { Prisma } from '@prisma/client'
import type { inferProcedureBuilderResolverOptions } from '@trpc/server'
import { z } from 'zod'
import { TRPCErrors } from '@/server/api/shared/errors'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { SortDirection } from '../../shared'

const GetCommunityInput = z.object({ slug: z.string() })

const communityCoreSelect = {
	id: true,
	name: true,
	slug: true,
	description: true,
	coverImage: true,
	owner: {
		select: {
			image: true,
			location: true,
			name: true,
			email: true,
		},
	},
} satisfies Prisma.CommunitySelect

const communityEnhancedSelect = {
	...communityCoreSelect,
	membershipTiers: {
		where: { isActive: true },
		select: {
			id: true,
			name: true,
			description: true,
			priceCents: true,
			currency: true,
		},
		orderBy: { priceCents: SortDirection.ASC },
	},
} satisfies Prisma.CommunitySelect

async function getUserRole(
	ctx: inferProcedureBuilderResolverOptions<typeof publicProcedure>['ctx'],
	communityId: string
) {
	const user = ctx.session?.user
	if (!user) return null
	const membership = await ctx.prisma.communityMembership.findFirst({
		where: {
			userId: user.id,
			communityId,
		},
		select: { role: true },
	})
	return membership?.role ?? null
}

export const communityGetRouter = createTRPCRouter({
	core: publicProcedure
		.input(GetCommunityInput)
		.query(async ({ ctx, input }) => {
			const community = await ctx.prisma.community.findUnique({
				where: { slug: input.slug },
				select: communityCoreSelect,
			})
			if (!community) {
				throw TRPCErrors.communityNotFound()
			}
			const role = await getUserRole(ctx, community.id)
			return { ...community, metadata: { role } }
		}),

	enhanced: publicProcedure
		.input(GetCommunityInput)
		.query(async ({ ctx, input }) => {
			const community = await ctx.prisma.community.findUnique({
				where: { slug: input.slug },
				select: communityEnhancedSelect,
			})
			if (!community) {
				throw TRPCErrors.communityNotFound()
			}
			const role = await getUserRole(ctx, community.id)
			return { ...community, metadata: { role } }
		}),
})
