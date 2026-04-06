'use server'

import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { CookieNames, Routes } from '@/lib/config'
import { setEncryptedCookie } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'
import { getAPI } from '@/server/api'
import {
	LocationUpdateActionErrorCode,
	type LocationUpdateActionResponse,
	type ProfileUpdateActionResponse,
	ProfileUpdateErrorCodes,
} from './types'

const updateLocationSchema = z.object({
	locationId: z.string().min(1, 'Location is required.'),
})

export type LocationFormData = z.infer<typeof updateLocationSchema>

export async function updateLocationAction(
	_: LocationUpdateActionResponse | null,
	formData: FormData
): Promise<LocationUpdateActionResponse> {
	const rawData = Object.fromEntries(formData)
	const validation = updateLocationSchema.safeParse(rawData)

	if (!validation.success) {
		return {
			success: false,
			error: LocationUpdateActionErrorCode.VALIDATION_ERROR,
			fieldErrors: validation.error.flatten().fieldErrors,
		}
	}

	const session = await auth()

	// Workflow for authenticated users
	if (session?.user) {
		try {
			const api = await getAPI()
			await api.user.preferences.updateLocation(validation.data)
		} catch (error) {
			console.error('Error updating user location in DB:', error)
			return {
				success: false,
				error: LocationUpdateActionErrorCode.SERVER_ERROR,
			}
		}
	} else {
		// Workflow for unauthenticated (guest) users
		await setEncryptedCookie<Partial<LocationFormData>>(
			CookieNames.PrefillLocation,
			validation.data
		)
	}

	// Revalidate the path for both user types and return success
	revalidatePath(Routes.Main.Events.Discover)
	return { success: true }
}

const usernameRegex = /^[a-z0-9_]{3,30}$/

const profileUpdateSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100),
	username: z
		.string()
		.min(3, 'Username must be at least 3 characters')
		.max(30, 'Username must be at most 30 characters')
		.regex(
			usernameRegex,
			'Username must be lowercase letters, numbers, or underscores'
		),
	bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
	profession: z.string().max(100).optional(),
	industry: z.string().max(100).optional(),
	experienceLevel: z
		.enum(['JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE', ''])
		.optional(),
	networkingStyle: z.enum(['ACTIVE', 'SELECTIVE', 'CASUAL', '']).optional(),
	locationId: z.string().optional(),
})

export async function updateProfileAction(
	_: ProfileUpdateActionResponse | null,
	formData: FormData
): Promise<ProfileUpdateActionResponse> {
	const session = await auth()
	if (!session?.user) {
		return {
			success: false,
			error: ProfileUpdateErrorCodes.UNAUTHORIZED,
		}
	}

	const rawData = Object.fromEntries(formData)
	const validation = profileUpdateSchema.safeParse(rawData)

	if (!validation.success) {
		return {
			success: false,
			error: ProfileUpdateErrorCodes.VALIDATION_ERROR,
			fieldErrors: validation.error.flatten().fieldErrors,
		}
	}

	const { experienceLevel, networkingStyle, locationId, bio, ...rest } =
		validation.data

	try {
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				...rest,
				bio: bio || null,
				experienceLevel: experienceLevel || null,
				networkingStyle: networkingStyle || null,
				locationId: locationId || null,
			},
		})
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2002'
		) {
			return {
				success: false,
				error: ProfileUpdateErrorCodes.USERNAME_TAKEN,
			}
		}
		return {
			success: false,
			error: ProfileUpdateErrorCodes.UNEXPECTED_ERROR,
		}
	}

	revalidatePath(Routes.Auth.Profile)
	revalidatePath(Routes.Main.Users.ViewByUsername(validation.data.username))
	return { success: true, data: { username: validation.data.username } }
}
