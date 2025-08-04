'use client'

import dayjs from 'dayjs'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Calendar } from '@/components/ui/calendar'

const toStartOfDay = (date: Date) => dayjs(date).startOf('day').toISOString()
const toEndOfDay = (date: Date) => dayjs(date).endOf('day').toISOString()

function getDateRangeFromParams(
	on?: string,
	after?: string,
	before?: string
): DateRange | undefined {
	if (on) {
		const date = new Date(on)
		return { from: date, to: date }
	}
	if (after || before) {
		return {
			from: after ? new Date(after) : undefined,
			to: before ? new Date(before) : undefined,
		}
	}
	return undefined
}

export const EventCalendar = () => {
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()

	const paramOn = searchParams.get('on')
	const paramAfter = searchParams.get('after')
	const paramBefore = searchParams.get('before')

	const defaultRange = useMemo(
		() =>
			getDateRangeFromParams(
				paramOn ?? undefined,
				paramAfter ?? undefined,
				paramBefore ?? undefined
			),
		[paramOn, paramAfter, paramBefore]
	)

	const [dateRange, setDateRange] = useState<DateRange | undefined>(
		defaultRange
	)
	const hasDateFilter = paramOn || paramAfter || paramBefore

	const handleSelect = (range: DateRange | undefined) => {
		setDateRange(range)
		const params = new URLSearchParams(searchParams.toString())

		if (!range || (!range.from && !range.to)) {
			params.delete('on')
			params.delete('after')
			params.delete('before')
		} else if (
			range.from &&
			range.to &&
			range.from.toDateString() === range.to.toDateString()
		) {
			params.set('on', range.from.toISOString())
			params.delete('after')
			params.delete('before')
		} else {
			if (range.from) {
				params.set('after', toStartOfDay(range.from))
			} else {
				params.delete('after')
			}
			if (range.to) {
				params.set('before', toEndOfDay(range.to))
			} else {
				params.delete('before')
			}
			params.delete('on')
		}

		params.set('page', '1')
		router.push(`${pathname}?${params.toString()}`)
	}

	return (
		<Calendar
			mode="range"
			defaultMonth={dateRange?.from}
			selected={dateRange}
			onSelect={handleSelect}
			className="rounded-lg border shadow-sm"
			classNames={{
				today: hasDateFilter
					? 'bg-transparent text-foreground data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground'
					: undefined,
			}}
		/>
	)
}
