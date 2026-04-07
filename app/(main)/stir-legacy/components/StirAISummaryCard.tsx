import { Sparkles } from 'lucide-react'

interface QueryInterpretation {
	keywords: string[]
	city: string | null
	category: string | null
	dateRange: { after: string | null; before: string | null }
	locationType: string | null
}

interface StirAISummaryCardProps {
	summary: string | null
	interpretation: QueryInterpretation | null
}

const LOCATION_TYPE_LABELS: Record<string, string> = {
	PHYSICAL: 'in-person',
	ONLINE: 'online',
	HYBRID: 'hybrid',
}

function formatDateRange(dateRange: {
	after: string | null
	before: string | null
}): string | null {
	const fmt = (iso: string) => {
		const d = new Date(`${iso}T00:00:00`)
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
	}
	if (dateRange.after && dateRange.before) {
		return `${fmt(dateRange.after)} \u2013 ${fmt(dateRange.before)}`
	}
	if (dateRange.after) return `from ${fmt(dateRange.after)}`
	if (dateRange.before) return `before ${fmt(dateRange.before)}`
	return null
}

export const StirAISummaryCard = ({
	summary,
	interpretation,
}: StirAISummaryCardProps) => {
	const tags: string[] = []
	if (interpretation) {
		tags.push(...interpretation.keywords)
		if (interpretation.city) tags.push(interpretation.city)
		if (interpretation.category) tags.push(interpretation.category)
		const dateStr = formatDateRange(interpretation.dateRange)
		if (dateStr) tags.push(dateStr)
		if (interpretation.locationType) {
			tags.push(
				LOCATION_TYPE_LABELS[interpretation.locationType] ??
					interpretation.locationType.toLowerCase()
			)
		}
	}

	if (tags.length === 0 && !summary) return null

	return (
		<div className="relative overflow-hidden rounded-xl border border-cranberry-40/20 bg-white/5 p-4 backdrop-blur-sm">
			<div className="flex items-start gap-3">
				<div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-cranberry-40/20">
					<Sparkles className="size-3 text-cranberry-40" />
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
						AI-enhanced
					</span>
					{tags.length > 0 ? (
						<div className="flex flex-wrap gap-1.5">
							{tags.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-cranberry-40/30 bg-cranberry-40/10 px-2 py-0.5 text-xs text-cranberry-40"
								>
									{tag}
								</span>
							))}
						</div>
					) : null}
					{summary ? (
						<p className="text-sm leading-relaxed text-white/90">{summary}</p>
					) : null}
				</div>
			</div>
		</div>
	)
}
