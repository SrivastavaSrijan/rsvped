import { getAPI } from '@/server/api'
import { EventCard } from '../../components'

export default async function DiscoverEvents() {
  const api = await getAPI()
  const events = await api.event.getAllEvents()
  return (
    <div className="mx-auto flex max-w-wide-page flex-col gap-4 px-4 py-8 lg:gap-8 lg:px-8 lg:py-12">
      <h1 className="font-bold text-2xl">Events</h1>
      <div className="grid grid-cols-12">
        <div className="col-span-1 flex items-center justify-center"></div>
        <div className="col-span-11 flex flex-col items-center justify-center">
          <ul className="space-y-4">
            {events.map((event) => (
              <EventCard key={event.slug} {...event} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
