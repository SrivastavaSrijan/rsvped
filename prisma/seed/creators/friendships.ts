/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
import { faker } from '@faker-js/faker'
import type { PrismaClient } from '@prisma/client'
import { logger } from '../utils'

export async function createFriendships(prisma: PrismaClient, users: any[]) {
	if (users.length < 2) {
		logger.warn('Not enough users to create friendships')
		return []
	}

	logger.info('Computing friendship pairs by interests and location...')

	// Get user category interests for similarity scoring
	const userCategories = await prisma.userCategory.findMany({
		select: { userId: true, categoryId: true, interestLevel: true },
	})

	// Build a map: userId -> { categoryId: interestLevel }
	const interestMap = new Map<string, Map<string, number>>()
	for (const uc of userCategories) {
		if (!interestMap.has(uc.userId)) {
			interestMap.set(uc.userId, new Map())
		}
		const userMap = interestMap.get(uc.userId)
		if (userMap) {
			userMap.set(uc.categoryId, uc.interestLevel)
		}
	}

	// Score user pairs
	type Pair = { userId: string; friendId: string; score: number }
	const pairs: Pair[] = []

	for (let i = 0; i < users.length; i++) {
		for (let j = i + 1; j < users.length; j++) {
			const a = users[i]
			const b = users[j]
			let score = 0

			// Same location: +3
			if (a.locationId && b.locationId && a.locationId === b.locationId) {
				score += 3
			}

			// Shared category interests: +2 per shared category
			const aInterests = interestMap.get(a.id)
			const bInterests = interestMap.get(b.id)
			if (aInterests && bInterests) {
				for (const [catId, aLevel] of aInterests) {
					const bLevel = bInterests.get(catId)
					if (bLevel) {
						score += Math.min(aLevel, bLevel) > 5 ? 2 : 1
					}
				}
			}

			// Same industry: +1
			if (a.industry && b.industry && a.industry === b.industry) {
				score += 1
			}

			if (score > 0) {
				pairs.push({ userId: a.id, friendId: b.id, score })
			}
		}
	}

	// Sort by score descending and select top N
	pairs.sort((a, b) => b.score - a.score)

	// Target ~4 friends per user on average
	const targetFriendships = Math.min(Math.floor(users.length * 2), pairs.length)
	const selectedPairs = pairs.slice(0, targetFriendships)

	const friendships = selectedPairs.map((pair) => {
		const isAccepted = Math.random() < 0.8
		return {
			userId: pair.userId,
			friendId: pair.friendId,
			status: isAccepted ? ('ACCEPTED' as const) : ('PENDING' as const),
			createdAt: faker.date.past({ years: 1 }),
			acceptedAt: isAccepted ? faker.date.recent({ days: 180 }) : null,
		}
	})

	await prisma.friendship.createMany({
		data: friendships,
		skipDuplicates: true,
	})

	const accepted = friendships.filter((f) => f.status === 'ACCEPTED').length
	logger.info(
		`✅ ${friendships.length} friendships created (${accepted} accepted, ${friendships.length - accepted} pending)`
	)

	return friendships
}
