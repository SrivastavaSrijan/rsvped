import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resetDemoUser, seedDemoUser } from '@/prisma/seed/demo'

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
		await resetDemoUser(prisma)
		await seedDemoUser(prisma)
		return NextResponse.json({
			ok: true,
			resetAt: new Date().toISOString(),
		})
	} catch (error) {
		console.error('Demo reset failed:', error)
		return NextResponse.json({ error: 'Demo reset failed' }, { status: 500 })
	}
}
