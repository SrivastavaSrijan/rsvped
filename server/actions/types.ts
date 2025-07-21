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
  REGISTRATION_REQUIRED = 'RegistrationRequired',
  INVALID_CREDENTIALS = 'InvalidCredentials',
  REGISTRATION_FAILED = 'RegistrationFailed',
  VALIDATION_ERROR = 'ValidationError',
  UNEXPECTED_ERROR = 'UnexpectedError',
  ALREADY_LOGGED_IN = 'AlreadyLoggedIn',
  USER_ALREADY_EXISTS = 'UserAlreadyExists',
  OAUTH_ACCOUNT_NOT_LINKED = 'OAuthAccountNotLinked',
}
