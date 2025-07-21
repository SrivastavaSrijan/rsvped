'use server'

import { Prisma } from '@prisma/client'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { signIn, signOut } from '@/lib/auth'
import { CookieNames, getAvatarURL, Routes } from '@/lib/config'
import { setEncryptedCookie } from '@/lib/cookies'
import { comparePasswords } from '@/lib/utils'
import { getAPI } from '@/server/api'
import { AuthActionErrorCodeMap } from './constants'
import { AuthErrorCodes, ServerActionResponse } from './types'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

const registrationSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  image: z.string().optional(),
})

export type AuthFormData = z.infer<typeof registrationSchema>
export type AuthActionResponse = ServerActionResponse<never, AuthErrorCodes, AuthFormData>

async function checkUserExists(email: string) {
  try {
    const api = await getAPI()
    const user = await api.user.findByEmail({ email })
    return user
  } catch {
    return null
  }
}

async function createUser(data: Prisma.UserCreateInput): Promise<void> {
  try {
    const api = await getAPI()
    const parsedData = registrationSchema.parse(data)
    await api.user.create(parsedData)
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
  try {
    await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    })
  } catch (error) {
    console.error(error)
    if (error instanceof AuthError && error.type === 'CredentialsSignin') {
      return {
        success: false,
        fieldErrors: { password: [AuthActionErrorCodeMap[AuthErrorCodes.INVALID_CREDENTIALS]] },
      }
    }
  }

  await setEncryptedCookie(CookieNames.RedirectTimeoutProps, {
    title: name || 'Hey there.',
    description: "Welcome to rsvp'd!",
    illustration: image,
  })

  const hasValidNext = next && (next.startsWith('/') || next.startsWith('http'))
  redirect(`${Routes.Utility.HoldOn}?next=${hasValidNext ? encodeURIComponent(next) : Routes.Home}`)
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
    return await performSignIn({ email, password }, { name, image: avatar }, next)
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
    await setEncryptedCookie(CookieNames.PrefillForm, { email, password })
    redirect(Routes.Auth.SignUp)
  }
  return await performSignIn({ email, password }, { name: user.name, image: user.image }, next)
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
    const user = await api.user.findByEmail({ email })
    if (!user || !user.password) return null

    const passwordsMatch = await comparePasswords(password, user.password)
    if (passwordsMatch) {
      return user
    }
  }
}
export const signInWithGoogle = async (next: string | null) => {
  await setEncryptedCookie(CookieNames.RedirectTimeoutProps, {
    title: 'Hey there.',
    description: "Welcome to rsvp'd!",
  })
  const hasValidNext = next && (next.startsWith('/') || next.startsWith('http'))
  const redirectTo = `${Routes.Utility.HoldOn}?next=${hasValidNext ? encodeURIComponent(next) : Routes.Home}`
  await signIn('google', { redirectTo })
}
