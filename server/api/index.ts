import { createTRPCContext } from '@/server/api/trpc'
import { createCaller } from './root'

/**
 * Server-side API helper for RSC and Server Actions
 * Simplifies the tRPC caller pattern
 */
export async function getAPI() {
	const ctx = await createTRPCContext()
	return createCaller(ctx)
}

export { RouterInput, RouterOutput } from './root'
