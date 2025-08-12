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

// Pagination metadata for responses
export interface PaginationMetadata {
	page: number
	size: number
	total: number
	totalPages: number
	hasMore: boolean
	hasPrevious: boolean
}

// Generic paginated response structure
export interface PaginatedResponse<T> {
	data: T[]
	pagination: PaginationMetadata
}

// Helper types for extracting data from paginated responses
export type ExtractPaginatedData<T> = T extends PaginatedResponse<infer U>
	? U
	: never

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
