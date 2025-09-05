import { Badge, Card, Skeleton } from '@/components/ui'
import type { RouterOutput } from '@/server/api'

type StirSearchResult = RouterOutput['stir']['search']
type EventWithAI = NonNullable<StirSearchResult['events']>[number]

interface EventResultsProps {
	events: EventWithAI[] | undefined
	isLoading?: boolean
}

export const EventResults = ({ events, isLoading }: EventResultsProps) => {
	if (isLoading) {
		const placeholders = [0, 1, 2, 3, 4, 5]
		return (
			<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
				{placeholders.map((n) => (
					<Card key={`event-skel-${n}`} className="border-0 p-4">
						<div className="flex flex-col gap-2">
							<Skeleton className="h-4 w-1/3" />
							<Skeleton className="h-6 w-2/3" />
							<Skeleton className="h-3 w-1/2" />
						</div>
					</Card>
				))}
			</div>
		)
	}

	if (!events || events.length === 0) {
		return (
			<div className="text-sm text-muted-foreground">
				No matching events yet. Try adjusting your query.
			</div>
		)
	}

	// Note: stir.search does not include event slug/cover; render minimal cards with AI insights
	return (
		<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
			{events.map((e) => (
				<Card key={e.id} className="border-0 p-4">
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Badge
								variant="secondary"
								className="h-5 px-2 text-[10px] font-medium"
							>
								AI · {Math.round((e.score ?? 0) * 100)}%
							</Badge>
							<span className="text-xs text-muted-foreground">Relevance</span>
						</div>
						<h3 className="text-base font-semibold">{e.title}</h3>
						<p className="text-xs text-muted-foreground">
							{new Date(e.startDate).toLocaleString()}
						</p>
						{e.reason && (
							<div className="mt-1 rounded-md bg-muted p-2">
								<p className="text-xs text-foreground">
									<span className="font-medium">Why this matches:</span>{' '}
									{e.reason}
								</p>
							</div>
						)}
					</div>
				</Card>
			))}
		</div>
	)
}
