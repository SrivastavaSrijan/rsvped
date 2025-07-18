import { AuthErrorCodes } from './types'

export const AuthActionErrorCodeMap: Record<AuthErrorCodes, string> = {
  [AuthErrorCodes.REGISTRATION_REQUIRED]: 'Please sign in to continue.',
  [AuthErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [AuthErrorCodes.REGISTRATION_FAILED]: 'Registration failed. Please try again.',
  [AuthErrorCodes.VALIDATION_ERROR]: 'Please fix the errors in the form.',
  [AuthErrorCodes.UNEXPECTED_ERROR]: 'An unexpected error occurred. Please try again later.',
  [AuthErrorCodes.USER_ALREADY_EXISTS]: 'An account with this email already exists.',
  [AuthErrorCodes.ALREADY_LOGGED_IN]: 'You are already logged in.',
}
