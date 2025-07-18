/**
 * Centralized configuration for cookie names used throughout the application.
 * This ensures consistency and avoids magic strings.
 */
export const CookieNames = {
  /**
   * Stores temporary form state, e.g., when redirecting a user from a
   * login attempt to a registration form to pre-fill data.
   */
  PrefillForm: 'prefill-form',
  RedirectTimeoutProps: 'redirect-timeout-props',
} as const

export type CookieName = (typeof CookieNames)[keyof typeof CookieNames]
