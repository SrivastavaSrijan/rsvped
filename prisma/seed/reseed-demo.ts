/**
 * Standalone script to reset + re-seed the demo user.
 * Usage: npx tsx prisma/seed/reseed-demo.ts
 */
import { PrismaClient } from '@prisma/client'
import { resetDemoUser, seedDemoUser } from './demo'

const prisma = new PrismaClient()

async function main() {
	console.log('Resetting demo user...')
	await resetDemoUser(prisma)

	console.log('Re-seeding demo user...')
	const user = await seedDemoUser(prisma)

	const stats = await prisma.user.findUnique({
		where: { id: user.id },
		select: {
			name: true,
			username: true,
			bio: true,
			isDemo: true,
			location: { select: { name: true } },
			_count: {
				select: {
					communityMemberships: true,
					rsvps: true,
					hostedEvents: true,
					categoryInterests: true,
					sentFriendRequests: true,
					activities: true,
				},
			},
		},
	})

	if (stats) {
		console.log('\n✅ Demo user seeded:')
		console.log(`  Name: ${stats.name} (@${stats.username})`)
		console.log(`  Bio: ${stats.bio}`)
		console.log(`  City: ${stats.location?.name ?? 'none'}`)
		console.log(`  Communities: ${stats._count.communityMemberships}`)
		console.log(`  RSVPs: ${stats._count.rsvps}`)
		console.log(`  Hosted Events: ${stats._count.hostedEvents}`)
		console.log(`  Category Interests: ${stats._count.categoryInterests}`)
		console.log(`  Friendships: ${stats._count.sentFriendRequests}`)
		console.log(`  Activities: ${stats._count.activities}`)
	}

	await prisma.$disconnect()
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
