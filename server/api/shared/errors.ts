import { TRPCError } from '@trpc/server'

// Standard error codes used across tRPC routers
export enum TRPCErrorCode {
	// Resource errors
	NOT_FOUND = 'NOT_FOUND',
	ALREADY_EXISTS = 'CONFLICT',

	// Authentication/Authorization errors
	UNAUTHORIZED = 'UNAUTHORIZED',
	FORBIDDEN = 'FORBIDDEN',

	// Validation errors
	BAD_REQUEST = 'BAD_REQUEST',
	VALIDATION_ERROR = 'BAD_REQUEST',

	// Server errors
	INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

// Standard error messages for common scenarios
export const TRPCErrorMessages = {
	// Resource not found errors
	EVENT_NOT_FOUND: 'Event not found',
	COMMUNITY_NOT_FOUND: 'Community not found',
	USER_NOT_FOUND: 'User not found',
	LOCATION_NOT_FOUND: 'Location not found',
	CATEGORY_NOT_FOUND: 'Category not found',

	// Already exists errors
	USER_ALREADY_EXISTS: 'User already exists',
	COMMUNITY_ALREADY_MEMBER: 'Already a member of this community',
	RSVP_ALREADY_EXISTS: 'You have already registered for this event',

	// Authentication/Authorization errors
	LOGIN_REQUIRED: 'You must be logged in to perform this action',
	UNAUTHORIZED_ACTION: 'You are not authorized to perform this action',
	FORBIDDEN_ACCESS: 'Access denied',
	EVENT_EDIT_FORBIDDEN: 'You are not authorized to edit this event',

	// Validation errors
	LOCATION_REQUIRED: 'Location is required',
	INVALID_INPUT: 'Invalid input provided',

	// Resource-specific errors
	EVENT_FULL: 'This event is full',
	NO_NEARBY_EVENTS: 'No nearby events found',
	NO_NEARBY_COMMUNITIES: 'No nearby communities found',

	// Server errors
	INTERNAL_ERROR: 'An internal server error occurred',
	EVENT_CREATE_FAILED: 'Failed to create event',
	EVENT_UPDATE_FAILED: 'Failed to update event',
} as const

// Helper function to create standardized tRPC errors
export function createTRPCError(
	code: keyof typeof TRPCErrorCode,
	message: keyof typeof TRPCErrorMessages
): TRPCError {
	return new TRPCError({
		code: TRPCErrorCode[code],
		message: TRPCErrorMessages[message],
	})
}

// Common error creators for frequently used scenarios
export const TRPCErrors = {
	eventNotFound: () => createTRPCError('NOT_FOUND', 'EVENT_NOT_FOUND'),
	communityNotFound: () => createTRPCError('NOT_FOUND', 'COMMUNITY_NOT_FOUND'),
	userNotFound: () => createTRPCError('NOT_FOUND', 'USER_NOT_FOUND'),
	locationNotFound: () => createTRPCError('NOT_FOUND', 'LOCATION_NOT_FOUND'),
	categoryNotFound: () => createTRPCError('NOT_FOUND', 'CATEGORY_NOT_FOUND'),

	unauthorized: () => createTRPCError('UNAUTHORIZED', 'LOGIN_REQUIRED'),
	forbidden: () => createTRPCError('FORBIDDEN', 'UNAUTHORIZED_ACTION'),
	eventEditForbidden: () =>
		createTRPCError('FORBIDDEN', 'EVENT_EDIT_FORBIDDEN'),

	alreadyMember: () =>
		createTRPCError('ALREADY_EXISTS', 'COMMUNITY_ALREADY_MEMBER'),
	alreadyRegistered: () =>
		createTRPCError('ALREADY_EXISTS', 'RSVP_ALREADY_EXISTS'),
	userAlreadyExists: () =>
		createTRPCError('ALREADY_EXISTS', 'USER_ALREADY_EXISTS'),

	locationRequired: () => createTRPCError('BAD_REQUEST', 'LOCATION_REQUIRED'),
	eventFull: () => createTRPCError('BAD_REQUEST', 'EVENT_FULL'),

	noNearbyEvents: () => createTRPCError('NOT_FOUND', 'NO_NEARBY_EVENTS'),
	noNearbyCommunities: () =>
		createTRPCError('NOT_FOUND', 'NO_NEARBY_COMMUNITIES'),

	internal: () => createTRPCError('INTERNAL_SERVER_ERROR', 'INTERNAL_ERROR'),
	eventCreateFailed: () =>
		createTRPCError('INTERNAL_SERVER_ERROR', 'EVENT_CREATE_FAILED'),
	eventUpdateFailed: () =>
		createTRPCError('INTERNAL_SERVER_ERROR', 'EVENT_UPDATE_FAILED'),
}
