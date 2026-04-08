import type { UIMessage } from 'ai'
import { isAvailable } from '@/lib/ai'
import type { PageContext } from '@/lib/ai/agent'
import { createStirStream } from '@/lib/ai/agent'
import { AGENT_CONFIG, RATE_LIMIT } from '@/lib/ai/agent/constants'
import { auth } from '@/lib/auth'

export const maxDuration = AGENT_CONFIG.maxDuration

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string, limit: number): boolean {
	const now = Date.now()

	// Prune stale entries
	if (rateLimitMap.size > AGENT_CONFIG.rateLimitMapPruneThreshold) {
		for (const [k, v] of rateLimitMap) {
			if (now > v.resetAt) rateLimitMap.delete(k)
		}
	}

	const entry = rateLimitMap.get(key)
	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs })
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
	const rateLimitMax = userId ? RATE_LIMIT.auth : RATE_LIMIT.anon

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

	// Validate last message isn't excessively long
	const lastMessage = messages.at(-1)
	const lastMessageText =
		lastMessage?.parts
			?.filter((p: { type: string }) => p.type === 'text')
			.map((p: { type: string; text?: string }) => p.text ?? '')
			.join('') ?? ''
	if (lastMessageText.length > AGENT_CONFIG.maxMessageLength) {
		return Response.json(
			{
				error: `Message too long. Please keep messages under ${AGENT_CONFIG.maxMessageLength} characters.`,
			},
			{ status: 400 }
		)
	}

	try {
		return await createStirStream({ messages, pageContext, userId })
	} catch (error) {
		console.error('[stir-route] Stream creation failed:', error)
		const message =
			error instanceof Error ? error.message : 'Unknown error occurred'
		return Response.json(
			{ error: `Failed to generate response: ${message}` },
			{ status: 500 }
		)
	}
}
