'use server'
import { sealData, unsealData } from 'iron-session'
import { cookies } from 'next/headers'
import type { CookieName } from '@/lib/config'

const password = process.env.SECRET_COOKIE_PASSWORD as string
if (!password) {
	throw new Error(
		'SECRET_COOKIE_PASSWORD is not set. Please set it in your .env file (at least 32 characters long).'
	)
}

const defaultCookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	path: '/',
}

/**
 * Sets an encrypted, short-lived cookie.
 * @param name The name of the cookie from the `CookieNames` enum.
 * @param data The data to encrypt and store.
 * @param maxAge The cookie's max age in seconds. Defaults to 5 minutes.
 */
export async function setEncryptedCookie<T>(name: CookieName, data: T, maxAge: number = 60 * 5) {
	const cookieStore = await cookies()
	const encryptedData = await sealData(data, { password })
	cookieStore.set(name, encryptedData, { ...defaultCookieOptions, maxAge })
}

/**
 * Reads and immediately deletes an encrypted cookie.
 * @param name The name of the cookie from the `CookieNames` enum.
 * @returns The decrypted data or `null` if the cookie doesn't exist or is invalid.
 */
export async function getEncryptedCookie<T>(name: CookieName): Promise<T | null> {
	const cookieStore = await cookies()
	const cookieValue = cookieStore.get(name)?.value
	if (!cookieValue) {
		return null
	}

	try {
		const data = await unsealData<T>(cookieValue, { password })
		return data
	} catch (error) {
		console.error(`Failed to unseal cookie "${name}":`, error)
		return null
	}
}
