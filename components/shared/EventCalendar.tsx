'use client'

import dayjs from 'dayjs'
import { Calendar as CalendarIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import type { DateRange } from 'react-day-picker'
import { Calendar } from '@/components/ui/calendar'
import { Button, Popover, PopoverContent, PopoverTrigger } from '../ui'

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

	const dateRange = useMemo(
		() =>
			getDateRangeFromParams(
				paramOn ?? undefined,
				paramAfter ?? undefined,
				paramBefore ?? undefined
			),
		[paramOn, paramAfter, paramBefore]
	)

	const handleSelect = (range: DateRange | undefined) => {
		const params = new URLSearchParams(searchParams.toString())

		if (!range || (!range.from && !range.to)) {
			params.delete('on')
			params.delete('after')
			params.delete('before')
		} else if (
			range.from &&
			range.to &&
			dayjs(range.from).isSame(range.to, 'day')
		) {
			params.set('on', range.from.toISOString())
			params.delete('after')
			params.delete('before')
		} else {
			params.delete('on')
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
		}

		params.set('page', '1')
		router.push(`${pathname}?${params.toString()}`)
	}

	const renderCalendar = (
		<div className="flex flex-col items-start gap-3 rounded-lg bg-card p-3 lg:p-4">
			<p className="text-sm text-muted-foreground">Find events by date</p>
			<hr className="w-full border-border" />
			<Calendar
				mode="range"
				defaultMonth={dateRange?.from}
				selected={dateRange}
				onSelect={handleSelect}
				className="w-full bg-card p-0 lg:w-fit lg:[--cell-size:--spacing(8)] [--cell-size:--spacing(7)]"
			/>
		</div>
	)

	return (
		<>
			<div className="flex w-full justify-end lg:hidden">
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="secondary" size="sm">
							<CalendarIcon className="size-3 text-muted-foreground" />
							Find Events
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="end">
						{renderCalendar}
					</PopoverContent>
				</Popover>
			</div>
			<div className="hidden lg:flex">{renderCalendar}</div>
		</>
	)
}
