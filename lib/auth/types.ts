import type { UserRole } from '@prisma/client'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			role: UserRole
			isDemo: boolean
			username: string | null
		} & DefaultSession['user']
	}

	interface JWT {
		id: string
		role: UserRole
		isDemo: boolean
		username: string | null
	}
}
