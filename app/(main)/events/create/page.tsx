import { getAPI } from '@/server/api'
import { EventForm } from '../../components/EventForm'

export default async function CreateEvent() {
  const api = await getAPI()
  const { alt, url, color } = await api.image.getRandom()
  return (
    <div className="mx-auto w-full max-w-wide-page py-4 lg:py-8">
      <EventForm coverImage={{ alt, url, color }} />
    </div>
  )
}
