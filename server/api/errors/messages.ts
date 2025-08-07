import { TRPCErrorCodes } from './codes'

export const TRPCErrorMessages: Record<TRPCErrorCodes, string> = {
	[TRPCErrorCodes.UNAUTHORIZED]:
		'You must be logged in to perform this action.',
	[TRPCErrorCodes.FORBIDDEN]:
		'You do not have permission to perform this action.',
	[TRPCErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
	[TRPCErrorCodes.ALREADY_EXISTS]:
		'A resource with these details already exists.',
	[TRPCErrorCodes.EVENT_FULL]: 'This event is full.',
	[TRPCErrorCodes.ALREADY_REGISTERED]:
		'You have already registered for this event.',
	[TRPCErrorCodes.ALREADY_MEMBER]:
		'You are already a member of this community.',
	[TRPCErrorCodes.VALIDATION_ERROR]: 'Please check the fields and try again.',
	[TRPCErrorCodes.INTERNAL_ERROR]:
		'An unexpected error occurred. Please try again later.',
	[TRPCErrorCodes.EXTERNAL_SERVICE_ERROR]:
		'External service is unavailable. Please try again later.',
}
