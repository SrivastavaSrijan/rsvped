import { AuthErrorCodes } from './types'

export const AuthActionErrorCodeMap: Record<AuthErrorCodes, string> = {
  [AuthErrorCodes.REGISTRATION_REQUIRED]: 'Please sign in to continue.',
  [AuthErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [AuthErrorCodes.REGISTRATION_FAILED]: 'Registration failed. Please try again.',
  [AuthErrorCodes.VALIDATION_ERROR]: 'Please fix the errors in the form.',
  [AuthErrorCodes.UNEXPECTED_ERROR]: 'An unexpected error occurred. Please try again later.',
}
