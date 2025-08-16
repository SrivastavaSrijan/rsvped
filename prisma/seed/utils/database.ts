/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
import type { PrismaClient } from '@prisma/client'
import { logger } from '../utils'
import { DatabaseError } from './errors'

export async function wipeDb(prisma: PrismaClient) {
	const operation = logger.startOperation('wipe_database')

	try {
		// Order matters (respect FK constraints)
		await prisma.$transaction([
			prisma.eventDailyStat.deleteMany(),
			prisma.eventView.deleteMany(),
			prisma.eventFeedback.deleteMany(),
			prisma.registrationAnswer.deleteMany(),
			prisma.registrationQuestion.deleteMany(),
			prisma.checkIn.deleteMany(),
			prisma.eventCollaborator.deleteMany(),
			prisma.eventMessage.deleteMany(),
			prisma.eventReferral.deleteMany(),
			prisma.rsvp.deleteMany(),
			prisma.refund.deleteMany(),
			prisma.payment.deleteMany(),
			prisma.orderItem.deleteMany(),
			prisma.order.deleteMany(),
			prisma.promoCodeTier.deleteMany(),
			prisma.promoCode.deleteMany(),
			prisma.ticketTier.deleteMany(),
			prisma.eventCategory.deleteMany(),
			prisma.event.deleteMany(),
			prisma.membershipTier.deleteMany(),
			prisma.communityMembership.deleteMany(),
			prisma.community.deleteMany(),
			prisma.session.deleteMany(),
			prisma.account.deleteMany(),
			prisma.verificationToken.deleteMany(),
			prisma.user.deleteMany(),
		])

		operation.complete()
	} catch (error) {
		operation.fail(error)
		throw new DatabaseError('Failed to wipe database', undefined, error)
	}
}
