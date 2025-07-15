import { notFound } from 'next/navigation'
import { createRsvpAction } from '@/lib/actions/rsvp'
import { prisma } from '@/lib/prisma'

interface EventPageProps {
  params: {
    slug: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: {
      organization: {
        select: {
          name: true,
          slug: true,
          logo: true,
        },
      },
      ticketTiers: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: {
          rsvps: true,
        },
      },
    },
  })

  if (!event) {
    notFound()
  }

  const isEventFull = event.capacity ? event._count.rsvps >= event.capacity : false

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
        <div className="text-gray-600 mb-4">
          <p>
            {new Date(event.startDateTime).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
          {event.location && <p>{event.location}</p>}
        </div>
        {event.organization && <p className="text-blue-600">Hosted by {event.organization.name}</p>}
      </div>

      {event.description && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">About this event</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Event Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium">RSVPs:</span> {event._count.rsvps}
            {event.capacity && <span> / {event.capacity}</span>}
          </div>
          <div>
            <span className="font-medium">Status:</span>{' '}
            <span className={`${isEventFull ? 'text-red-600' : 'text-green-600'}`}>
              {isEventFull ? 'Full' : 'Available'}
            </span>
          </div>
        </div>
      </div>

      {!isEventFull && event.ticketTiers.length > 0 && (
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">RSVP to this event</h2>
          <form action={createRsvpAction} className="space-y-4">
            <input type="hidden" name="eventId" value={event.id} />

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="ticketTierId" className="block text-sm font-medium mb-1">
                Ticket Type
              </label>
              <select
                name="ticketTierId"
                id="ticketTierId"
                required
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select a ticket type</option>
                {event.ticketTiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name} {tier.price > 0 && `- $${(tier.price / 100).toFixed(2)}`}
                    {tier.description && ` - ${tier.description}`}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              RSVP Now
            </button>
          </form>
        </div>
      )}

      {isEventFull && (
        <div className="border border-red-200 rounded-lg p-6 bg-red-50">
          <h2 className="text-2xl font-semibold mb-2 text-red-800">Event Full</h2>
          <p className="text-red-700">
            This event has reached its capacity. Check back later for cancellations.
          </p>
        </div>
      )}
    </div>
  )
}
