'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import type { DateRange } from 'react-day-picker'

import { Calendar } from '@/components/ui/calendar'

export default function Calendar04() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()

	const paramOn = searchParams.get('on')
	const paramAfter = searchParams.get('after')
	const paramBefore = searchParams.get('before')

	const defaultRange = React.useMemo<DateRange | undefined>(() => {
		if (paramOn) {
			const date = new Date(paramOn)
			return { from: date, to: date }
		}
		if (paramAfter || paramBefore) {
			return {
				from: paramAfter ? new Date(paramAfter) : undefined,
				to: paramBefore ? new Date(paramBefore) : undefined,
			}
		}
		return undefined
	}, [paramOn, paramAfter, paramBefore])

	const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
		defaultRange
	)

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
				params.set('after', range.from.toISOString())
			} else {
				params.delete('after')
			}
			if (range.to) {
				params.set('before', range.to.toISOString())
			} else {
				params.delete('before')
			}
			params.delete('on')
		}
		router.push(`${pathname}?${params.toString()}`)
	}

	return (
		<Calendar
			mode="range"
			defaultMonth={dateRange?.from}
			selected={dateRange}
			onSelect={handleSelect}
			className="rounded-lg border shadow-sm"
		/>
	)
}
