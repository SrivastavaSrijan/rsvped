/**
 * SuggestionChips - Chips below input with AI suggestions
 *
 * Takes prompt from prompts config, shows chips below input
 * Click chip → change input value
 */

'use client'

import { Loader2, Undo2, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AIActionErrorCodeMap } from '@/server/actions'
import { generateCustomSuggestions } from '@/server/actions/ai/universal'

type AIContext = {
	// Must-have context - simplified to strings
	domain: string
	page: string
	field: string
	location?: string
	category?: string
	// Additional flexible metadata
	metadata?: Record<string, unknown>
}

interface SuggestionChipsProps {
	getValue: () => string
	setValue: (value: string) => void
	suggestionPrompt: string
	context: AIContext // Required context from parent
	minLength?: number
}

export const SuggestionChips = ({
	getValue,
	setValue,
	suggestionPrompt,
	context,
	minLength = 3,
}: SuggestionChipsProps) => {
	const [suggestions, setSuggestions] = useState<string[]>([])
	const [previousValue, setPreviousValue] = useState<string>('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const currentValue = getValue()

	const handleGenerateSuggestions = async () => {
		if (currentValue.length < minLength || loading) return

		setLoading(true)
		setError(null)

		try {
			const result = await generateCustomSuggestions(suggestionPrompt, context)

			if (result.success && result.data?.suggestions) {
				setSuggestions(result.data.suggestions)
			} else if (result.error) {
				const errorMessage =
					AIActionErrorCodeMap[
						result.error as keyof typeof AIActionErrorCodeMap
					] || 'Failed to generate suggestions'
				setError(errorMessage)
			}
		} catch {
			setError('Something went wrong. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	const handleSuggestionClick = (suggestion: string) => {
		setPreviousValue(currentValue)
		setValue(suggestion)
		setSuggestions([])
		setError(null)
	}

	const handleUndo = () => {
		if (previousValue) {
			setValue(previousValue)
			setPreviousValue('')
		}
	}

	const canUndo = previousValue.length > 0 && previousValue !== currentValue
	const canGenerate = currentValue.length >= minLength && !loading

	return (
		<div className="flex flex-wrap items-center gap-2 mt-2">
			{canUndo && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleUndo}
					className="h-6 px-2 text-xs"
				>
					<Undo2 className="size-3 mr-1" />
					Undo
				</Button>
			)}

			{canGenerate && suggestions.length === 0 && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleGenerateSuggestions}
					className="h-6 px-2 text-xs"
				>
					<Wand2 className="size-3 mr-1" />
					Get suggestions
				</Button>
			)}

			{loading && (
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<Loader2 className="size-3 animate-spin" />
					Thinking...
				</div>
			)}

			{suggestions.length > 0 && (
				<>
					<div className="flex items-center gap-1 text-xs text-muted-foreground">
						<Wand2 className="size-3" />
						Try:
					</div>
					{suggestions.map((suggestion) => (
						<Badge
							key={suggestion}
							variant="outline"
							className="cursor-pointer text-xs"
							onClick={() => handleSuggestionClick(suggestion)}
						>
							{suggestion}
						</Badge>
					))}
				</>
			)}

			{error && <div className="text-destructive text-xs mt-1">{error}</div>}
		</div>
	)
}
