'use client'

import { LocationType } from '@prisma/client'
import { Globe, Lock, MapPin, Ticket, Users } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import {
  Button,
  DateTimePicker,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@/components/ui'
import { TimezoneConfig } from '@/lib/config'
import { LocationTypeLabels } from '@/lib/constants'
import { useActionStateWithError } from '@/lib/hooks'
import { createEvent, EventActionErrorCodeMap, EventActionResponse } from '@/server/actions'

interface CreateEventFormProps {
  coverImage: {
    url: string
    alt: string
    color: string | null
  }
}

const initialCreateEventState: EventActionResponse = {
  success: false,
}

export function CreateEventForm({ coverImage }: CreateEventFormProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const aWeekFromNow = new Date()
    aWeekFromNow.setDate(aWeekFromNow.getDate() + 7)
    return aWeekFromNow
  })
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const aWeekFromNowPlusAnHour = new Date()
    aWeekFromNowPlusAnHour.setDate(aWeekFromNowPlusAnHour.getDate() + 7)
    aWeekFromNowPlusAnHour.setHours(aWeekFromNowPlusAnHour.getHours() + 1)
    return aWeekFromNowPlusAnHour
  })
  const [locationType, setLocationType] = useState<LocationType>(LocationType.PHYSICAL)
  const [isPaid, setIsPaid] = useState(false)

  const { formAction, errorComponent, isPending, state } = useActionStateWithError({
    action: createEvent,
    initialState: initialCreateEventState,
    errorCodeMap: EventActionErrorCodeMap,
    displayMode: 'inline',
  })

  // Extract field errors from state
  const fieldErrors = state?.fieldErrors || {}

  // Computed values for form inputs

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
      <div className="flex flex-col items-center justify-center lg:col-span-1">
        <div
          className="relative aspect-square h-auto w-full max-w-[300px] rounded-xl shadow-lg lg:max-w-[340px]"
          style={{ backgroundColor: coverImage.color || 'transparent' }}
        >
          <Image
            fill
            src={coverImage.url}
            alt={coverImage.alt}
            className="h-auto w-full rounded-xl object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
      <div className="w-full px-2 lg:col-span-2 lg:px-0">
        <form action={formAction} className="flex flex-col gap-4">
          <Input type="hidden" name="coverImage" value={coverImage.url} />

          <div className="flex flex-col gap-1">
            <Input
              name="title"
              placeholder="Event Name"
              className="min-h-8 w-full p-4 text-xl lg:min-h-16 lg:p-4 lg:text-3xl"
            />
            {fieldErrors.title && (
              <p className="text-destructive text-sm">{fieldErrors.title[0]}</p>
            )}
          </div>

          {/* Date & Time Section */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex flex-col gap-4 rounded-lg bg-white/10 p-3 lg:col-span-2 lg:gap-3">
              <div className="flex flex-col gap-1">
                <DateTimePicker date={startDate} setDate={setStartDate} />
                <Input type="hidden" name="startDate" value={startDate?.toISOString()} />
                {fieldErrors.startDate && (
                  <p className="text-destructive text-sm">{fieldErrors.startDate[0]}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <DateTimePicker date={endDate} setDate={setEndDate} />
                <Input type="hidden" name="endDate" value={endDate?.toISOString()} />
                {fieldErrors.endDate && (
                  <p className="text-destructive text-sm">{fieldErrors.endDate[0]}</p>
                )}
              </div>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <div className="flex items-center gap-2">
                <Globe className="size-3" />
                <span className="font-medium">Timezone</span>
              </div>
              <span className="text-sm">{TimezoneConfig.current}</span>
              <Input type="hidden" name="timezone" value={TimezoneConfig.current} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Textarea name="description" placeholder="Add a description" />
            {fieldErrors.description && (
              <p className="text-destructive text-sm">{fieldErrors.description[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-lg bg-white/10 p-3">
            {/* Location & Description */}
            <Input type="hidden" name="locationType" value={locationType} />
            <div className="flex flex-col gap-1">
              <Select
                name="locationType"
                defaultValue={LocationType.PHYSICAL}
                onValueChange={(value) => setLocationType(value as LocationType)}
              >
                <SelectTrigger className="flex h-auto w-full justify-start gap-2 rounded-lg bg-white/10 p-2">
                  <MapPin className="size-3" />
                  <SelectValue placeholder="Select event location type">
                    {LocationTypeLabels[locationType]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LocationType.PHYSICAL}>
                    {LocationTypeLabels[LocationType.PHYSICAL]}
                  </SelectItem>
                  <SelectItem value={LocationType.ONLINE}>
                    {LocationTypeLabels[LocationType.ONLINE]}
                  </SelectItem>
                  <SelectItem value={LocationType.HYBRID}>
                    {LocationTypeLabels[LocationType.HYBRID]}
                  </SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.locationType && (
                <p className="text-destructive text-sm">{fieldErrors.locationType[0]}</p>
              )}
            </div>

            {(locationType === LocationType.PHYSICAL || locationType === LocationType.HYBRID) && (
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <Input name="venueName" placeholder="Name" className="col-span-1" />
                  {fieldErrors.venueName && (
                    <p className="text-destructive text-sm">{fieldErrors.venueName[0]}</p>
                  )}
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <Input name="venueAddress" placeholder="Address" />
                  {fieldErrors.venueAddress && (
                    <p className="text-destructive text-sm">{fieldErrors.venueAddress[0]}</p>
                  )}
                </div>
              </div>
            )}

            {(locationType === LocationType.ONLINE || locationType === LocationType.HYBRID) && (
              <div className="flex flex-col gap-1">
                <Input name="onlineUrl" placeholder="Zoom/Google Meet Link" />
                {fieldErrors.onlineUrl && (
                  <p className="text-destructive text-sm">{fieldErrors.onlineUrl[0]}</p>
                )}
              </div>
            )}
          </div>

          {/* Event Options */}
          <div className="mt-2 flex flex-col gap-1 rounded-lg bg-white/10 p-2">
            <h3 className="px-2 py-1 font-semibold text-sm">Options</h3>
            <div className="flex h-auto items-center justify-between p-2 text-left">
              <div className="flex items-center gap-2">
                <Ticket className="size-3" />
                <span className="font-medium text-sm">Tickets</span>
              </div>
              <div className="flex flex-row items-center gap-2">
                <span className="font-medium text-white/50 text-xs">Free</span>
                <div className="flex items-center gap-4">
                  <Switch name="isPaid" checked={isPaid} onCheckedChange={setIsPaid} />

                  {isPaid && (
                    <div className="flex items-center gap-1">
                      <div className="flex flex-col gap-1">
                        <Input
                          name="ticketPrice"
                          type="number"
                          placeholder="Price"
                          className="w-[8ch] p-2 text-xs"
                        />
                        {fieldErrors.ticketPrice && (
                          <p className="text-destructive text-xs">{fieldErrors.ticketPrice[0]}</p>
                        )}
                      </div>
                      <p className="text-white/50 text-xs">INR</p>
                      <Input name="ticketCurrency" type="hidden" value="INR" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex h-auto items-center justify-between p-2 text-left">
              <div className="flex items-center gap-2">
                <Lock className="size-3" />
                <span className="font-medium text-sm">Require Approval</span>
              </div>
              <Switch name="requiresApproval" />
            </div>
            <div className="flex h-auto w-full items-center justify-between p-2 text-left">
              <div className="flex items-center gap-2">
                <Users className="size-3" />
                <span className="font-medium text-sm">Capacity</span>
              </div>
              <div className="flex flex-col gap-1">
                <Input name="capacity" type="number" placeholder="Unlimited" />
                {fieldErrors.capacity && (
                  <p className="text-destructive text-sm">{fieldErrors.capacity[0]}</p>
                )}
              </div>
            </div>
          </div>

          {errorComponent}

          <Button size="lg" type="submit" className="mt-4 w-full" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Event'}
          </Button>
        </form>
      </div>
    </div>
  )
}
