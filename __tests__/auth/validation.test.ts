import { describe, expect, it } from 'vitest'
import {
	loginSchema,
	passwordSchema,
	registrationSchema,
} from '@/server/actions/auth.schemas'

describe('passwordSchema', () => {
	it('accepts a valid password', () => {
		const result = passwordSchema.safeParse('StrongPass1')
		expect(result.success).toBe(true)
	})

	it('rejects password shorter than 8 characters', () => {
		const result = passwordSchema.safeParse('Short1A')
		expect(result.success).toBe(false)
	})

	it('rejects password without uppercase letter', () => {
		const result = passwordSchema.safeParse('alllowercase1')
		expect(result.success).toBe(false)
	})

	it('rejects password without number', () => {
		const result = passwordSchema.safeParse('NoNumberHere')
		expect(result.success).toBe(false)
	})
})

describe('registrationSchema', () => {
	const validData = {
		email: 'test@example.com',
		password: 'ValidPass1',
		name: 'Test User',
	}

	it('accepts valid registration data', () => {
		const result = registrationSchema.safeParse(validData)
		expect(result.success).toBe(true)
	})

	it('rejects invalid email', () => {
		const result = registrationSchema.safeParse({
			...validData,
			email: 'not-an-email',
		})
		expect(result.success).toBe(false)
	})

	it('rejects name shorter than 2 characters', () => {
		const result = registrationSchema.safeParse({
			...validData,
			name: 'A',
		})
		expect(result.success).toBe(false)
	})

	it('rejects weak password', () => {
		const result = registrationSchema.safeParse({
			...validData,
			password: 'weak',
		})
		expect(result.success).toBe(false)
	})
})

describe('loginSchema', () => {
	it('accepts valid login data', () => {
		const result = loginSchema.safeParse({
			email: 'user@example.com',
			password: 'any',
		})
		expect(result.success).toBe(true)
	})

	it('accepts weak password (login does not enforce strength)', () => {
		const result = loginSchema.safeParse({
			email: 'user@example.com',
			password: 'a',
		})
		expect(result.success).toBe(true)
	})

	it('rejects invalid email', () => {
		const result = loginSchema.safeParse({
			email: 'bad-email',
			password: 'anything',
		})
		expect(result.success).toBe(false)
	})

	it('rejects empty password', () => {
		const result = loginSchema.safeParse({
			email: 'user@example.com',
			password: '',
		})
		expect(result.success).toBe(false)
	})
})
