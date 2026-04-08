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
	const { user, stats } = await seedDemoUser(prisma)

	console.log('\n✅ Demo user seeded:')
	console.log(`  Name: ${user.name} (@${user.username})`)
	console.log(`  Email: ${user.email}`)
	console.log(`  Communities: ${stats.communities}`)
	console.log(`  RSVPs: ${stats.rsvps}`)
	console.log(`  Hosted Events: ${stats.hostedEvents}`)
	console.log(`  Category Interests: ${stats.categoryInterests}`)
	console.log(`  Sent Friend Requests: ${stats.sentFriendRequests}`)
	console.log(`  Received Friend Requests: ${stats.receivedFriendRequests}`)
	console.log(`  Activities: ${stats.activities}`)

	await prisma.$disconnect()
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
