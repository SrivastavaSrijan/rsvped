import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isToday from 'dayjs/plugin/isToday'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Card } from '@/components/ui'
import { RouterOutput } from '@/server/api/root'

dayjs.extend(relativeTime)
dayjs.extend(isBetween)
dayjs.extend(isToday)

const formatEventDate = (startDate: Date, endDate: Date | null) => {
  const now = dayjs()
  const start = dayjs(startDate)

  // If the event is currently happening
  if (endDate && now.isBetween(start, dayjs(endDate))) {
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
export interface EventCardProps extends RouterOutputMinimalEvent {}

export const EventCard = ({ title, description, startDate, endDate }: EventCardProps) => {
  const formattedDate = formatEventDate(startDate, endDate)

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl">{formattedDate}</h2>
      <Card className="w-full border-0 p-3 text-white lg:p-6">
        <div className="grid grid-cols-3 flex-col gap-4">
          <div className="col-span-2 flex flex-col gap-2">
            <h2 className="font-semibold text-lg">{title}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
