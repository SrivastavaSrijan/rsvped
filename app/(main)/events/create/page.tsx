import { getAPI } from '@/server/api'
import { CreateEventForm } from '../../components/CreateEventForm'

export default async function CreateEvent() {
  const api = await getAPI()
  const { alt, url, color } = await api.image.getRandom()
  return (
    <div className="mx-auto w-full max-w-wide-page py-4 lg:py-8">
      <CreateEventForm coverImage={{ alt, url, color }} />
    </div>
  )
}
