import { LocationType } from '@prisma/client'
import dayjs from 'dayjs'
import Image from 'next/image'
import { Card } from '@/components/ui'
import { getRandomColor } from '@/lib/utils'
import { RouterOutput } from '@/server/api/root'
import { LocationItem } from './LocationItem'
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
  locationType,
  onlineUrl,
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

  // Dynamic location rendering based on location type
  const renderLocation = () => {
    switch (locationType) {
      case LocationType.PHYSICAL:
        if (!venueName) return null
        return (
          <LocationItem
            locationType={LocationType.PHYSICAL}
            title={venueName}
            subtitle={venueAddress}
          />
        )

      case LocationType.ONLINE:
        return (
          <LocationItem
            locationType={LocationType.ONLINE}
            title="Visit Link"
            subtitle={onlineUrl}
          />
        )

      case LocationType.HYBRID:
        return (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {venueName && (
                <LocationItem
                  locationType={LocationType.PHYSICAL}
                  title={venueName}
                  subtitle={venueAddress}
                />
              )}
              {onlineUrl && (
                <LocationItem
                  locationType={LocationType.ONLINE}
                  title="Visit Link"
                  subtitle={onlineUrl}
                />
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card
      className="w-full border-0 p-3 text-white lg:p-6"
      style={{
        background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-6">
          <div className="flex w-full flex-col justify-between gap-4 lg:w-fit lg:flex-col-reverse lg:justify-center lg:gap-2">
            <ShareActions title={title} url={url} />
            <div className="relative flex size-64 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 lg:size-64">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <div className="text-center font-medium text-sm tracking-wider">
                  <p>YOU</p>
                  <p className="my-2">ARE</p>
                  <p>INVITED</p>
                </div>
              )}
            </div>
          </div>

          {/* Event Info */}
          <div className="flex flex-1 flex-col gap-6 lg:gap-6">
            <div className="flex flex-col-reverse gap-2 lg:flex-col lg:gap-3">
              <Stats rsvpCount={rsvpCount} viewCount={viewCount} checkInCount={checkInCount} />
              <h1 className="font-semibold font-serif font-stretch-semi-condensed text-3xl lg:text-4xl">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-base">
              <div className="rounded bg-white/20 px-2 py-1 text-center">
                <p className="text-sm">{eventMonth}</p>
                <p className="font-bold">{eventDay}</p>
              </div>
              <div>
                <p className="font-medium">{eventDate}</p>
                <p className="">{eventTime}</p>
              </div>
            </div>
            {renderLocation()}
          </div>
        </div>

        {/* Share Link */}
      </div>
      <ShareLink url={url} />
    </Card>
  )
}
