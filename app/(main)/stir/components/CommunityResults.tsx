// Server component: receives pre-fetched data
import { Badge, Button, Card, Skeleton } from '@/components/ui'
import type { RouterOutput } from '@/server/api'

type StirSearchResult = RouterOutput['stir']['search']
type CommunityResult = NonNullable<StirSearchResult['communities']>[number]

interface CommunityResultsProps {
	communities: CommunityResult[] | undefined
	isLoading?: boolean
}

export const CommunityResults = ({
	communities,
	isLoading,
}: CommunityResultsProps) => {
	if (isLoading) {
		const placeholders = [0, 1, 2, 3, 4, 5]
		return (
			<div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
				{placeholders.map((n) => (
					<Card key={`community-skel-${n}`} className="border-0 p-4">
						<div className="flex flex-col gap-2">
							<Skeleton className="h-6 w-2/3" />
							<Skeleton className="h-3 w-1/2" />
							<Skeleton className="h-8 w-24" />
						</div>
					</Card>
				))}
			</div>
		)
	}

	if (!communities || communities.length === 0) {
		return (
			<div className="text-sm text-muted-foreground">No communities found.</div>
		)
	}

	return (
		<div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
			{communities.map((c) => (
				<Card key={c.id} className="border-0 p-4">
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Badge
								variant="secondary"
								className="h-5 px-2 text-[10px] font-medium"
							>
								AI · {Math.round((c.score ?? 0) * 100)}%
							</Badge>
							<span className="text-xs text-muted-foreground">Relevance</span>
						</div>
						<h3 className="text-base font-semibold">{c.name}</h3>
						{c.reason && (
							<p className="text-xs text-foreground">
								<span className="font-medium">Why join:</span> {c.reason}
							</p>
						)}
						<div className="mt-2">
							<Button size="sm" variant="secondary">
								{c.isPublic ? 'Join' : 'Request Access'}
							</Button>
						</div>
					</div>
				</Card>
			))}
		</div>
	)
}
