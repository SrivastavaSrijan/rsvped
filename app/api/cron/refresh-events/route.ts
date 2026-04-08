import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60

function isValidCronSecret(authHeader: string | null): boolean {
	const expected = process.env.CRON_SECRET
	if (!expected || !authHeader) return false
	const token = authHeader.replace('Bearer ', '')
	try {
		return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
	} catch {
		return false
	}
}

/**
 * Shifts all past events forward by a random 1-8 week offset,
 * keeping their duration intact. This ensures the app always
 * has upcoming events for demo purposes.
 */
export async function GET(request: Request) {
	if (!process.env.CRON_SECRET) {
		return NextResponse.json(
			{ error: 'CRON_SECRET not configured' },
			{ status: 503 }
		)
	}

	const authHeader = request.headers.get('authorization')
	if (!isValidCronSecret(authHeader)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const now = new Date()

		// Find all published events that ended in the past
		const pastEvents = await prisma.event.findMany({
			where: {
				isPublished: true,
				deletedAt: null,
				endDate: { lt: now },
			},
			select: {
				id: true,
				startDate: true,
				endDate: true,
			},
		})

		if (pastEvents.length === 0) {
			return NextResponse.json({ ok: true, refreshed: 0 })
		}

		// Reserve ~20% of events for "this week" so demo always has near-term data
		const shortTermCount = Math.max(1, Math.ceil(pastEvents.length * 0.2))

		// Build all update operations
		const updates = pastEvents.map((event, i) => {
			const durationMs = event.endDate.getTime() - event.startDate.getTime()
			// First `shortTermCount` events land 0-1 weeks out; rest land 2-10 weeks out
			const offsetWeeks =
				i < shortTermCount ? Math.random() : 2 + Math.floor(Math.random() * 8)
			const offsetMs = offsetWeeks * 7 * 24 * 60 * 60 * 1000
			// Add some hour variance so events don't all land on the same time
			const hourVariance = Math.floor(Math.random() * 12) * 60 * 60 * 1000

			const newStart = new Date(now.getTime() + offsetMs + hourVariance)
			const newEnd = new Date(newStart.getTime() + durationMs)

			return prisma.event.update({
				where: { id: event.id },
				data: { startDate: newStart, endDate: newEnd },
			})
		})

		// Execute in batches of 25 to avoid overwhelming the DB
		const BATCH_SIZE = 25
		for (let i = 0; i < updates.length; i += BATCH_SIZE) {
			const batch = updates.slice(i, i + BATCH_SIZE)
			await prisma.$transaction(batch)
		}

		return NextResponse.json({
			ok: true,
			refreshed: updates.length,
			shortTerm: shortTermCount,
			totalPastEvents: pastEvents.length,
		})
	} catch (error) {
		console.error('Event refresh failed:', error)
		return NextResponse.json({ error: 'Event refresh failed' }, { status: 500 })
	}
}
