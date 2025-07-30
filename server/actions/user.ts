'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { CookieNames, Routes } from '@/lib/config'
import { setEncryptedCookie } from '@/lib/cookies'
import { getAPI } from '@/server/api'
import { LocationUpdateActionErrorCode, type LocationUpdateActionResponse } from './types'

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
			await api.user.updateLocation(validation.data)
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
