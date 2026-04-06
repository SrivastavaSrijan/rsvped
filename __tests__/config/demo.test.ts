import { describe, expect, it } from 'vitest'
import { DemoUser } from '@/lib/config/demo'

describe('DemoUser', () => {
	it('has a valid email format', () => {
		expect(DemoUser.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
	})

	it('has a password that meets strength requirements', () => {
		expect(DemoUser.password.length).toBeGreaterThanOrEqual(8)
		expect(DemoUser.password).toMatch(/[a-z]/)
		expect(DemoUser.password).toMatch(/[A-Z]/)
		expect(DemoUser.password).toMatch(/[0-9]/)
	})

	it('has a name of at least 2 characters', () => {
		expect(DemoUser.name.length).toBeGreaterThanOrEqual(2)
	})
})
