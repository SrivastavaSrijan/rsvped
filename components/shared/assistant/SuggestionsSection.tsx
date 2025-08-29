'use client'

import { Wand2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Suggestion } from './types'

interface SuggestionsSectionProps {
	suggestions: Suggestion[]
	onSuggestionClick: (suggestion: string) => void
	previewSuggestion: Suggestion | null
	onPreviewClick: (suggestion: Suggestion | null) => void
}

export const SuggestionsSection = ({
	suggestions,
	onSuggestionClick,
	previewSuggestion,
	onPreviewClick,
}: SuggestionsSectionProps) => (
	<div className="flex flex-col gap-3">
		{/* Preview Section - Now at the top */}
		{previewSuggestion && (
			<div className="p-3 bg-black/20 rounded-lg border border-white/10">
				<div className="text-xs text-white/70 mb-2">Preview:</div>
				<div className="text-sm text-white/90 leading-relaxed mb-3 max-h-32 overflow-y-auto">
					{previewSuggestion.text}
				</div>
				<div className="flex gap-2">
					<Button
						size="sm"
						className="bg-white/10 hover:bg-white/20 text-white border-white/20"
						onClick={() => onSuggestionClick(previewSuggestion.text)}
					>
						Apply
					</Button>
					<Button
						size="sm"
						variant="ghost"
						className="text-white/70 hover:text-white hover:bg-white/5"
						onClick={() => onPreviewClick(null)}
					>
						Cancel
					</Button>
				</div>
			</div>
		)}

		{/* Disposition badges - Now at the bottom */}
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-1 text-xs text-white">
				<Wand2 className="size-3 text-white" />
				Try these:
			</div>
			<div className="flex gap-2 flex-wrap w-full">
				{suggestions.map((suggestion) => (
					<Badge
						key={`${suggestion.disposition}-${suggestion.text.slice(0, 20)}`}
						className={`cursor-pointer text-xs py-2 px-2 hover:bg-white/20 hover:backdrop-blur-sm hover:border-white/50 flex-shrink-0 whitespace-nowrap transition-all duration-200 ${
							previewSuggestion?.disposition === suggestion.disposition
								? 'bg-white/20 text-white border-white/40'
								: 'bg-white/10 text-white'
						}`}
						onClick={() => onPreviewClick(suggestion)}
					>
						{suggestion.disposition}
					</Badge>
				))}
			</div>
		</div>
	</div>
)
