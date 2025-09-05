// Server component: static rendering only
import { Lightbulb, Sparkles } from 'lucide-react'
import { Badge, Card } from '@/components/ui'

interface SearchInterpretationProps {
	interpretation: string
	suggestions?: string[]
}

export const SearchInterpretation = ({
	interpretation,
	suggestions = [],
}: SearchInterpretationProps) => {
	return (
		<Card className="border-0 bg-secondary p-3 lg:p-4">
			<div className="flex items-start gap-3">
				<div className="mt-0.5 rounded-md bg-muted p-1.5">
					<Sparkles className="size-4 text-foreground" />
				</div>
				<div className="flex flex-col gap-2">
					<p className="text-sm text-foreground">{interpretation}</p>
					{suggestions.length > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="secondary">
								<Lightbulb className="mr-1 size-3" />
								Suggestions
							</Badge>
							{suggestions.slice(0, 3).map((s, idx) => (
								<span key={s} className="text-xs text-muted-foreground">
									{s}
								</span>
							))}
						</div>
					)}
				</div>
			</div>
		</Card>
	)
}
