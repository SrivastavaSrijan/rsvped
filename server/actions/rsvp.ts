'use server'

import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { getAPI } from '@/server/api'
import { RsvpErrorCodes, type ServerActionResponse } from './types'

const rsvpSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	eventId: z.string(),
	ticketTierId: z.string(),
})

export type RsvpFormData = z.infer<typeof rsvpSchema>
export type RsvpActionResponse = ServerActionResponse<
	never,
	RsvpErrorCodes,
	RsvpFormData
>

export async function createRsvpAction(
	_prevState: RsvpActionResponse,
	formData: FormData
): Promise<RsvpActionResponse> {
	const rawData = Object.fromEntries(formData)

	const validation = rsvpSchema.safeParse(rawData)

	if (!validation.success) {
		return {
			success: false,
			error: RsvpErrorCodes.VALIDATION_ERROR,
			fieldErrors: validation.error.flatten().fieldErrors,
		}
	}

	try {
		const api = await getAPI()
		await api.rsvp.crud.create(validation.data)
		return { success: true }
	} catch (error) {
		if (error instanceof TRPCError) {
			switch (error.message) {
				case 'ALREADY_REGISTERED':
					return { success: false, error: RsvpErrorCodes.ALREADY_REGISTERED }
				case 'EVENT_FULL':
					return { success: false, error: RsvpErrorCodes.EVENT_FULL }
				case 'EVENT_NOT_FOUND':
					return { success: false, error: RsvpErrorCodes.UNEXPECTED_ERROR }
				default:
					return { success: false, error: RsvpErrorCodes.UNEXPECTED_ERROR }
			}
		}
		return { success: false, error: RsvpErrorCodes.UNEXPECTED_ERROR }
	}
}
