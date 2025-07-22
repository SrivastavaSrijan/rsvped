import { Metadata } from 'next'
import { getAPI } from '@/server/api'
import { EventForm } from '../../../components/EventForm'

export const metadata: Metadata = {
  title: "Edit Event · RSVP'd",
  description: 'Edit your event details and settings.',
}

export default async function EditEvent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const api = await getAPI()

  const event = await api.event.getBySlug({ slug })
  if (!event) {
    return <div>Event not found</div>
  }

  return (
    <div className="mx-auto w-full max-w-wide-page py-4 lg:py-8">
      <EventForm
        coverImage={{
          alt: 'Event cover',
          url: event.coverImage || '',
          color: null,
        }}
        mode="edit"
        eventSlug={slug}
        event={event}
      />
    </div>
  )
}
