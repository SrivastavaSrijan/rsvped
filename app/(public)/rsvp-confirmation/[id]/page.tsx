import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface RsvpConfirmationPageProps {
  params: {
    id: string
  }
}

export default async function RsvpConfirmationPage({ params }: RsvpConfirmationPageProps) {
  const rsvp = await prisma.rSVP.findUnique({
    where: { id: params.id },
    include: {
      event: {
        select: {
          title: true,
          startDateTime: true,
          location: true,
          slug: true,
        },
      },
      ticketTier: {
        select: {
          name: true,
          price: true,
        },
      },
    },
  })

  if (!rsvp) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-label="Success checkmark"
          >
            <title>Success checkmark</title>
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-green-800 mb-2">RSVP Confirmed!</h1>
        <p className="text-gray-600">You're all set for the event.</p>
      </div>

      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Event Details</h2>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Event:</span> {rsvp.event.title}
          </div>
          <div>
            <span className="font-medium">Date:</span>{' '}
            {new Date(rsvp.event.startDateTime).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
          {rsvp.event.location && (
            <div>
              <span className="font-medium">Location:</span> {rsvp.event.location}
            </div>
          )}
          <div>
            <span className="font-medium">Ticket:</span> {rsvp.ticketTier.name}
            {rsvp.ticketTier.price > 0 && ` - $${(rsvp.ticketTier.price / 100).toFixed(2)}`}
          </div>
          <div>
            <span className="font-medium">Attendee:</span> {rsvp.name} ({rsvp.email})
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-gray-600">A confirmation email has been sent to {rsvp.email}</p>
        <div className="space-x-4">
          <Link
            href={`/event/${rsvp.event.slug}`}
            className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            View Event
          </Link>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  )
}
