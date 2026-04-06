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

	// Map by both slug and name so LLM data (slug) and faker data (name) both resolve
	const locationMap = new Map(
		locations.flatMap((l) => [
			[l.slug, l],
			[l.name, l],
		])
	)

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

	// Interest-aware memberships: match users by category overlap + strong location preference
	// Two-pass: local communities first (guaranteed), then remote to fill remaining slots
	const membershipsToCreate: any[] = []
	const seenPairs = new Set<string>()
	const userRemoteCount = new Map<string, number>()
	const MAX_REMOTE_PER_USER = 5
	const MAX_LOCAL_PER_USER = 10

	// Build per-user location lookup once
	const userLocationId = new Map<string, string>()
	for (const u of users) {
		const locId =
			u._llmUser?.location && locationMap.get(u._llmUser.location)?.id
		if (locId) userLocationId.set(u.id, locId)
	}

	// Group communities by location for two-pass processing
	const localCommunities = communities.filter((c: any) => c._locationId != null)
	const shuffled = faker.helpers.shuffle([...localCommunities])

	for (const c of shuffled) {
		const communityCategories: string[] = c._llmData?.categories || []
		const communityLocationId = c._locationId

		// Score users: local users strongly preferred, remote capped separately
		const scored = users
			.filter((u: any) => {
				const isLocal = userLocationId.get(u.id) === communityLocationId
				const pairKey = `${u.id}|${c.id}`
				if (seenPairs.has(pairKey)) return false
				if (isLocal) return true // always consider local users
				return (userRemoteCount.get(u.id) ?? 0) < MAX_REMOTE_PER_USER
			})
			.map((u: any) => {
				const userInterests: string[] = u._llmUser?.interests || []
				const overlap = communityCategories.filter((cat) =>
					userInterests.includes(cat)
				).length
				const interestScore = overlap / Math.max(communityCategories.length, 1)
				const isLocal = userLocationId.get(u.id) === communityLocationId
				// Local: 3x boost. Remote: heavy penalty
				const score = interestScore * (isLocal ? 3.0 : 0.1)
				return { user: u, score, overlap, isLocal }
			})

		scored.sort((a, b) => b.score - a.score)

		// Target: 3-12% of users, minimum 5
		const targetCount = Math.max(
			5,
			faker.number.int({
				min: Math.floor(users.length * 0.03),
				max: Math.floor(users.length * 0.12),
			})
		)

		// Take top scorers (heavily local due to 3x multiplier)
		const matched = scored.filter((s) => s.score > 0).slice(0, targetCount)
		// Fill remaining with random local users if available
		const matchedIds = new Set(matched.map((s) => s.user.id))
		const localPool = scored.filter(
			(s) => s.isLocal && !matchedIds.has(s.user.id)
		)
		const fillCount = Math.max(0, targetCount - matched.length)
		const fillers = sampleSize(localPool, fillCount)

		const communityUsers = [
			...matched.map((s) => s.user),
			...fillers.map((s) => s.user),
		]

		// Get tiers for this community, sorted by price (cheapest first)
		const tiers = membershipTiers
			.filter((t: any) => t.communityId === c.id)
			.sort((a: any, b: any) => (a.priceCents ?? 0) - (b.priceCents ?? 0))

		for (const u of communityUsers) {
			const pairKey = `${u.id}|${c.id}`
			if (seenPairs.has(pairKey)) continue
			seenPairs.add(pairKey)

			const role = faker.helpers.weightedArrayElement([
				{ weight: 80, value: MembershipRole.MEMBER },
				{ weight: 15, value: MembershipRole.MODERATOR },
				{ weight: 5, value: MembershipRole.ADMIN },
			])

			// Spending-power-aware tier selection
			let pickTier: any = null
			if (tiers.length > 0) {
				const spending = (u._llmUser?.spendingPower || '').toLowerCase()
				if (spending === 'high')
					pickTier = tiers[tiers.length - 1] // most expensive
				else if (spending === 'medium')
					pickTier = tiers[Math.floor(tiers.length / 2)]
				else pickTier = tiers[0] // cheapest / free
			}

			const isLocalMember = userLocationId.get(u.id) === communityLocationId
			if (!isLocalMember) {
				userRemoteCount.set(u.id, (userRemoteCount.get(u.id) ?? 0) + 1)
			}
			membershipsToCreate.push({
				userId: u.id,
				communityId: c.id,
				role,
				membershipTierId: pickTier?.id ?? null,
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
