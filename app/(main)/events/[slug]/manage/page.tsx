import { Camera, Edit, Users } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound, unauthorized } from 'next/navigation'
import { ManageEventCard } from '@/app/(main)/components'
import { Button } from '@/components/ui'
import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const api = await getAPI()
  const event = await api.event.getMetadataBySlug({ slug })
  return {
    title: `${event.title} · RSVP'd`,
    description: `View details for the event: ${event.title}`,
  }
}
export default async function ViewEvent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const api = await getAPI()
  const session = await auth()

  const event = await api.event.getBySlug({ slug })
  if (!event) {
    return notFound()
  }

  if (event.hostId !== session?.user?.id) {
    return unauthorized()
  }
  const pathname = (await headers()).get('x-pathname') || ''
  const url = process.env.NEXT_PUBLIC_BASE_URL + pathname
  const { checkInCount } = event

  return (
    <div className="px=2 mx-auto w-full max-w-extra-wide-page px-2 py-4 lg:px-4 lg:py-8">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:flex-col-reverse lg:gap-8">
        <div className="col-span-2">
          <ManageEventCard {...event} url={url} />
        </div>
        {/* Left Column - Event Card */}
        <div className="col-span-1 flex flex-col gap-3 px-2 lg:gap-4 lg:px-0">
          <h2 className="font-semibold text-lg lg:text-3xl">Manage Event</h2>
          <div className="flex w-full flex-col gap-2 lg:gap-2">
            {/* Check In Guests */}
            <Button variant="outline" className="w-full justify-center gap-2">
              <Users className="size-3" />
              Check In Guests ({checkInCount})
            </Button>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" asChild>
                <Link href={Routes.Main.Events.EditBySlug(slug)}>
                  <Edit className="size-3" />
                  Edit Event
                </Link>
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Camera className="size-3" />
                Change Photo
              </Button>
            </div>
          </div>
          <hr className="my-2" />
        </div>

        {/* Right Column - Details */}
      </div>
    </div>
  )
}
