'use client'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { CalendarIcon, ClockIcon } from 'lucide-react'
import { ChangeEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

// Enable custom parsing for date formats
dayjs.extend(customParseFormat)

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  dateFormat?: string
  timeFormat?: string
}

export function DateTimePicker({
  date,
  setDate,
  dateFormat = 'ddd, MMM D',
  timeFormat = 'hh:mm A',
}: DateTimePickerProps) {
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isTimeOpen, setIsTimeOpen] = useState(false)

  // Local state for input values
  const [dateInputValue, setDateInputValue] = useState<string>(
    date ? dayjs(date).format(dateFormat) : ''
  )
  const [timeInputValue, setTimeInputValue] = useState<string>(
    date ? dayjs(date).format(timeFormat) : ''
  )

  // Update local input values when date prop changes
  useEffect(() => {
    if (date) {
      setDateInputValue(dayjs(date).format(dateFormat))
      setTimeInputValue(dayjs(date).format(timeFormat))
    } else {
      setDateInputValue('')
      setTimeInputValue('')
    }
  }, [date, dateFormat, timeFormat])

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

  // Calendar date selection handler
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && date) {
      // Preserve time from existing date
      const newDate = dayjs(date)
        .year(selectedDate.getFullYear())
        .month(selectedDate.getMonth())
        .date(selectedDate.getDate())
        .toDate()
      setDate(newDate)
    } else if (selectedDate) {
      // No existing date, set with default time (noon)
      setDate(dayjs(selectedDate).hour(12).minute(0).toDate())
    }
    setIsDateOpen(false)
  }

  // Time picker handlers
  const handleTimeChange = (type: 'hour' | 'minute' | 'ampm', value: string | number) => {
    if (!date) {
      // If no date exists, create one with today's date
      const newDate = dayjs().hour(0).minute(0).second(0)
      setDate(newDate.toDate())
      return
    }

    let newDate = dayjs(date)

    if (type === 'hour') {
      const currentAmPm = newDate.format('A')
      const hour = Number(value) % 12
      newDate = newDate.hour(currentAmPm === 'PM' ? hour + 12 : hour)
    } else if (type === 'minute') {
      newDate = newDate.minute(Number(value))
    } else if (type === 'ampm') {
      const currentHour = newDate.hour()
      const isPM = value === 'PM'

      if (isPM && currentHour < 12) {
        newDate = newDate.hour(currentHour + 12)
      } else if (!isPM && currentHour >= 12) {
        newDate = newDate.hour(currentHour - 12)
      }
    }

    setDate(newDate.toDate())

    // Close popover after selection
    if (type === 'ampm') {
      setIsTimeOpen(false)
    }
  }

  // Input change handlers
  const handleDateInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDateInputValue(value)
  }

  const handleTimeInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTimeInputValue(value)
  }

  // Handle input click to open popover on mobile
  const handleDateInputClick = () => {
    // Check if device is mobile (simplified check)
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      setIsDateOpen(true)
    }
  }

  const handleTimeInputClick = () => {
    // Check if device is mobile (simplified check)
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      setIsTimeOpen(true)
    }
  }

  // Validate and apply date on blur
  const handleDateInputBlur = () => {
    // Try different common date formats
    const formats = [
      dateFormat,
      'MM/DD/YYYY',
      'M/D/YYYY',
      'YYYY-MM-DD',
      'MMM D, YYYY',
      'D MMM YYYY',
    ]

    let parsedDate: dayjs.Dayjs | null = null

    // Try each format until one works
    for (const format of formats) {
      const attempt = dayjs(dateInputValue, format, true)
      if (attempt.isValid()) {
        parsedDate = attempt
        break
      }
    }

    // If no formats worked, try automatic parsing
    if (!parsedDate) {
      const attempt = dayjs(dateInputValue)
      if (attempt.isValid()) {
        parsedDate = attempt
      }
    }

    if (parsedDate) {
      // Keep the current time if a date already exists
      if (date) {
        const currentTime = dayjs(date)
        parsedDate = parsedDate.hour(currentTime.hour()).minute(currentTime.minute())
      }

      setDate(parsedDate.toDate())
      setDateInputValue(parsedDate.format(dateFormat))
    } else {
      // Invalid date, revert to current value
      setDateInputValue(date ? dayjs(date).format(dateFormat) : '')
    }
  }

  // Validate and apply time on blur
  const handleTimeInputBlur = () => {
    // Try different time formats
    const formats = [timeFormat, 'h:mm A', 'HH:mm', 'h:mm', 'h A']

    let parsedTime: dayjs.Dayjs | null = null

    // Try each format
    for (const format of formats) {
      const attempt = dayjs(timeInputValue, format, true)
      if (attempt.isValid()) {
        parsedTime = attempt
        break
      }
    }

    // Try automatic parsing as fallback
    if (!parsedTime) {
      const attempt = dayjs(timeInputValue)
      if (attempt.isValid()) {
        parsedTime = attempt
      }
    }

    if (parsedTime) {
      if (date) {
        // Keep the current date, update only time
        const newDate = dayjs(date).hour(parsedTime.hour()).minute(parsedTime.minute()).toDate()

        setDate(newDate)
        setTimeInputValue(dayjs(newDate).format(timeFormat))
      } else {
        // No existing date, create one with today's date
        const newDate = dayjs()
          .hour(parsedTime.hour())
          .minute(parsedTime.minute())
          .second(0)
          .toDate()

        setDate(newDate)
        setTimeInputValue(dayjs(newDate).format(timeFormat))
      }
    } else {
      // Invalid time, revert to current value
      setTimeInputValue(date ? dayjs(date).format(timeFormat) : '')
    }
  }

  return (
    <div className="flex items-center w-full flex-row gap-1">
      <div className="relative flex-1">
        <Input
          value={dateInputValue}
          onChange={handleDateInputChange}
          onBlur={handleDateInputBlur}
          onClick={handleDateInputClick}
          placeholder="Enter date"
          className="lg:text-sm w-full text-sm"
        />
        <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
            >
              <CalendarIcon className="size-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={handleDateSelect} autoFocus />
          </PopoverContent>
        </Popover>
      </div>
      <div className="relative">
        <Input
          value={timeInputValue}
          onChange={handleTimeInputChange}
          onBlur={handleTimeInputBlur}
          onClick={handleTimeInputClick}
          placeholder="Enter time"
          // Width calculation - 8ch for text, 24px for padding, 24px for icon button
          className="lg:text-sm text-sm max-w-[calc(8ch+24px+24px)]"
        />
        <Popover open={isTimeOpen} onOpenChange={setIsTimeOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
            >
              <ClockIcon className="size-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="flex h-[150px] sm:h-[200px]">
              <ScrollArea className="flex-1">
                <div className="flex flex-col p-2">
                  {hours.reverse().map((hour) => (
                    <Button
                      type="button"
                      key={hour}
                      variant={date && date.getHours() % 12 === hour % 12 ? 'default' : 'ghost'}
                      className="shrink-0"
                      onClick={() => handleTimeChange('hour', hour)}
                    >
                      {dayjs().hour(hour).format('hh')}
                    </Button>
                  ))}
                </div>
                <ScrollBar />
              </ScrollArea>
              <ScrollArea className="flex-1">
                <div className="flex flex-col p-2">
                  {minutes.map((minute) => (
                    <Button
                      type="button"
                      key={minute}
                      variant={date && date.getMinutes() === minute ? 'default' : 'ghost'}
                      className="shrink-0"
                      onClick={() => handleTimeChange('minute', minute)}
                    >
                      {dayjs().minute(minute).format('mm')}
                    </Button>
                  ))}
                </div>
                <ScrollBar />
              </ScrollArea>
              <ScrollArea className="flex-1">
                <div className="flex flex-col p-2">
                  {['AM', 'PM'].map((ampm) => (
                    <Button
                      type="button"
                      key={ampm}
                      variant={
                        date &&
                        ((ampm === 'AM' && date.getHours() < 12) ||
                          (ampm === 'PM' && date.getHours() >= 12))
                          ? 'default'
                          : 'ghost'
                      }
                      className="shrink-0"
                      onClick={() => handleTimeChange('ampm', ampm)}
                    >
                      {ampm}
                    </Button>
                  ))}
                </div>
                <ScrollBar />
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
