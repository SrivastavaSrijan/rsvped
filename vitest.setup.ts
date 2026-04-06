// Global test setup for Vitest
// Add shared mocks, cleanup, or test database setup here

import { afterEach, vi } from 'vitest'

// Mock next/headers — not available in Vitest's node environment
vi.mock('next/headers', () => ({
	headers: () => new Map(),
	cookies: () => ({ get: () => null, set: () => {} }),
}))

// Mock @/lib/auth — NextAuth depends on next/server internals
vi.mock('@/lib/auth', () => ({
	auth: vi.fn().mockResolvedValue(null),
	signIn: vi.fn(),
	signOut: vi.fn(),
	handlers: {},
}))

// Mock @sentry/nextjs — not needed in tests
vi.mock('@sentry/nextjs', () => ({
	init: vi.fn(),
	trpcMiddleware: () =>
		vi.fn(({ next }: { next: () => unknown }) => next()),
	captureException: vi.fn(),
	withServerActionInstrumentation: vi.fn(
		(_name: string, fn: () => unknown) => fn()
	),
}))

afterEach(() => {
	// Reset any global state between tests
})
