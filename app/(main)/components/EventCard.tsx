import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isToday from 'dayjs/plugin/isToday'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { RouterOutput } from '@/server/api/root'
import { EventLocation } from './EventLocation'

dayjs.extend(relativeTime)
dayjs.extend(isBetween)
dayjs.extend(isToday)

const formatEventDate = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs | null) => {
  const now = dayjs()
  const start = startDate

  // If the event is currently happenin
  if (endDate && now.isBetween(start, endDate)) {
    return 'Ongoing'
  }

  // If the event is later today
  if (start.isToday()) {
    return 'Today'
  }

  // If the event was in the past
  if (start.isBefore(now)) {
    // Within the last 7 days
    if (now.diff(start, 'day') < 7) {
      return start.fromNow()
    }
    // Same year
    if (start.isSame(now, 'year')) {
      return start.format('MMM D')
    }
    // Different year
    return start.format('MMM D, YYYY')
  }

  // For future events beyond today
  // Within the next 7 days
  if (start.diff(now, 'day') < 7) {
    return start.fromNow()
  }
  // Same year
  if (start.isSame(now, 'year')) {
    return start.format('MMM D')
  }
  // Different year
  return start.format('MMM D, YYYY')
}

type RouterOutputMinimalEvent = RouterOutput['event']['getAllEvents'][number]
export interface EventCardProps extends RouterOutputMinimalEvent {
  isLast: boolean
}

export const EventCard = ({
  title,
  startDate,
  endDate,
  venueAddress,
  locationType,
  onlineUrl,
  venueName,
  isLast,
}: EventCardProps) => {
  const eventStartDate = dayjs(startDate)
  const eventEndDate = endDate ? dayjs(endDate) : null
  const timeSince = formatEventDate(eventStartDate, eventEndDate)
  const dayOfStart = eventStartDate.format('ddd')
  const timeRange = `${eventStartDate.format('h:mm A')}${eventEndDate ? ` - ${eventEndDate.format('h:mm A')}` : ''}`
  return (
    <div className="grid w-full grid-cols-12 gap-x-4 lg:gap-x-4">
      <div className="col-span-0 hidden flex-row gap-2 lg:col-span-2 lg:flex lg:flex-col">
        <p className="font-medium text-base text-bold">{timeSince}</p>
        <p className="text-muted-foreground text-sm">{dayOfStart}</p>
      </div>
      <div className={cn(isLast && 'mask-b-from-1', 'relative col-span-1 flex justify-center')}>
        <div className="absolute top-px size-2 rounded-full bg-white/50" />
        <div className="mt-2 h-[calc(100%-8px)] w-px border-white/50 border-l border-dashed" />
      </div>

      <div className="col-span-11 flex w-full flex-col gap-3 lg:col-span-9">
        <div className="flex gap-2 text-left lg:hidden lg:flex-col">
          <p className="font-medium text-base text-bold">{timeSince}</p>
          <p className="text-muted-foreground text-sm">{dayOfStart}</p>
        </div>
        <Card className="mb-6 w-full border-0 p-3 text-white lg:p-6">
          <div className="grid grid-cols-3 flex-col gap-4">
            <div className="col-span-2 flex flex-col gap-2">
              <p className="text-muted-foreground text-sm">{timeRange}</p>
              <h2 className="font-semibold text-lg">{title}</h2>
              <div className="flex flex-row items-center gap-2">
                <EventLocation
                  locationType={locationType}
                  venueName={venueName}
                  venueAddress={venueAddress}
                  onlineUrl={onlineUrl}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
