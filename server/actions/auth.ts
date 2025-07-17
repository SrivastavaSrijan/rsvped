'use server'

import { Prisma } from '@prisma/client'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { signIn } from '@/lib/auth'
import { Routes } from '@/lib/config/routes'
import { getAPI } from '@/server/api'
import { AuthErrorCodes, ServerActionResponse } from './types'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

const registrationSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

export type AuthFormData = z.infer<typeof registrationSchema>
export type AuthActionResponse = ServerActionResponse<never, AuthErrorCodes, AuthFormData>

async function checkUserExists(email: string): Promise<boolean> {
  try {
    const api = await getAPI()
    await api.user.findByEmail({ email })
    return true
  } catch {
    return false
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

async function performSignIn(credentials: { email: string; password: string }) {
  try {
    await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    })
  } catch (error) {
    console.error(error)
    if (error instanceof AuthError && error.type === 'CredentialsSignin') {
      return { success: false, error: AuthErrorCodes.INVALID_CREDENTIALS }
    }
  }
  redirect(Routes.Home)
}

export async function authAction(
  _: AuthActionResponse | null,
  formData: FormData
): Promise<AuthActionResponse> {
  const rawData = Object.fromEntries(formData)
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

    await createUser({ email, name, password })
    return await performSignIn({ email, password })
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

  if (!(await checkUserExists(email))) {
    redirect(Routes.SignUp)
  }
  return await performSignIn({ email, password })
}
