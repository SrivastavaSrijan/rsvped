import { TRPCError } from '@trpc/server'
import { TRPCErrorCodes } from './codes'
import { TRPCErrorMessages } from './messages'

/**
 * Maps our standardized error codes to tRPC error codes
 */
function mapToTRPCCode(code: TRPCErrorCodes): TRPCError['code'] {
	switch (code) {
		case TRPCErrorCodes.UNAUTHORIZED:
			return 'UNAUTHORIZED'
		case TRPCErrorCodes.FORBIDDEN:
			return 'FORBIDDEN'
		case TRPCErrorCodes.NOT_FOUND:
			return 'NOT_FOUND'
		case TRPCErrorCodes.ALREADY_EXISTS:
		case TRPCErrorCodes.ALREADY_REGISTERED:
		case TRPCErrorCodes.ALREADY_MEMBER:
			return 'CONFLICT'
		case TRPCErrorCodes.EVENT_FULL:
			return 'PRECONDITION_FAILED'
		case TRPCErrorCodes.VALIDATION_ERROR:
			return 'BAD_REQUEST'
		case TRPCErrorCodes.INTERNAL_ERROR:
		case TRPCErrorCodes.EXTERNAL_SERVICE_ERROR:
			return 'INTERNAL_SERVER_ERROR'
		default:
			return 'INTERNAL_SERVER_ERROR'
	}
}

/**
 * Throws a standardized tRPC error with consistent codes and messages
 */
export function throwTRPCError(
	code: TRPCErrorCodes,
	overrideMessage?: string
): never {
	throw new TRPCError({
		code: mapToTRPCCode(code),
		message: overrideMessage ?? TRPCErrorMessages[code],
	})
}

/**
 * Convenience functions for common error scenarios
 */
export const tRPCErrors = {
	unauthorized: (message?: string) =>
		throwTRPCError(TRPCErrorCodes.UNAUTHORIZED, message),
	forbidden: (message?: string) =>
		throwTRPCError(TRPCErrorCodes.FORBIDDEN, message),
	notFound: (resource?: string) =>
		throwTRPCError(
			TRPCErrorCodes.NOT_FOUND,
			resource ? `${resource} not found` : undefined
		),
	alreadyExists: (resource?: string) =>
		throwTRPCError(
			TRPCErrorCodes.ALREADY_EXISTS,
			resource ? `${resource} already exists` : undefined
		),
	eventFull: () => throwTRPCError(TRPCErrorCodes.EVENT_FULL),
	alreadyRegistered: () => throwTRPCError(TRPCErrorCodes.ALREADY_REGISTERED),
	alreadyMember: () => throwTRPCError(TRPCErrorCodes.ALREADY_MEMBER),
	validation: (message?: string) =>
		throwTRPCError(TRPCErrorCodes.VALIDATION_ERROR, message),
	internal: (message?: string) =>
		throwTRPCError(TRPCErrorCodes.INTERNAL_ERROR, message),
	external: (message?: string) =>
		throwTRPCError(TRPCErrorCodes.EXTERNAL_SERVICE_ERROR, message),
}
