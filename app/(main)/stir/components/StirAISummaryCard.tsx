import { Sparkles } from 'lucide-react'

interface StirAISummaryCardProps {
	summary: string
}

export const StirAISummaryCard = ({ summary }: StirAISummaryCardProps) => (
	<div className="relative overflow-hidden rounded-xl border border-cranberry-40/20 bg-white/5 p-4 backdrop-blur-sm">
		<div className="flex items-start gap-3">
			<div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-cranberry-40/20">
				<Sparkles className="size-3 text-cranberry-40" />
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
					AI-enhanced
				</span>
				<p className="text-sm leading-relaxed text-white/90">{summary}</p>
			</div>
		</div>
	</div>
)
