'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { CacheTags, CookieNames } from '@/lib/config'
import { setEncryptedCookie } from '@/lib/cookies'
import { getAPI } from '@/server/api'
import {
	LocationUpdateActionErrorCode,
	type LocationUpdateActionResponse,
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

	// Revalidate caches and return success
	revalidateTag(CacheTags.Location.List)
	revalidateTag(CacheTags.Event.Nearby(validation.data.locationId))
	if (session?.user?.id) {
		revalidateTag(CacheTags.User.Get(session.user.id))
	}
	return { success: true }
}
