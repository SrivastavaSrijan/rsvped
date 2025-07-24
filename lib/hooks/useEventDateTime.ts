import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isToday from 'dayjs/plugin/isToday'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useMemo } from 'react'

dayjs.extend(relativeTime)
dayjs.extend(isBetween)
dayjs.extend(isToday)

interface EventDateTimeInput {
  start: string | Date
  end?: string | Date | null
}

const formatDateTime = (date: dayjs.Dayjs) => ({
  month: date.format('MMM').toUpperCase(),
  monthFull: date.format('MMMM'),
  year: date.format('YYYY'),
  dayOfMonth: date.format('D'),
  dayOfWeek: date.format('ddd'),
  dayOfWeekFull: date.format('dddd'),
  time: date.format('h:mm A'),
  dateFormatted: date.format('dddd, MMMM D'),
  dayjs: date,
})

const getRelativeTime = (start: dayjs.Dayjs, end: dayjs.Dayjs | null) => {
  const now = dayjs()
  if (end && now.isBetween(start, end)) return 'Ongoing'
  if (start.isToday()) return 'Today'

  const diffDays = Math.abs(now.diff(start, 'day'))

  if (diffDays < 7) return start.fromNow()

  const format = start.isSame(now, 'year') ? 'MMM D' : 'MMM D, YYYY'
  return start.format(format)
}

export function useEventDateTime({ start, end }: EventDateTimeInput) {
  return useMemo(() => {
    const startDate = dayjs(start)
    const endDate = end ? dayjs(end) : null

    const startDetails = formatDateTime(startDate)
    const endDetails = endDate ? formatDateTime(endDate) : null

    const isSameDay = endDate ? startDate.isSame(endDate, 'day') : true

    const dateRange = isSameDay
      ? startDetails.dateFormatted
      : `${startDetails.dateFormatted} to ${endDetails?.dateFormatted}`

    const timeRange = endDetails ? `${startDetails.time} - ${endDetails.time}` : startDetails.time

    return {
      start: startDetails,
      end: endDetails,
      range: {
        date: dateRange,
        time: timeRange,
      },
      relative: getRelativeTime(startDate, endDate),
      isSameDay,
    }
  }, [start, end])
}
