/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */

import { faker } from '@faker-js/faker'
import {
	BillingInterval,
	CommunityExclusivity,
	MembershipRole,
	type PrismaClient,
	SubscriptionStatus,
} from '@prisma/client'
import type { BatchProcessedData } from '../utils'
import { config } from '../utils/config'
import { rand, sampleSize, uniqueSlug } from '../utils/faker-helpers'

export async function createCommunities(
	prisma: PrismaClient,
	users: any[],
	images: any[],
	locations: any[],
	batchData?: BatchProcessedData
) {
	// Try to load communities from batch data first, then fallback to LLM
	const llmCommunities = config.USE_LLM ? batchData?.communities || [] : []

	const data: any[] = []

	// Map of location names to IDs for finding correct locations later
	const locationMap = new Map(locations.map((l) => [l.name, l]))

	// Process communities - either from LLM or generate with faker
	for (let i = 0; i < config.NUM_COMMUNITIES; i++) {
		const owner = rand(users)

		if (i < llmCommunities.length) {
			// Use LLM-generated community data
			const llmData = llmCommunities[i]
			const name = llmData.name

			// Find corresponding location
			const location = locationMap.get(llmData.homeLocation) || rand(locations)
			let exclusivity: CommunityExclusivity = CommunityExclusivity.OPEN
			if (llmData.membershipStyle === 'application-based') {
				exclusivity = CommunityExclusivity.APPLICATION_BASED
			} else if (llmData.membershipStyle === 'invite-only') {
				exclusivity = CommunityExclusivity.INVITE_ONLY
			}
			data.push({
				name,
				slug: uniqueSlug(name),
				description: llmData.description,
				targetAudience: llmData.targetAudience,
				coverImage: rand(images),
				exclusivity,
				isPublic:
					llmData.membershipStyle === 'open' || faker.datatype.boolean(),
				ownerId: owner.id,
				_llmData: llmData, // Store LLM data for later use
				_locationId: location.id,
			})
		} else {
			// Fallback to faker
			const name = faker.company.name()
			data.push({
				name,
				slug: uniqueSlug(name),
				description: faker.lorem.paragraph(),
				exclusivity: faker.helpers.arrayElement(
					Object.values(CommunityExclusivity)
				),
				targetAudience: faker.lorem.sentence(),
				coverImage: rand(images),
				isPublic: faker.datatype.boolean(),
				ownerId: owner.id,
				_llmData: null,
				_locationId: rand(locations).id,
			})
		}
	}

	// Upsert communities in database (without the _llmData property)
	const dbData = data.map(({ _llmData, _locationId, ...rest }) => rest)
	const communities = [] as any[]
	for (const c of dbData) {
		const row = await prisma.community.upsert({
			where: { slug: c.slug },
			update: {
				description: c.description,
				coverImage: c.coverImage,
				isPublic: c.isPublic,
				ownerId: c.ownerId,
			},
			create: c,
		})
		communities.push(row)
	}

	// Reattach LLM data and location ID for later use
	communities.forEach((community, i) => {
		community._llmData = data[i]._llmData
		community._locationId = data[i]._locationId
	})

	// Membership tiers
	const tiersToCreate: any[] = []

	for (const c of communities) {
		if (c._llmData?.membershipTiers) {
			// Use LLM-generated tiers
			for (const tier of c._llmData.membershipTiers) {
				const tierName = tier.name || faker.commerce.productName()
				tiersToCreate.push({
					communityId: c.id,
					benefits: tier.benefits || [],
					name: tierName,
					slug: uniqueSlug(tierName),
					description: tier.description,
					priceCents: tier.priceCents || 0,
					currency: tier.priceCents > 0 ? 'USD' : null,
					billingInterval:
						tier.priceCents > 0
							? faker.helpers.arrayElement([
									BillingInterval.MONTHLY,
									BillingInterval.YEARLY,
								])
							: null,
					stripePriceId: null,
					isActive: true,
					createdAt: faker.date.past(),
				})
			}
		} else {
			// Fallback to faker
			const tierCount = faker.number.int({ min: 1, max: 3 })
			for (let i = 0; i < tierCount; i++) {
				const tierName = faker.commerce.productName()
				const priceCents = faker.datatype.boolean()
					? faker.number.int({ min: 500, max: 10000 })
					: 0
				tiersToCreate.push({
					communityId: c.id,
					name: tierName,
					slug: uniqueSlug(tierName),
					description: faker.commerce.productDescription(),
					benefits: [
						faker.company.catchPhrase(),
						faker.company.catchPhrase(),
						faker.company.catchPhrase(),
					],
					priceCents,
					currency: priceCents > 0 ? 'USD' : null,
					billingInterval:
						priceCents > 0
							? faker.helpers.arrayElement([
									BillingInterval.MONTHLY,
									BillingInterval.YEARLY,
								])
							: null,
					stripePriceId: null,
					isActive: true,
					createdAt: faker.date.past(),
				})
			}
		}
	}

	const membershipTiers =
		tiersToCreate.length > 0
			? await prisma.$transaction(
					tiersToCreate.map((t) => prisma.membershipTier.create({ data: t }))
				)
			: []

	// Memberships
	const membershipsToCreate: any[] = []
	for (const c of communities) {
		const communityUsers = sampleSize(
			users,
			faker.number.int({ min: users.length * 0.2, max: users.length * 0.6 })
		)
		for (const u of communityUsers) {
			const role = faker.helpers.weightedArrayElement([
				{ weight: 80, value: MembershipRole.MEMBER },
				{ weight: 15, value: MembershipRole.MODERATOR },
				{ weight: 5, value: MembershipRole.ADMIN },
			])
			const tier = membershipTiers.filter((t: any) => t.communityId === c.id)
			const pickTier = tier.length ? rand(tier) : null
			membershipsToCreate.push({
				userId: u.id,
				communityId: c.id,
				role,
				membershipTierId: (pickTier as any)?.id ?? null,
				subscriptionStatus: pickTier
					? rand(Object.values(SubscriptionStatus))
					: null,
				expiresAt:
					pickTier && faker.datatype.boolean()
						? faker.date.soon({ days: 180 })
						: null,
				joinedAt: faker.date.past(),
			})
		}
	}

	if (membershipsToCreate.length) {
		if (prisma.communityMembership.createMany) {
			await prisma.communityMembership.createMany({
				data: membershipsToCreate,
				skipDuplicates: true,
			})
		} else {
			await prisma.$transaction(
				membershipsToCreate.map((m) =>
					prisma.communityMembership.create({ data: m })
				)
			)
		}
	}

	return { communities, membershipTiers }
}
