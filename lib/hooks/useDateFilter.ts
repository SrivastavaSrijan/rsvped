'use client'
import dayjs from 'dayjs'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

const formatDateDisplay = (date: string) => dayjs(date).format('ddd, MMM D')

function getDateRangeText(
	on?: string,
	after?: string,
	before?: string
): string | null {
	if (on) return `on ${formatDateDisplay(on)}`
	if (after && before)
		return `from ${formatDateDisplay(after)} to ${formatDateDisplay(before)}`
	if (after) return `from ${formatDateDisplay(after)} onwards`
	if (before) return `until ${formatDateDisplay(before)}`
	return null
}

export function useDateFilter() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()

	const paramOn = searchParams.get('on')
	const paramAfter = searchParams.get('after')
	const paramBefore = searchParams.get('before')

	const hasDateFilter = paramOn || paramAfter || paramBefore
	const dateRangeText = useMemo(
		() =>
			getDateRangeText(
				paramOn ?? undefined,
				paramAfter ?? undefined,
				paramBefore ?? undefined
			),
		[paramOn, paramAfter, paramBefore]
	)

	const clearDateFilter = () => {
		const params = new URLSearchParams(searchParams.toString())
		params.delete('on')
		params.delete('after')
		params.delete('before')
		params.set('page', '1')
		router.push(`${pathname}?${params.toString()}`)
	}

	const getEmptyMessage = () => {
		if (hasDateFilter) {
			return `No events found for the selected date range.`
		}
		return 'Looks like this community has no events.'
	}

	return {
		hasDateFilter,
		dateRangeText,
		clearDateFilter,
		getEmptyMessage,
	}
}
