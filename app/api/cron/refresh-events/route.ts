import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

		// Shift each past event forward by 2-10 weeks from now
		let refreshed = 0
		for (const event of pastEvents) {
			const durationMs = event.endDate.getTime() - event.startDate.getTime()
			const offsetWeeks = 2 + Math.floor(Math.random() * 8)
			const offsetMs = offsetWeeks * 7 * 24 * 60 * 60 * 1000
			// Add some hour variance so events don't all land on the same time
			const hourVariance = Math.floor(Math.random() * 12) * 60 * 60 * 1000

			const newStart = new Date(now.getTime() + offsetMs + hourVariance)
			const newEnd = new Date(newStart.getTime() + durationMs)

			await prisma.event.update({
				where: { id: event.id },
				data: { startDate: newStart, endDate: newEnd },
			})
			refreshed++
		}

		return NextResponse.json({
			ok: true,
			refreshed,
			totalPastEvents: pastEvents.length,
		})
	} catch (error) {
		console.error('Event refresh failed:', error)
		return NextResponse.json({ error: 'Event refresh failed' }, { status: 500 })
	}
}
