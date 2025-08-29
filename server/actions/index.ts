import { AIErrorCodes } from './types'

export * from './auth'
export * from './constants'
export * from './events'
export * from './membership'
export * from './rsvp'
export * from './user'

// AI Action Error Maps
export const AIActionErrorCodeMap = {
	[AIErrorCodes.INVALID_INPUT]: 'Please check your input and try again.',
	[AIErrorCodes.AI_UNAVAILABLE]:
		'AI service is temporarily unavailable. Please try again later.',
	[AIErrorCodes.SERVER_ERROR]: 'Something went wrong. Please try again.',
	[AIErrorCodes.INVALID_TYPE]: 'Invalid enhancement type.',
	[AIErrorCodes.GENERATION_FAILED]:
		'Failed to generate content. Please try again.',
}
