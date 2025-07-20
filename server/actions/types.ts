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
  ALREADY_LOGGED_IN = 'ALREADY_LOGGED_IN',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  OAUTH_ACCOUNT_NOT_LINKED = 'OAUTH_ACCOUNT_NOT_LINKED',
}
