import dayjs from 'dayjs'
import { MapPin } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui'
import { getRandomColor } from '@/lib/utils'
import { RouterOutput } from '@/server/api/root'
import { ShareActions } from './ShareActions'
import { ShareLink } from './ShareLink'
import { Stats } from './Stats'

type RouterOutputEvent = RouterOutput['event']['getBySlug']
interface EventCardProps extends RouterOutputEvent {
  url: string
}

export function EventCard({
  title,
  startDate,
  endDate,
  coverImage,
  venueName,
  venueAddress,
  rsvpCount,
  viewCount,
  checkInCount,
  url,
}: EventCardProps) {
  const eventDate = dayjs(startDate).format('dddd, MMMM D')
  const eventTime = `${dayjs(startDate).format('h:mm A')} - ${dayjs(endDate).format('h:mm A')}`
  const eventMonth = dayjs(startDate).format('MMM').toUpperCase()
  const eventDay = dayjs(startDate).format('D')

  // Generate gradient colors based on event title
  const gradientFrom = getRandomColor({ seed: title, intensity: 40 })
  const gradientTo = getRandomColor({ seed: title, intensity: 60 })

  return (
    <Card
      className="border-0 p-3 text-white lg:p-6"
      style={{
        background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-6">
          <div className="flex w-full flex-col justify-between gap-2 lg:w-fit lg:flex-col-reverse lg:justify-center">
            <ShareActions title={title} url={url} />
            <div className="relative flex size-48 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 lg:size-64">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <div className="text-center font-medium text-sm tracking-wider">
                  <div>YOU</div>
                  <div className="my-2">ARE</div>
                  <div>INVITED</div>
                </div>
              )}
            </div>
          </div>

          {/* Event Info */}
          <div className="flex flex-1 flex-col gap-3 lg:gap-4">
            <h1 className="font-bold text-xl lg:text-2xl">{title}</h1>
            <Stats rsvpCount={rsvpCount} viewCount={viewCount} checkInCount={checkInCount} />
            <div className="flex items-center gap-2 text-base">
              <div className="rounded bg-white/20 px-2 py-1 text-center">
                <div className="text-sm">{eventMonth}</div>
                <div className="font-bold">{eventDay}</div>
              </div>
              <div>
                <div className="font-medium">{eventDate}</div>
                <div className="text-white/80">{eventTime}</div>
              </div>
            </div>

            {venueName && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-3" />
                <div>
                  <div className="font-medium">{venueName}</div>
                  {venueAddress && <div className="text-white/80">{venueAddress}</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Share Link */}
        <ShareLink url={url} />
      </div>
    </Card>
  )
}
