export type ServerActionResponse<
	TData = unknown,
	TError = string,
	TFormData = Record<string, unknown>,
> = {
	success: boolean
	data?: TData
	message?: string
	error?: TError
	fieldErrors?: Partial<Record<keyof TFormData, string[]>>
}

export enum AuthErrorCodes {
	REGISTRATION_REQUIRED = 'REGISTRATION_REQUIRED',
	INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
	REGISTRATION_FAILED = 'REGISTRATION_FAILED',
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
	USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
	ALREADY_LOGGED_IN = 'ALREADY_LOGGED_IN',
	OAUTH_ACCOUNT_NOT_LINKED = 'OAUTH_ACCOUNT_NOT_LINKED',
}

export enum EventErrorCodes {
	UNAUTHORIZED = 'UNAUTHORIZED',
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
	CREATION_FAILED = 'CREATION_FAILED',
	UPDATE_FAILED = 'UPDATE_FAILED',
	NOT_FOUND = 'NOT_FOUND',
}

export enum RsvpErrorCodes {
	ALREADY_REGISTERED = 'ALREADY_REGISTERED',
	EVENT_FULL = 'EVENT_FULL',
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

export enum LocationUpdateActionErrorCode {
	SERVER_ERROR = 'SERVER_ERROR',
	FORBIDDEN = 'FORBIDDEN',
	VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export type LocationFormData = {
	locationId: string
}

export type LocationUpdateActionResponse = ServerActionResponse<
	never,
	LocationUpdateActionErrorCode,
	LocationFormData
>
