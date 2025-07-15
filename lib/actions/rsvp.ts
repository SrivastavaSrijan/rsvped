'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const rsvpSchema = z.object({
  eventId: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  ticketTierId: z.string(),
})

export async function createRsvpAction(formData: FormData) {
  const rawData = {
    eventId: formData.get('eventId'),
    name: formData.get('name'),
    email: formData.get('email'),
    ticketTierId: formData.get('ticketTierId'),
  }

  const validatedData = rsvpSchema.parse(rawData)

  try {
    // Check if RSVP already exists
    const existingRsvp = await prisma.rSVP.findUnique({
      where: {
        eventId_email: {
          eventId: validatedData.eventId,
          email: validatedData.email,
        },
      },
    })

    if (existingRsvp) {
      throw new Error("You have already RSVP'd to this event")
    }

    // Check event capacity
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId },
      include: {
        _count: {
          select: { rsvps: true },
        },
      },
    })

    if (!event) {
      throw new Error('Event not found')
    }

    if (event.capacity && event._count.rsvps >= event.capacity) {
      throw new Error('Event is at capacity')
    }

    // Create RSVP
    const rsvp = await prisma.rSVP.create({
      data: {
        eventId: validatedData.eventId,
        name: validatedData.name,
        email: validatedData.email,
        ticketTierId: validatedData.ticketTierId,
      },
    })

    // Redirect to confirmation page
    redirect(`/rsvp-confirmation/${rsvp.id}`)
  } catch (error) {
    console.error('RSVP creation error:', error)
    throw error
  }
}
