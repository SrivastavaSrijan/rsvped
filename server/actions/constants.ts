import {
	AuthErrorCodes,
	EventErrorCodes,
	LocationUpdateActionErrorCode,
	RsvpErrorCodes,
} from './types'

export const AuthActionErrorCodeMap: Record<AuthErrorCodes, string> = {
	[AuthErrorCodes.REGISTRATION_REQUIRED]: 'Please sign in to continue.',
	[AuthErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password.',
	[AuthErrorCodes.REGISTRATION_FAILED]: 'Registration failed. Please try again.',
	[AuthErrorCodes.VALIDATION_ERROR]: 'Please fix the errors in the form.',
	[AuthErrorCodes.UNEXPECTED_ERROR]: 'An unexpected error occurred. Please try again later.',
	[AuthErrorCodes.USER_ALREADY_EXISTS]: 'An account with this email already exists.',
	[AuthErrorCodes.ALREADY_LOGGED_IN]: 'You are already logged in.',
	[AuthErrorCodes.OAUTH_ACCOUNT_NOT_LINKED]:
		'Your OAuth account is not linked. Please sign in with your credentials first.',
}

export const EventActionErrorCodeMap: Record<EventErrorCodes, string> = {
	[EventErrorCodes.VALIDATION_ERROR]: 'Please fix the errors in the form.',
	[EventErrorCodes.UNEXPECTED_ERROR]: 'An unexpected error occurred. Please try again later.',
	[EventErrorCodes.CREATION_FAILED]: 'Failed to create the event. Please try again.',
	[EventErrorCodes.UPDATE_FAILED]: 'Failed to update the event. Please try again.',
	[EventErrorCodes.NOT_FOUND]: 'Event not found.',
	[EventErrorCodes.UNAUTHORIZED]: 'You are not authorized to perform this action.',
}

export const RsvpActionErrorCodeMap: Record<RsvpErrorCodes, string> = {
	[RsvpErrorCodes.ALREADY_REGISTERED]: 'You have already registered for this event.',
	[RsvpErrorCodes.EVENT_FULL]: 'This event is full.',
	[RsvpErrorCodes.VALIDATION_ERROR]: 'Please check the fields and try again.',
	[RsvpErrorCodes.UNEXPECTED_ERROR]: 'An unexpected error occurred. Please try again.',
}

export const LocationActionErrorCodeMap: Record<LocationUpdateActionErrorCode, string> = {
	[LocationUpdateActionErrorCode.SERVER_ERROR]: 'An unexpected error occurred. Please try again.',
	[LocationUpdateActionErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
	[LocationUpdateActionErrorCode.VALIDATION_ERROR]: 'Please check the fields and try again.',
}
