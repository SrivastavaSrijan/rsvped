'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDateFilter } from '@/lib/hooks'

export const DateFilterMessage = () => {
	const { hasDateFilter, dateRangeText, clearDateFilter } = useDateFilter()

	if (!hasDateFilter || !dateRangeText) return null

	return (
		<div className="flex lg:flex-row lg:items-center lg:gap-3 flex-col items-start gap-2">
			<div className="text-sm text-muted-foreground">
				Showing events {dateRangeText}
			</div>
			<Button
				variant="outline"
				size="sm"
				onClick={clearDateFilter}
				className="text-sm text-muted-foreground"
			>
				<X className="size-3" />
				Clear Filter
			</Button>
		</div>
	)
}
