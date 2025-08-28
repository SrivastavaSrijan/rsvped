/**
 * AI Router - tRPC endpoints for AI features
 */

import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const aiRouter = createTRPCRouter({
	getSuggestions: publicProcedure
		.input(
			z.object({
				prompt: z.string().min(1),
				context: z.record(z.string(), z.unknown()).optional(),
			})
		)
		.query(async ({ input }) => {
			// Simple mock suggestions for now - replace with actual AI logic
			const suggestions = [
				`${input.prompt} - Professional`,
				`${input.prompt} - Friendly`,
				`${input.prompt} - Brief`,
			].slice(0, 3)

			return suggestions
		}),
})
