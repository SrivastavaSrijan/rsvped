'use server'

import { LocationType } from '@prisma/client'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'
import type { RouterOutput } from '../api/root'
import { EventErrorCodes, type ServerActionResponse } from './types'

const eventSchema = z
	.object({
		slug: z.string().optional(), // Only provided for updates
		title: z.string().min(1, 'Title is required.'),
		startDate: z.string().transform((val) => new Date(val)),
		endDate: z.string().transform((val) => new Date(val)),
		timezone: z.string().min(1, 'Timezone is required.'),
		locationType: z.nativeEnum(LocationType),
		venueName: z.string().optional(),
		venueAddress: z.string().optional(),
		onlineUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
		description: z.string().optional(),
		requiresApproval: z.boolean().optional(),
		capacity: z
			.string()
			.transform((val) => (val ? parseInt(val, 10) : undefined))
			.optional(),
		coverImage: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.startDate >= data.endDate) {
				return false
			}
			return true
		},
		{
			message: 'End date must be after start date.',
			path: ['endDate'],
		}
	)
	.refine(
		(data) => {
			if (data.locationType === LocationType.PHYSICAL && !data.venueName) {
				return false
			}
			return true
		},
		{
			message: 'Venue name is required for physical events.',
			path: ['venueName'],
		}
	)
	.refine(
		(data) => {
			if (
				(data.locationType === LocationType.ONLINE || data.locationType === LocationType.HYBRID) &&
				!data.onlineUrl
			) {
				return false
			}
			return true
		},
		{
			message: 'Online URL is required for online/hybrid events.',
			path: ['onlineUrl'],
		}
	)

export type EventFormData = z.infer<typeof eventSchema>
type EventData = RouterOutput['event']['create'] | RouterOutput['event']['update']
export type EventActionResponse = ServerActionResponse<EventData, EventErrorCodes, EventFormData>

export async function saveEvent(
	_: EventActionResponse | null,
	formData: FormData
): Promise<EventActionResponse> {
	const data = Object.fromEntries(formData.entries())
	const transformedData = {
		...data,
		requiresApproval: data.requiresApproval === 'true',
	}

	const validation = eventSchema.safeParse(transformedData)
	if (!validation.success) {
		return {
			success: false,
			error: EventErrorCodes.VALIDATION_ERROR,
			fieldErrors: validation.error.flatten().fieldErrors,
		}
	}

	const isUpdate = Boolean(validation.data.slug)

	let event: EventActionResponse['data']
	try {
		const api = await getAPI()
		if (isUpdate && validation.data.slug) {
			// For updates, slug is guaranteed to exist
			event = await api.event.update({
				...validation.data,
				slug: validation.data.slug,
			})
		} else {
			// For creates, remove slug from data
			const { slug: _, ...createData } = validation.data
			event = await api.event.create(createData)
		}
	} catch (error) {
		console.error(`Error ${isUpdate ? 'updating' : 'creating'} event:`, error)
		if (error && typeof error === 'object' && 'code' in error) {
			if (error.code === 'UNAUTHORIZED') {
				return { success: false, error: EventErrorCodes.UNAUTHORIZED }
			}
			if (error.code === 'NOT_FOUND') {
				return { success: false, error: EventErrorCodes.NOT_FOUND }
			}
			if (error.code === 'BAD_REQUEST') {
				return { success: false, error: EventErrorCodes.VALIDATION_ERROR }
			}
		}
		return {
			success: false,
			error: isUpdate ? EventErrorCodes.UPDATE_FAILED : EventErrorCodes.CREATION_FAILED,
		}
	}
	const next = formData.get('next') as string | null
	const hasValidNext = next && (next.startsWith('/') || next.startsWith('http'))
	if (event) {
		redirect(hasValidNext ? next : Routes.Main.Events.ManageBySlug(event.slug))
	}
	return {
		success: true,
		data: event,
		message: `Event ${isUpdate ? 'updated' : 'created'} successfully.`,
	}
}
