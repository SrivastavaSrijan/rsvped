/**
 * SuggestionChips - Chips below input with AI suggestions
 *
 * Takes prompt from prompts config, shows chips below input
 * Click chip → change input value
 */

'use client'

import { Loader2, Wand2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Badge } from '@/components/ui/badge'
import { generateSuggestions } from '@/server/actions/ai/universal'

interface SuggestionChipsProps {
	getValue: () => string
	setValue: (value: string) => void
	promptTemplate: (
		currentValue: string,
		context?: Record<string, unknown>
	) => string
	context?: Record<string, unknown>
	minLength?: number
}

export const SuggestionChips = ({
	getValue,
	setValue,
	promptTemplate,
	context = {},
	minLength = 3,
}: SuggestionChipsProps) => {
	const [suggestions, setSuggestions] = useState<string[]>([])
	const [loading, setLoading] = useState(false)

	const currentValue = getValue()
	const [debouncedValue] = useDebounce(currentValue, 800)

	// Generate suggestions when value changes
	useEffect(() => {
		if (debouncedValue.length < minLength) {
			setSuggestions([])
			return
		}

		const fetchSuggestions = async () => {
			setLoading(true)

			try {
				const prompt = promptTemplate(debouncedValue, context)
				const formData = new FormData()
				formData.append('prompt', prompt)

				const result = await generateSuggestions(null, formData)
				if (result.success && result.suggestions) {
					setSuggestions(result.suggestions.slice(0, 4))
				}
			} finally {
				setLoading(false)
			}
		}

		fetchSuggestions()
	}, [debouncedValue, promptTemplate, context, minLength])

	if (!suggestions.length && !loading) return null

	return (
		<div className="flex flex-wrap gap-2 mt-2">
			<div className="flex items-center gap-1 text-xs text-muted-foreground">
				{loading ? (
					<Loader2 className="size-3 animate-spin" />
				) : (
					<Wand2 className="size-3" />
				)}
				{loading ? 'Thinking...' : 'Try:'}
			</div>

			{suggestions.map((suggestion) => (
				<Badge
					key={suggestion}
					variant="outline"
					className="cursor-pointer hover:bg-muted text-xs"
					onClick={() => setValue(suggestion)}
				>
					{suggestion}
				</Badge>
			))}
		</div>
	)
}
