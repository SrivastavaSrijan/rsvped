import type { MembershipRole } from '@prisma/client'
import type { z } from 'zod'
import type { PaginationSchema } from './schemas'

export type PaginationInput = z.infer<typeof PaginationSchema>

export enum MembershipRoleOwner {
	OWNER = 'OWNER',
}

export type CombinedMembershipRole = MembershipRole | MembershipRoleOwner
