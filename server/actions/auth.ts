'use server'

import type { Prisma } from '@prisma/client'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { signIn, signOut } from '@/lib/auth'
import { comparePasswords } from '@/lib/auth/password'
import { CookieNames, DemoUser, getAvatarURL, Routes } from '@/lib/config'
import { setEncryptedCookie } from '@/lib/cookies'
import { getAPI } from '@/server/api'
import { loginSchema, registrationSchema } from './auth.schemas'
import { AuthActionErrorCodeMap } from './constants'
import { AuthErrorCodes, type ServerActionResponse } from './types'

const DefaultNextRoute = Routes.Main.Events.Home

export type AuthFormData = z.infer<typeof registrationSchema>
export type AuthActionResponse = ServerActionResponse<
	never,
	AuthErrorCodes,
	AuthFormData
>

async function checkUserExists(email: string) {
	try {
		const api = await getAPI()
		const user = await api.user.profile.findByEmail({ email })
		return user
	} catch {
		return null
	}
}

async function createUser(data: Prisma.UserCreateInput): Promise<void> {
	try {
		const api = await getAPI()
		const parsedData = registrationSchema.parse(data)
		await api.user.auth.create(parsedData)
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new Error(AuthErrorCodes.VALIDATION_ERROR)
		}
		throw new Error(AuthErrorCodes.UNEXPECTED_ERROR)
	}
}

async function performSignIn(
	credentials: {
		email: string
		password: string
	},
	{ name, image }: { name: string | null; image: string | null },
	next?: string | null
): Promise<AuthActionResponse> {
	let signInError: AuthError | null = null

	try {
		await signIn('credentials', {
			email: credentials.email,
			password: credentials.password,
			redirect: false,
		})
	} catch (error) {
		if (error instanceof AuthError && error.type === 'CredentialsSignin') {
			signInError = error
		} else {
			throw error // Re-throw redirect errors and unexpected errors
		}
	}

	if (signInError) {
		return {
			success: false,
			fieldErrors: {
				password: [AuthActionErrorCodeMap[AuthErrorCodes.INVALID_CREDENTIALS]],
			},
		}
	}

	await setEncryptedCookie(CookieNames.RedirectTimeoutProps, {
		title: name || 'Hey there.',
		description: "Welcome to RSVP'd!",
		illustration: image,
	})

	const nextRoute =
		next && next.startsWith('/') && !next.startsWith('//')
			? encodeURIComponent(next)
			: DefaultNextRoute
	redirect(`${Routes.Utility.HoldOn}?next=${nextRoute}`)
}

export async function authAction(
	_: AuthActionResponse | null,
	formData: FormData
): Promise<AuthActionResponse> {
	const rawData = Object.fromEntries(formData)
	const next = formData.get('next') as string | null
	const isRegistrationAttempt = !!rawData.name

	if (isRegistrationAttempt) {
		// --- Path A: Full Registration Attempt ---
		const validation = registrationSchema.safeParse(rawData)
		if (!validation.success) {
			return {
				success: false,
				error: AuthErrorCodes.VALIDATION_ERROR,
				fieldErrors: validation.error.flatten().fieldErrors,
			}
		}
		const { email, name, password } = validation.data

		if (await checkUserExists(email)) {
			return { success: false, error: AuthErrorCodes.USER_ALREADY_EXISTS }
		}
		const avatar = getAvatarURL(name)

		await createUser({ email, name, password, image: avatar })
		return await performSignIn(
			{ email, password },
			{ name, image: avatar },
			next
		)
	}
	// --- Path B: Login Attempt ---
	const validation = loginSchema.safeParse(rawData)
	if (!validation.success) {
		return {
			success: false,
			error: AuthErrorCodes.VALIDATION_ERROR,
			fieldErrors: validation.error.flatten().fieldErrors,
		}
	}
	const { email, password } = validation.data
	const user = await checkUserExists(email)
	if (!user) {
		// Set form data in a temporary, encrypted cookie
		await setEncryptedCookie(CookieNames.PrefillForm, { email })
		redirect(Routes.Auth.SignUp)
	}
	return await performSignIn(
		{ email, password },
		{ name: user.name, image: user.image },
		next
	)
}

export async function signOutAction(): Promise<void> {
	try {
		await signOut({ redirect: false })
	} catch (error) {
		console.error('Sign out failed:', error)
	}

	await setEncryptedCookie(CookieNames.RedirectTimeoutProps, {
		title: 'See you soon.',
		description: 'Logging you out...',
	})
	redirect(`${Routes.Utility.HoldOn}?next=${encodeURIComponent(Routes.Home)}`)
}

export const verifyPassword = async ({
	email,
	password,
}: Partial<Record<'email' | 'password', unknown>>) => {
	const parsedCredentials = loginSchema.safeParse({ email, password })
	const api = await getAPI()

	if (parsedCredentials.success) {
		const { email, password } = parsedCredentials.data
		const user = await api.user.profile.findByEmail({ email })
		if (!user || !user.password) return null

		const passwordsMatch = await comparePasswords(password, user.password)
		if (passwordsMatch) {
			return user
		}
	}

	return null
}
export const signInWithGoogle = async (next: string | null) => {
	await setEncryptedCookie(CookieNames.RedirectTimeoutProps, {
		title: 'Hey there.',
		description: "Welcome to RSVP'd!",
	})
	const nextRoute =
		next && next.startsWith('/') && !next.startsWith('//')
			? encodeURIComponent(next)
			: DefaultNextRoute
	const redirectTo = `${Routes.Utility.HoldOn}?next=${nextRoute}`
	await signIn('google', { redirectTo })
}

export async function signInAsDemo(): Promise<void> {
	let signInError: AuthError | null = null

	try {
		await signIn('credentials', {
			email: DemoUser.email,
			password: DemoUser.password,
			redirect: false,
		})
	} catch (error) {
		if (error instanceof AuthError && error.type === 'CredentialsSignin') {
			signInError = error
		} else {
			throw error
		}
	}

	// redirect() throws internally — must be outside try/catch
	if (signInError) {
		redirect(
			`${Routes.Auth.SignIn}?error=${AuthErrorCodes.INVALID_CREDENTIALS}`
		)
	}

	await setEncryptedCookie(CookieNames.RedirectTimeoutProps, {
		title: `Welcome, ${DemoUser.name}!`,
		description: "You're exploring RSVP'd as a demo user.",
	})

	redirect(
		`${Routes.Utility.HoldOn}?next=${encodeURIComponent(DefaultNextRoute)}`
	)
}
