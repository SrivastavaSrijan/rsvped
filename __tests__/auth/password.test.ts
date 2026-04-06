import { describe, expect, it } from 'vitest'
import { comparePasswords, hashPassword } from '@/lib/auth/password'

describe('hashPassword', () => {
	it('returns a bcrypt hash', async () => {
		const hash = await hashPassword('TestPassword1')
		expect(hash).toBeDefined()
		expect(hash).not.toBe('TestPassword1')
		// bcrypt hashes start with $2a$ or $2b$
		expect(hash).toMatch(/^\$2[ab]\$/)
	})

	it('produces a different hash each time (salt)', async () => {
		const hash1 = await hashPassword('TestPassword1')
		const hash2 = await hashPassword('TestPassword1')
		expect(hash1).not.toBe(hash2)
	})
})

describe('comparePasswords', () => {
	it('returns true for correct password', async () => {
		const password = 'CorrectPassword1'
		const hash = await hashPassword(password)
		const result = await comparePasswords(password, hash)
		expect(result).toBe(true)
	})

	it('returns false for wrong password', async () => {
		const hash = await hashPassword('CorrectPassword1')
		const result = await comparePasswords('WrongPassword1', hash)
		expect(result).toBe(false)
	})
})
