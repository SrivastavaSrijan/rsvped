'use client'
import { LocationType } from '@prisma/client'
import { Globe, MapPin, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

const LocationIcons = {
  [LocationType.PHYSICAL]: MapPin,
  [LocationType.ONLINE]: Video,
  [LocationType.HYBRID]: Globe,
} as const

interface EventLocation {
  locationType: LocationType
  venueName?: string | null
  venueAddress?: string | null
  onlineUrl?: string | null
  className?: string
}

export const EventLocation = ({
  locationType,
  venueName,
  venueAddress,
  onlineUrl,
  className,
}: EventLocation) => {
  switch (locationType) {
    case LocationType.PHYSICAL:
      if (!venueName) return null
      return (
        <LocationItem
          className={className}
          locationType={LocationType.PHYSICAL}
          title={venueName}
          subtitle={venueAddress}
        />
      )

    case LocationType.ONLINE:
      return (
        <LocationItem
          className={className}
          locationType={LocationType.ONLINE}
          title="Zoom"
          subtitle={onlineUrl}
        />
      )

    case LocationType.HYBRID:
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {venueName && (
              <LocationItem
                className={className}
                locationType={LocationType.PHYSICAL}
                title={venueName}
                subtitle={venueAddress}
              />
            )}
            {onlineUrl && (
              <LocationItem
                className={className}
                locationType={LocationType.ONLINE}
                title="Zoom"
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

interface LocationItemProps {
  locationType: LocationType
  title: string
  subtitle?: string | null
  href?: string | null
  className?: string
}

export const LocationItem = ({
  locationType,
  title: itemTitle,
  subtitle,
  href,
  className,
}: LocationItemProps) => {
  const Icon = LocationIcons[locationType]

  const getDisplayTitle = () => {
    return itemTitle
  }

  const getHref = () => {
    if (locationType === LocationType.PHYSICAL && subtitle) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${itemTitle} ${subtitle}`)}`
    }
    return href || subtitle
  }

  const linkHref = getHref()
  const displayTitle = getDisplayTitle()

  return (
    <div
      className={cn('grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 text-sm', className)}
    >
      <Icon className="size-3" />
      <div className="flex min-w-0 flex-col gap-1">
        {linkHref ? (
          <a
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-medium hover:underline hover:underline-offset-2"
          >
            {displayTitle}
          </a>
        ) : (
          <p className="truncate font-medium leading-tight">{displayTitle}</p>
        )}
      </div>
    </div>
  )
}
