import {
	convertToModelMessages,
	smoothStream,
	stepCountIs,
	streamText,
} from 'ai'
import { getModel } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { classifyIntent } from './classifier'
import {
	AGENT_CONFIG,
	getStirSystemPrompt,
	INTENT_TOOL_MAP,
	STIR_ANON_CONTEXT,
} from './constants'
import { logConversationComplete, logStepComplete, logToolCall } from './logger'
import {
	getCategories,
	getEventDetails,
	getFriendsAttending,
	getSimilarEvents,
	getTrending,
	getUserCommunities,
	getUserProfile,
	getUserRsvps,
	searchCommunities,
	searchEvents,
} from './tools'
import type { StirStreamOptions } from './types'

/** All available tools keyed by name */
const ALL_TOOLS = {
	searchEvents,
	searchCommunities,
	getEventDetails,
	getCategories,
	getUserProfile,
	getUserRsvps,
	getUserCommunities,
	getFriendsAttending,
	getTrending,
	getSimilarEvents,
} as const

/**
 * Build enriched system prompt with page context and user info.
 */
async function buildSystemPrompt(
	pageContext: StirStreamOptions['pageContext'],
	userId: StirStreamOptions['userId']
): Promise<string> {
	const parts = [getStirSystemPrompt()]

	// Enrich with page context
	if (pageContext) {
		const contextLines: string[] = ['## Current Page Context']

		if (pageContext.eventSlug) {
			const event = await prisma.event.findFirst({
				where: {
					slug: pageContext.eventSlug,
					isPublished: true,
					deletedAt: null,
				},
				select: {
					title: true,
					startDate: true,
					endDate: true,
					community: { select: { name: true } },
				},
			})
			if (event) {
				contextLines.push(
					`The user is viewing the event "${event.title}" (slug: ${pageContext.eventSlug}).`,
					`Dates: ${event.startDate.toISOString()} to ${event.endDate.toISOString()}.`
				)
				if (event.community) {
					contextLines.push(`Community: ${event.community.name}.`)
				}
			}
		}

		if (pageContext.communitySlug) {
			const community = await prisma.community.findFirst({
				where: { slug: pageContext.communitySlug, isPublic: true },
				select: { name: true, description: true },
			})
			if (community) {
				contextLines.push(
					`The user is viewing the community "${community.name}" (slug: ${pageContext.communitySlug}).`
				)
				if (community.description) {
					contextLines.push(
						`Description: ${community.description.slice(0, AGENT_CONFIG.maxDescriptionLength)}`
					)
				}
			}
		}

		if (
			!pageContext.eventSlug &&
			!pageContext.communitySlug &&
			pageContext.page
		) {
			contextLines.push(`The user is on the "${pageContext.page}" page.`)
		}

		if (contextLines.length > 1) {
			parts.push(contextLines.join('\n'))
		}
	}

	// Add user context with profile data
	if (userId) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				name: true,
				interests: true,
				profession: true,
				industry: true,
				location: { select: { name: true } },
				categoryInterests: {
					select: { category: { select: { name: true } } },
					take: AGENT_CONFIG.maxCategoryInterests,
				},
				rsvps: {
					where: { status: 'CONFIRMED' },
					select: {
						event: {
							select: {
								title: true,
								categories: {
									select: { category: { select: { name: true } } },
								},
							},
						},
					},
					orderBy: { createdAt: 'desc' },
					take: AGENT_CONFIG.maxRecentRsvps,
				},
			},
		})

		const userLines: string[] = ['## User Profile']
		if (user) {
			if (user.name) userLines.push(`Name: ${user.name}`)
			if (user.location?.name) userLines.push(`Location: ${user.location.name}`)
			if (user.profession) userLines.push(`Profession: ${user.profession}`)
			if (user.industry) userLines.push(`Industry: ${user.industry}`)
			if (user.interests.length > 0)
				userLines.push(`Interests: ${user.interests.join(', ')}`)
			if (user.categoryInterests.length > 0) {
				const cats = user.categoryInterests
					.map((c) => c.category.name)
					.join(', ')
				userLines.push(`Preferred categories: ${cats}`)
			}
			if (user.rsvps.length > 0) {
				const recentEvents = user.rsvps.map((r) => r.event.title).join(', ')
				userLines.push(`Recent RSVPs: ${recentEvents}`)
			}
		}
		userLines.push(
			'Use this profile to personalize recommendations. Do NOT ask the user for information you already have.'
		)
		parts.push(userLines.join('\n'))
	} else {
		parts.push(STIR_ANON_CONTEXT)
	}

	return parts.join('\n\n')
}

/**
 * Create a streaming response for a Stir agent conversation.
 */
export async function createStirStream({
	messages,
	pageContext,
	userId,
}: StirStreamOptions) {
	let system: string
	try {
		system = await buildSystemPrompt(pageContext, userId)
	} catch (error) {
		console.error('[stir-agent] System prompt build failed:', error)
		// Fall back to base prompt without enrichment
		system = getStirSystemPrompt()
	}

	// Extract the latest user message for intent classification
	const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
	const queryText =
		lastUserMessage?.parts
			?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
			.map((p) => p.text)
			.join(' ') ?? ''

	// Classify intent to scope active tools
	const classification = await classifyIntent(queryText, pageContext)
	const activeToolNames =
		INTENT_TOOL_MAP[classification.intent] ?? Object.keys(ALL_TOOLS)

	// Filter out user-context tools for anonymous users
	const filteredToolNames = userId
		? activeToolNames
		: activeToolNames.filter(
				(name) =>
					![
						'getUserProfile',
						'getUserRsvps',
						'getUserCommunities',
						'getFriendsAttending',
					].includes(name)
			)

	// Build scoped tools object
	const toolNames = Object.keys(ALL_TOOLS)
	const activeTools = Object.fromEntries(
		filteredToolNames
			.filter((name): name is keyof typeof ALL_TOOLS =>
				toolNames.includes(name)
			)
			.map((name) => [name, ALL_TOOLS[name]])
	)

	// Append intent info to system prompt
	system += `\n\n## Intent Classification\nUser intent: ${classification.intent} (${classification.reasoning}). Focus your response accordingly.`

	const conversationStart = Date.now()
	let stepIndex = 0
	let totalTokens = 0

	const result = streamText({
		model: getModel(),
		system,
		messages: await convertToModelMessages(messages),
		tools: activeTools,
		stopWhen: stepCountIs(AGENT_CONFIG.maxSteps),
		experimental_transform: smoothStream(),
		onStepFinish: ({ usage, toolResults }) => {
			// Log individual tool calls with timing
			if (toolResults) {
				for (const toolResult of toolResults) {
					const resultData = toolResult.output
					const resultCount = Array.isArray(resultData)
						? resultData.length
						: undefined
					const error =
						resultData &&
						typeof resultData === 'object' &&
						!Array.isArray(resultData) &&
						'error' in resultData
							? String((resultData as Record<string, unknown>).error)
							: undefined

					logToolCall({
						toolName: toolResult.toolName,
						args: (toolResult.input as Record<string, unknown>) ?? {},
						durationMs: 0,
						resultCount,
						error,
					})
				}
			}

			// Log step completion
			const stepTokens = usage?.totalTokens ?? 0
			totalTokens += stepTokens
			logStepComplete({
				stepIndex,
				inputTokens: usage?.inputTokens ?? 0,
				outputTokens: usage?.outputTokens ?? 0,
				totalTokens: stepTokens,
			})
			stepIndex++
		},
		onFinish: () => {
			logConversationComplete({
				totalSteps: stepIndex,
				totalTokens,
				durationMs: Date.now() - conversationStart,
				userId,
			})
		},
	})

	return result.toUIMessageStreamResponse()
}
