import { Metadata } from 'next'
import { getAPI } from '@/server/api'
import { EventForm } from '../../components/EventForm'

export const metadata: Metadata = {
  title: "Create Event · RSVP'd",
  description: "Create a new event on RSVP'd",
}

export default async function CreateEvent() {
  const api = await getAPI()
  const { alt, url, color } = await api.image.getRandom()
  return (
    <div className="mx-auto w-full max-w-wide-page py-4 lg:py-8">
      <EventForm coverImage={{ alt, url, color }} />
    </div>
  )
}
