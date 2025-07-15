import { Suspense } from 'react'
import { createCaller } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'
import { CreateEventForm } from '../components/create-event-form'

async function EventsList() {
  const ctx = await createTRPCContext()
  const caller = createCaller(ctx)
  const events = await caller.event.list()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Events</h2>
      {events.length === 0 ? (
        <p className="text-gray-500">No events found. Create one below!</p>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4 shadow-sm bg-white">
              <h3 className="text-xl font-semibold">{event.title}</h3>
              {event.subtitle && <p className="text-gray-600">{event.subtitle}</p>}
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p>
                  <strong>Start:</strong> {new Date(event.startDate).toLocaleString()}
                </p>
                <p>
                  <strong>End:</strong> {new Date(event.endDate).toLocaleString()}
                </p>
                <p>
                  <strong>Location Type:</strong> {event.locationType}
                </p>
                {event.venueName && (
                  <p>
                    <strong>Venue:</strong> {event.venueName}
                  </p>
                )}
                {event.onlineUrl && (
                  <p>
                    <strong>Online URL:</strong>{' '}
                    <a
                      href={event.onlineUrl}
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {event.onlineUrl}
                    </a>
                  </p>
                )}
                <p>
                  <strong>Host:</strong> {event.host.name || event.host.email}
                </p>
                <p>
                  <strong>RSVPs:</strong> {event._count.rsvps}
                </p>
                {event.capacity && (
                  <p>
                    <strong>Capacity:</strong> {event.capacity}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">RSVP'd Demo</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <Suspense
            fallback={
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            }
          >
            <EventsList />
          </Suspense>
        </div>

        <div>
          <CreateEventForm />
        </div>
      </div>
    </main>
  )
}
