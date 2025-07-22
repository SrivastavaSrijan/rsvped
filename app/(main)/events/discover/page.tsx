import { getAPI } from '@/server/api'
import { EventCard } from '../../components'

export default async function DiscoverEvents() {
  const api = await getAPI()
  const events = await api.event.getAllEvents()
  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-4 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <h1 className="font-bold text-2xl lg:text-4xl">Events</h1>

      <div className="flex w-full flex-col items-center justify-center">
        {events.map((event, index) => (
          <EventCard key={event.slug} {...event} isLast={index === events.length - 1} />
        ))}
      </div>
    </div>
  )
}
