'use server'

import { LocationType } from '@prisma/client'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'
import { RouterOutput } from '../api/root'
import { EventErrorCodes, ServerActionResponse } from './types'

const createEventSchema = z
  .object({
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
    isPaid: z.boolean().optional(),
    ticketPrice: z
      .string()
      .transform((val) => (val ? parseFloat(val) : undefined))
      .optional(),
    ticketCurrency: z.string().optional(),
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
  .refine(
    (data) => {
      if (data.isPaid && !data.ticketPrice) {
        return false
      }
      return true
    },
    {
      message: 'Price is required for paid events.',
      path: ['ticketPrice'],
    }
  )

export type EventFormData = z.infer<typeof createEventSchema>
type CreateEventData = RouterOutput['event']['create']
export type EventActionResponse = ServerActionResponse<
  CreateEventData,
  EventErrorCodes,
  EventFormData
>

export async function createEvent(
  _: EventActionResponse | null,
  formData: FormData
): Promise<EventActionResponse> {
  const data = Object.fromEntries(formData.entries())

  // Transform form data to proper types
  const transformedData = {
    ...data,
    requiresApproval: data.requiresApproval === 'on',
    isPaid: data.isPaid === 'on',
  }

  const validation = createEventSchema.safeParse(transformedData)

  if (!validation.success) {
    return {
      success: false,
      error: EventErrorCodes.VALIDATION_ERROR,
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }
  let event: EventActionResponse['data']
  try {
    const api = await getAPI()
    event = await api.event.create(validation.data)
  } catch (error) {
    console.error('Error creating event:', error)

    // Handle specific tRPC errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'UNAUTHORIZED') {
        return {
          success: false,
          error: EventErrorCodes.UNAUTHORIZED,
        }
      }
      if (error.code === 'BAD_REQUEST') {
        return {
          success: false,
          error: EventErrorCodes.VALIDATION_ERROR,
        }
      }
    }

    return {
      success: false,
      error: EventErrorCodes.CREATION_FAILED,
    }
  }
  if (event) {
    redirect(`${Routes.Main.Events.Root}/${event.slug}`)
  }
  return {
    success: true,
    data: event,
    message: 'Event created successfully.',
  }
}
