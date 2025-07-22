'use client'
import { LocationType } from '@prisma/client'
import { ExternalLink, Globe, Laptop, MapPin } from 'lucide-react'

const LocationIcons = {
  [LocationType.PHYSICAL]: MapPin,

  [LocationType.ONLINE]: Laptop,
  [LocationType.HYBRID]: Globe,
} as const

interface LocationItemProps {
  locationType: LocationType
  title: string
  subtitle?: string | null
  href?: string | null
}

export const LocationItem = ({
  locationType,
  title: itemTitle,
  subtitle,
  href,
}: LocationItemProps) => {
  const Icon = LocationIcons[locationType]

  const getDisplayTitle = () => {
    if (locationType === LocationType.ONLINE && subtitle) {
      try {
        const domain = new URL(subtitle).hostname.replace('www.', '')
        return domain
      } catch {
        return itemTitle
      }
    }
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
    <div className="grid grid-cols-[auto_1fr_auto] gap-2 text-sm">
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
      <ExternalLink className="size-2.5" />
    </div>
  )
}
