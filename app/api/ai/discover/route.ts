import type { ModelMessage } from '@ai-sdk/provider-utils'
import { stepCountIs, streamText, tool } from 'ai'
import { z } from 'zod'
import { getModel, isAvailable } from '@/lib/ai'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Simple in-memory rate limiter (20 requests/hour per user)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(userId: string): boolean {
	const now = Date.now()
	const entry = rateLimitMap.get(userId)

	// Clean up expired entries to prevent unbounded Map growth
	if (rateLimitMap.size > 1000) {
		for (const [key, val] of rateLimitMap) {
			if (now > val.resetAt) rateLimitMap.delete(key)
		}
	}

	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS })
		return true
	}

	if (entry.count >= RATE_LIMIT) return false
	entry.count++
	return true
}

export async function POST(request: Request) {
	const contentType = request.headers.get('content-type')
	if (!contentType?.includes('application/json')) {
		return Response.json({ error: 'Invalid content type' }, { status: 415 })
	}

	if (!isAvailable()) {
		return Response.json({ error: 'AI not configured' }, { status: 503 })
	}

	const session = await auth()
	if (!session?.user) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 })
	}
	const userId = session.user.id

	if (!checkRateLimit(userId)) {
		return Response.json(
			{ error: 'Rate limit exceeded. Try again later.' },
			{ status: 429 }
		)
	}

	let messages: ModelMessage[]
	try {
		const body = await request.json()
		messages = body.messages
	} catch {
		return Response.json({ error: 'Invalid request body' }, { status: 400 })
	}

	if (!Array.isArray(messages)) {
		return Response.json({ error: 'Missing messages array' }, { status: 400 })
	}

	const result = streamText({
		model: getModel(),
		system: `You are an AI event discovery assistant for RSVP'd, an event management platform.
Help users find events by searching, filtering, and recommending based on their interests.

When a user asks about events, use the available tools to search the database.
After getting results, synthesize them into a helpful, concise response.
Mention specific event names, dates, and key details.
If no events match, suggest broadening the search or trying different terms.

Keep responses concise — 2-3 sentences plus event highlights. Don't be verbose.`,
		messages,
		tools: {
			searchEvents: tool({
				description:
					'Search for events by keyword, city, or category. Returns matching published events.',
				inputSchema: z.object({
					query: z
						.string()
						.describe('Search query for event titles and descriptions'),
					city: z.string().optional().describe('City name to filter by'),
					category: z
						.string()
						.optional()
						.describe('Category name to filter by'),
				}),
				execute: async ({ query, city, category }) => {
					const events = await prisma.event.findMany({
						where: {
							isPublished: true,
							deletedAt: null,
							AND: [
								{
									OR: [
										{ title: { contains: query, mode: 'insensitive' } },
										{
											description: { contains: query, mode: 'insensitive' },
										},
									],
								},
								city
									? {
											location: {
												name: { contains: city, mode: 'insensitive' },
											},
										}
									: {},
								category
									? {
											categories: {
												some: {
													category: {
														name: {
															contains: category,
															mode: 'insensitive',
														},
													},
												},
											},
										}
									: {},
							],
						},
						take: 10,
						orderBy: { startDate: 'asc' },
						select: {
							id: true,
							title: true,
							slug: true,
							description: true,
							startDate: true,
							endDate: true,
							coverImage: true,
							location: { select: { name: true } },
							community: { select: { name: true } },
							categories: {
								select: { category: { select: { name: true } } },
							},
						},
					})
					return events.map((e) => ({
						id: e.id,
						title: e.title,
						slug: e.slug,
						description: e.description?.slice(0, 200),
						startDate: e.startDate.toISOString(),
						endDate: e.endDate.toISOString(),
						coverImage: e.coverImage,
						location: e.location?.name ?? 'Online',
						community: e.community?.name ?? null,
						categories: e.categories.map((c) => c.category.name),
					}))
				},
			}),

			getEventDetails: tool({
				description:
					'Get full details for a specific event by ID, including ticket tiers.',
				inputSchema: z.object({
					eventId: z.string().describe('The event ID to get details for'),
				}),
				execute: async ({ eventId }) => {
					const event = await prisma.event.findFirst({
						where: { id: eventId, isPublished: true, deletedAt: null },
						select: {
							id: true,
							title: true,
							slug: true,
							description: true,
							startDate: true,
							endDate: true,
							coverImage: true,
							locationType: true,
							location: { select: { name: true } },
							community: { select: { name: true, slug: true } },
							host: { select: { name: true } },
							ticketTiers: {
								select: {
									name: true,
									priceCents: true,
									quantityTotal: true,
									quantitySold: true,
								},
							},
							_count: { select: { rsvps: true } },
						},
					})
					if (!event) return { error: 'Event not found' }
					return {
						...event,
						startDate: event.startDate.toISOString(),
						endDate: event.endDate.toISOString(),
						rsvpCount: event._count.rsvps,
					}
				},
			}),

			getCommunityEvents: tool({
				description: 'Get upcoming events from a specific community by ID.',
				inputSchema: z.object({
					communityId: z
						.string()
						.describe('The community ID to get events for'),
				}),
				execute: async ({ communityId }) => {
					const events = await prisma.event.findMany({
						where: {
							communityId,
							isPublished: true,
							deletedAt: null,
							startDate: { gte: new Date() },
						},
						take: 10,
						orderBy: { startDate: 'asc' },
						select: {
							id: true,
							title: true,
							slug: true,
							startDate: true,
							endDate: true,
							coverImage: true,
							location: { select: { name: true } },
						},
					})
					return events.map((e) => ({
						...e,
						startDate: e.startDate.toISOString(),
						endDate: e.endDate.toISOString(),
						location: e.location?.name ?? 'Online',
					}))
				},
			}),
		},
		stopWhen: stepCountIs(5),
	})

	return result.toUIMessageStreamResponse()
}
