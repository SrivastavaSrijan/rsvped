import type { MembershipRole } from '@prisma/client'
import type { z } from 'zod'
import type { PaginationSchema } from './schemas'

export type PaginationInput = z.infer<typeof PaginationSchema>

export enum MembershipRoleOwner {
	OWNER = 'OWNER',
}

export type CombinedMembershipRole = MembershipRole | MembershipRoleOwner
export enum EventTimeFrame {
	UPCOMING = 'upcoming',
	PAST = 'past',
}
export enum SortDirection {
	ASC = 'asc',
	DESC = 'desc',
}
export interface EventListSearchParams {
	period?: EventTimeFrame
	on?: string
	after?: string
	before?: string
	page?: string
	size?: string
}

export interface CommunityListSearchParams {
	period?: EventTimeFrame

	page?: string
	size?: string
}
