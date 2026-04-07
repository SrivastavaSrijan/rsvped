import type { UIMessage } from 'ai'
import { isAvailable } from '@/lib/ai'
import type { PageContext } from '@/lib/ai/agent'
import { createStirStream } from '@/lib/ai/agent'
import { auth } from '@/lib/auth'

export const maxDuration = 30

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_AUTH = 20
const RATE_LIMIT_ANON = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(key: string, limit: number): boolean {
	const now = Date.now()

	// Prune stale entries
	if (rateLimitMap.size > 1000) {
		for (const [k, v] of rateLimitMap) {
			if (now > v.resetAt) rateLimitMap.delete(k)
		}
	}

	const entry = rateLimitMap.get(key)
	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
		return true
	}
	if (entry.count >= limit) return false
	entry.count++
	return true
}

function getClientIP(request: Request): string {
	return (
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		request.headers.get('x-real-ip') ??
		'unknown'
	)
}

export async function POST(request: Request) {
	if (!isAvailable()) {
		return Response.json(
			{ error: 'AI features are not configured' },
			{ status: 503 }
		)
	}

	const session = await auth()
	const userId = session?.user?.id
	const rateLimitKey = userId ?? `ip:${getClientIP(request)}`
	const rateLimitMax = userId ? RATE_LIMIT_AUTH : RATE_LIMIT_ANON

	if (!checkRateLimit(rateLimitKey, rateLimitMax)) {
		return Response.json(
			{ error: 'Rate limit exceeded. Try again later.' },
			{ status: 429 }
		)
	}

	let messages: UIMessage[]
	let pageContext: PageContext | undefined
	try {
		const body = await request.json()
		messages = body.messages
		pageContext = body.pageContext
	} catch {
		return Response.json({ error: 'Invalid request body' }, { status: 400 })
	}

	if (!Array.isArray(messages) || messages.length === 0) {
		return Response.json({ error: 'Missing messages array' }, { status: 400 })
	}

	return createStirStream({ messages, pageContext, userId })
}
