import { Metadata } from 'next'
import { getAPI } from '@/server/api'
import { EventForm } from '../../components/EventForm'

export const metadata: Metadata = {
  title: "Create an Event · RSVP'd",
  description: "Create a new event on RSVP'd",
}

export default async function CreateEvent() {
  const api = await getAPI()
  const { alt, url, color } = await api.image.getRandom()
  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <EventForm coverImage={{ alt, url, color }} />
    </div>
  )
}
