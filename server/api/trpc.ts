import { initTRPC } from '@trpc/server'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { headers } from 'next/headers'
import type { Session } from 'next-auth'
import superjson from 'superjson'
import { ZodError } from 'zod'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TRPCErrors } from '@/server/api/shared/errors'

type CreateContextOptions = {
	session: Session | null
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
	return {
		session: opts.session,
		prisma,
	}
}

export const createTRPCContext = async (_opts?: CreateNextContextOptions) => {
	let session: Session | null = null
	try {
		headers()
		session = await auth()
	} catch {
		// headers() not available outside of request context
		session = null
	}

	return createInnerTRPCContext({
		session,
	})
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		}
	},
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
	if (!ctx.session || !ctx.session.user) {
		throw TRPCErrors.unauthorized()
	}
	return next({
		ctx: {
			// infers the `session` as non-nullable
			session: { ...ctx.session, user: ctx.session.user },
		},
	})
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
