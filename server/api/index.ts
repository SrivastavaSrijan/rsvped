import { createCaller } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

/**
 * Server-side API helper for RSC and Server Actions
 * Simplifies the tRPC caller pattern
 */
export async function getAPI() {
	const ctx = await createTRPCContext()
	return createCaller(ctx)
}
