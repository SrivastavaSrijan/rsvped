'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Routes } from '@/lib/config'
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
			error: LocationUpdateActionErrorCode.SERVER_ERROR,
			fieldErrors: validation.error.flatten().fieldErrors,
		}
	}

	try {
		const api = await getAPI()
		await api.user.updateLocation(validation.data)
		revalidatePath(Routes.Home)
		return { success: true }
	} catch (error) {
		console.error('Error updating user location:', error)
		return {
			success: false,
			error: LocationUpdateActionErrorCode.SERVER_ERROR,
		}
	}
}
