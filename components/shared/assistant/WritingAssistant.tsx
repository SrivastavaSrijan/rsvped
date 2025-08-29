'use client'

import { Loader2, Send, Sparkle, Sparkles, Undo2, Wand2 } from 'lucide-react'
import { useRef, useState } from 'react'

import {
	Button,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Textarea,
} from '@/components/ui'
import { useAutosizeTextArea } from '@/lib/hooks'
import {
	AIActionErrorCodeMap,
	enhanceText,
	generateSuggestions,
} from '@/server/actions'
import { FORMAT_OPTIONS, MAIN_ACTIONS, TONE_OPTIONS } from './constants'
import { GridActionButton } from './GridActionButton'
import { SuggestionsSection } from './SuggestionsSection'
import type {
	EnhancementType,
	Suggestion,
	WritingAssistantProps,
} from './types'

export const WritingAssistant = ({
	getValue,
	setValue,
	generatePrompt,
	context,
	size = 'sm',
}: WritingAssistantProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [loading, setLoading] = useState<
		EnhancementType | 'suggestions' | null
	>(null)
	const [previousValue, setPreviousValue] = useState<string>('')
	const [customPrompt, setCustomPrompt] = useState<string>('')
	const [error, setError] = useState<string | null>(null)
	const [suggestions, setSuggestions] = useState<Suggestion[]>([])
	const [previewSuggestion, setPreviewSuggestion] = useState<Suggestion | null>(
		null
	)

	const text = getValue()
	const hasText = text.trim().length > 0
	const canUndo = previousValue.length > 0 && previousValue !== text
	const isBusy = Boolean(loading)
	const isPromptActive = customPrompt.trim().length > 0
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const { adjustHeight } = useAutosizeTextArea(textareaRef, { padding: 4 })

	const handleEnhance = async (type: EnhancementType, prompt?: string) => {
		if (!text.trim()) return

		setPreviousValue(text)
		setLoading(type)
		setError(null)

		try {
			// Pass context for enhancements too
			const result = await enhanceText(text, type, context, prompt)

			if (result.success && result.data?.text) {
				setValue(result.data.text)
				setCustomPrompt('')
			} else if (result.error) {
				const errorMessage =
					AIActionErrorCodeMap[
						result.error as keyof typeof AIActionErrorCodeMap
					] || 'Enhancement failed'
				setError(errorMessage)
			}
		} catch {
			setError('Something went wrong. Please try again.')
		} finally {
			setLoading(null)
		}
	}

	const handleGenerateSuggestions = async () => {
		setLoading('suggestions')
		setError(null)
		setSuggestions([])
		setPreviewSuggestion(null) // Clear any existing preview

		try {
			// If parent provides generatePrompt, use it to build contextual prompt
			const currentValue = getValue()
			let finalPrompt = `${generatePrompt(currentValue)}`
			if (customPrompt) {
				finalPrompt += `\n\nUser request: "${customPrompt}"`
			}

			const result = await generateSuggestions(finalPrompt, context)

			if (result.success && result.data?.suggestions) {
				setSuggestions(result.data.suggestions)
				// Auto-select the first suggestion
				if (result.data.suggestions.length > 0) {
					setPreviewSuggestion(result.data.suggestions[0])
				}
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
			setLoading(null)
		}
	}

	const handleSuggestionClick = (suggestion: string) => {
		setPreviousValue(text)
		setValue(suggestion)
		setSuggestions([])
		setCustomPrompt('')
		setPreviewSuggestion(null)
	}

	const handlePreviewClick = (suggestion: Suggestion | null) => {
		setPreviewSuggestion(suggestion)
	}

	const handleCustomAction = () => {
		if (!customPrompt.trim()) return

		if (hasText) {
			// Has text - use as custom enhancement
			handleEnhance('custom', customPrompt.trim())
		} else {
			// No text - generate suggestions
			handleGenerateSuggestions()
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			e.stopPropagation()
			if (customPrompt.trim()) {
				handleCustomAction()
			}
		}
	}

	const handleUndo = () => {
		if (previousValue) {
			setValue(previousValue)
			setPreviousValue('')
		}
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="secondary"
					size={size}
					className="shrink-0"
					title="Enhance with AI"
				>
					<Sparkles
						className={`${size === 'sm' ? 'size-3' : 'size-4'} ${hasText ? 'text-foreground' : 'text-muted-foreground'}`}
					/>
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align="end"
				className="w-96 p-0 bg-black/5 backdrop-blur-3xl border-0"
			>
				<div className="flex flex-col p-3 gap-3">
					{/* Error display */}
					{error && (
						<div className="text-destructive text-xs p-2 bg-destructive/10 rounded">
							{error}
						</div>
					)}

					{/* Undo Button - improved styling */}
					{hasText && canUndo && (
						<>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={handleUndo}
								className="hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-200 text-white hover:text-white"
							>
								<Undo2 className="size-3 text-white" />
								<span className="text-sm font-medium text-white">Undo</span>
							</Button>
							<hr className="border-white/10 w-full" />
						</>
					)}

					{/* Custom Prompt Input - auto-expanding textarea */}
					<div className="relative">
						<div className="absolute -inset-0.5 bg-gradient-to-r from-cranberry-40 via-purple-40 to-blue-40 rounded-lg blur opacity-30 animate-pulse" />
						<div className="relative">
							<div className="absolute left-3 top-[18px] -translate-y-1/2 z-10">
								{loading === 'custom' || loading === 'suggestions' ? (
									<Loader2 className="size-3 animate-spin" />
								) : (
									<Sparkle className="size-3 stroke-white" />
								)}
							</div>
							<Textarea
								ref={textareaRef}
								value={customPrompt}
								onChange={(e) => {
									setCustomPrompt(e.target.value)
									adjustHeight()
								}}
								placeholder={
									hasText ? 'Describe your change' : 'How can I help you?'
								}
								className="w-full min-h-[40px] max-h-32 text-sm bg-black/5 rounded-3xl  border-gray-70/30 text-gray-10 placeholder:text-gray-10 focus:border-cranberry-40/50 focus:ring-cranberry-40/20 pl-10 pr-12 py-2.5 resize-none overflow-hidden focus:outline-none focus:ring-1"
								onKeyDown={handleKeyDown}
								disabled={isBusy}
								rows={1}
							/>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={handleCustomAction}
								disabled={isBusy || !isPromptActive}
								className="absolute right-1 top-1 h-8 w-8 p-0 rounded-full"
								style={{ zIndex: 20 }}
							>
								<Send className="size-3" />
							</Button>
						</div>
					</div>

					{/* CASE 1: No text - Show suggestions when available */}
					{!hasText && suggestions.length > 0 && (
						<SuggestionsSection
							suggestions={suggestions}
							onSuggestionClick={handleSuggestionClick}
							previewSuggestion={previewSuggestion}
							onPreviewClick={handlePreviewClick}
						/>
					)}

					{/* CASE 2: Has text - Show all enhancement options + generate suggestions */}
					{hasText && (
						<>
							{/* Suggestions generated from existing text */}
							{suggestions.length > 0 && (
								<SuggestionsSection
									suggestions={suggestions}
									onSuggestionClick={handleSuggestionClick}
									previewSuggestion={previewSuggestion}
									onPreviewClick={handlePreviewClick}
								/>
							)}
							{/* Generate Suggestions Button - improved styling */}
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() => {
									handleGenerateSuggestions()
								}}
								disabled={isBusy}
								className="w-full justify-start h-8 p-2 text-left hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-200 text-white hover:text-white"
							>
								<div className="flex items-center gap-2 w-full">
									<Wand2 className="size-3 text-white" />
									<span className="text-xs text-white">Get Inspired!</span>
								</div>
							</Button>

							<hr className="border-white/10 w-full mx-auto" />

							{/* Main Actions */}
							<div className="grid grid-cols-2 gap-1">
								{MAIN_ACTIONS.map((action) => (
									<GridActionButton
										key={action.id}
										action={action}
										loading={loading}
										onEnhance={handleEnhance}
										disabled={isBusy}
									/>
								))}
							</div>
							<hr className="border-white/10 w-full mx-auto" />
							{/* Tone Section - Now in grid format */}
							<div className="flex flex-col gap-1">
								<h4 className="text-xs font-medium text-white">Tone</h4>
								<div className="grid grid-cols-3 gap-1">
									{TONE_OPTIONS.map((action) => (
										<GridActionButton
											key={action.id}
											action={action}
											loading={loading}
											onEnhance={handleEnhance}
											disabled={isBusy}
										/>
									))}
								</div>
							</div>
							<hr className="border-white/10 w-full mx-auto" />
							{/* Format Section - Now in grid format */}
							<div className="flex flex-col gap-1">
								<h4 className="text-xs font-medium text-white">Format</h4>
								<div className="grid grid-cols-3 gap-1">
									{FORMAT_OPTIONS.map((action) => (
										<GridActionButton
											key={action.id}
											action={action}
											loading={loading}
											onEnhance={handleEnhance}
											disabled={isBusy}
										/>
									))}
								</div>
							</div>
							<hr className="border-white/10 w-full mx-auto" />
						</>
					)}
				</div>
			</PopoverContent>
		</Popover>
	)
}
