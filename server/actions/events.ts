'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createCaller } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  timezone: z.string().default('UTC'),
  locationType: z.enum(['PHYSICAL', 'ONLINE', 'HYBRID']),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  onlineUrl: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
})

export async function createEvent(formData: FormData) {
  try {
    // Parse form data
    const rawData = {
      title: formData.get('title') as string,
      subtitle: formData.get('subtitle') as string,
      description: formData.get('description') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      timezone: formData.get('timezone') as string,
      locationType: formData.get('locationType') as 'PHYSICAL' | 'ONLINE' | 'HYBRID',
      venueName: formData.get('venueName') as string,
      venueAddress: formData.get('venueAddress') as string,
      onlineUrl: formData.get('onlineUrl') as string,
      capacity: formData.get('capacity') as string,
    }

    // Validate data
    const validatedData = createEventSchema.parse(rawData)

    // Create tRPC context and caller
    const ctx = await createTRPCContext()
    const caller = createCaller(ctx)

    // Convert string dates to Date objects
    const eventData = {
      ...validatedData,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
    }

    // Create event via tRPC
    await caller.event.create(eventData)

    // Revalidate the page to show new event
    revalidatePath('/')
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}
