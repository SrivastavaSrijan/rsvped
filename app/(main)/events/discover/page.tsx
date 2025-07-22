import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { AssetMap, Routes } from '@/lib/config'
import { getAPI } from '@/server/api'
import { EventCard } from '../../components'

export default async function DiscoverEvents({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period } = await searchParams
  const now = new Date().toISOString()
  const api = await getAPI()
  const events = await api.event.getAllEvents({
    sort: 'asc',
    before: period === 'upcoming' ? now : undefined,
    after: period === 'past' ? now : undefined,
  })
  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-4 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <h1 className="font-bold text-2xl lg:text-4xl">Events</h1>

      <div className="flex w-full flex-col items-center justify-center">
        {events.length === 0 && (
          <div className="flex h-[90vw] w-full flex-col items-center justify-center gap-4 lg:h-[50vw]">
            <Image
              src={AssetMap.NoEvents}
              alt="No events"
              width={200}
              height={200}
              className="mb-4"
            />
            <p className="text-muted-foreground text-sm">
              Looks like there are no upcoming events!
            </p>
            <Link href={Routes.Main.Events.Create} passHref>
              <Button variant="outline">Create Event</Button>
            </Link>
          </div>
        )}

        {events.map((event, index) => (
          <EventCard key={event.slug} {...event} isLast={index === events.length - 1} />
        ))}
      </div>
    </div>
  )
}
