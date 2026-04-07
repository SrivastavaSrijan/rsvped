import { convertToModelMessages, stepCountIs, streamText } from 'ai'
import { getModel } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import {
	getStirSystemPrompt,
	STIR_ANON_CONTEXT,
	STIR_MAX_STEPS,
	STIR_USER_CONTEXT_PREFIX,
} from './constants'
import { logConversationComplete, logStepComplete, logToolCall } from './logger'
import {
	getCategories,
	getEventDetails,
	searchCommunities,
	searchEvents,
} from './tools'
import type { StirStreamOptions } from './types'

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
						`Description: ${community.description.slice(0, 200)}`
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

	// Add user context
	if (userId) {
		parts.push(`${STIR_USER_CONTEXT_PREFIX}${userId}. The user is logged in.`)
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
	const system = await buildSystemPrompt(pageContext, userId)
	const conversationStart = Date.now()
	let stepIndex = 0
	let totalTokens = 0

	const result = streamText({
		model: getModel(),
		system,
		messages: await convertToModelMessages(messages),
		tools: {
			searchEvents,
			searchCommunities,
			getEventDetails,
			getCategories,
		},
		stopWhen: stepCountIs(STIR_MAX_STEPS),
		onStepFinish: ({ usage, toolResults }) => {
			// Log individual tool calls with timing
			if (toolResults) {
				for (const toolResult of toolResults) {
					const resultData = (toolResult as Record<string, unknown>)
						.result as unknown
					const toolArgs = (toolResult as Record<string, unknown>).args as
						| Record<string, unknown>
						| undefined
					const resultCount = Array.isArray(resultData)
						? resultData.length
						: undefined
					const error =
						resultData &&
						typeof resultData === 'object' &&
						'error' in resultData
							? String((resultData as Record<string, unknown>).error)
							: undefined

					logToolCall({
						toolName: toolResult.toolName,
						args: toolArgs ?? {},
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
