'use client'
import { Card } from '@/components/ui'

export const EmptySearchState = () => {
	return (
		<Card className="border-0 p-6 text-center">
			<p className="text-sm text-muted-foreground">
				Try a query like “React workshops in SF next month”
			</p>
		</Card>
	)
}
