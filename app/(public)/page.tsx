'use client'

import { api } from '@/lib/api'

export default function HomePage() {
  const {
    data: events,
    isLoading,
    error,
  } = api.event.getAll.useQuery({
    limit: 10,
  })

  if (isLoading) {
    return <div className="p-8">Loading events...</div>
  }

  if (error) {
    return <div className="p-8">Error loading events: {error.message}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      {events?.events.length === 0 ? (
        <p className="text-gray-600">No events found.</p>
      ) : (
        <div className="space-y-4">
          {events?.events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="text-gray-600">{event.description}</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  {new Date(event.startDateTime).toLocaleDateString()} • {event._count.rsvps} RSVPs
                </span>
              </div>
              {event.organization && (
                <div className="mt-2">
                  <span className="text-sm text-blue-600">by {event.organization.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
