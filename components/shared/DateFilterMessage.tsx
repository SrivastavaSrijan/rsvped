'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDateFilter } from '@/lib/hooks'

export const DateFilterMessage = () => {
	const { hasDateFilter, dateRangeText, clearDateFilter } = useDateFilter()

	if (!hasDateFilter || !dateRangeText) return null

	return (
		<div className="flex flex-row items-center">
			<div className="text-sm text-muted-foreground">
				Showing events {dateRangeText}
			</div>
			<Button
				variant="ghost"
				size="sm"
				onClick={clearDateFilter}
				className="text-sm text-muted-foreground"
			>
				<X className="size-3" />
				Clear
			</Button>
		</div>
	)
}
