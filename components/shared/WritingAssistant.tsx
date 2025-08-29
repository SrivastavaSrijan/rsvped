/**
 * WritingAssistant - Icon that shows select with enhancement options
 *
 * Hover/click → select opens with options from prompts
 * Click option → show sparkles, mutate input value
 */

'use client'

import {
	BarChart3,
	Briefcase,
	CheckCircle2,
	List,
	Loader2,
	Scissors,
	Send,
	Smile,
	Sparkle,
	Sparkles,
	Table,
	Undo2,
	Wand2,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { AIActionErrorCodeMap } from '@/server/actions'
import {
	enhanceText,
	generateCustomSuggestions,
} from '@/server/actions/ai/universal'

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

interface WritingAssistantProps {
	getValue: () => string
	setValue: (value: string) => void
	generatePrompt?: (currentValue: string) => string
	context: AIContext // Required context
	size?: 'sm' | 'default'
}

type LucideIconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

// Enhanced type definitions
const ENHANCEMENT_TYPES = {
	MAIN: ['proofread', 'rewrite'] as const,
	TONE: ['friendly', 'professional', 'concise'] as const,
	FORMAT: ['keypoints', 'summary', 'table'] as const,
	CUSTOM: ['custom'] as const,
} as const

type MainActionType = (typeof ENHANCEMENT_TYPES.MAIN)[number]
type ToneActionType = (typeof ENHANCEMENT_TYPES.TONE)[number]
type FormatActionType = (typeof ENHANCEMENT_TYPES.FORMAT)[number]
type CustomActionType = (typeof ENHANCEMENT_TYPES.CUSTOM)[number]
type EnhancementType =
	| MainActionType
	| ToneActionType
	| FormatActionType
	| CustomActionType

type ActionOption<TType extends EnhancementType = EnhancementType> = {
	readonly id: TType
	readonly label: string
	readonly icon: LucideIconType
}

const MAIN_ACTIONS: readonly ActionOption<MainActionType>[] = [
	{
		id: 'proofread',
		label: 'Proofread',
		icon: CheckCircle2,
	},
	{
		id: 'rewrite',
		label: 'Rewrite',
		icon: Wand2,
	},
] as const

const TONE_OPTIONS: readonly ActionOption<ToneActionType>[] = [
	{
		id: 'friendly',
		label: 'Friendly',
		icon: Smile,
	},
	{
		id: 'professional',
		label: 'Professional',
		icon: Briefcase,
	},
	{
		id: 'concise',
		label: 'Concise',
		icon: Scissors,
	},
] as const

const FORMAT_OPTIONS: readonly ActionOption<FormatActionType>[] = [
	{
		id: 'keypoints',
		label: 'Key Points',
		icon: List,
	},
	{
		id: 'summary',
		label: 'Summary',
		icon: BarChart3,
	},
	{
		id: 'table',
		label: 'Table',
		icon: Table,
	},
] as const

// Unified suggestions section component
const SuggestionsSection = ({
	suggestions,
	onSuggestionClick,
}: {
	suggestions: string[]
	onSuggestionClick: (suggestion: string) => void
}) => (
	<div className="flex flex-col gap-2">
		<div className="flex items-center gap-1 text-xs text-white">
			<Wand2 className="size-3 text-white" />
			Try these:
		</div>
		<div className="flex gap-2 flex-wrap w-full">
			{suggestions.map((suggestion) => (
				<Badge
					key={suggestion}
					className="cursor-pointer text-xs bg-white/10 text-white border-white/30 hover:bg-white/20 hover:backdrop-blur-sm hover:border-white/50 flex-shrink-0 whitespace-normal text-left"
					onClick={() => onSuggestionClick(suggestion)}
				>
					{suggestion}
				</Badge>
			))}
		</div>
	</div>
)

export const WritingAssistant = ({
	getValue,
	setValue,
	generatePrompt: suggestionPrompt,
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
	const [suggestions, setSuggestions] = useState<string[]>([])

	const text = getValue()
	const hasText = text.trim().length > 0
	const canUndo = previousValue.length > 0 && previousValue !== text
	const isBusy = Boolean(loading)
	const isPromptActive = customPrompt.trim().length > 0

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
		if (!customPrompt.trim() || isBusy) return

		setLoading('suggestions')
		setError(null)
		setSuggestions([])

		try {
			// If parent provides suggestionPrompt, use it to build contextual prompt
			let finalPrompt = customPrompt
			if (suggestionPrompt && customPrompt.trim()) {
				const currentValue = getValue()
				finalPrompt = `${suggestionPrompt(currentValue)}\n\nUser request: "${customPrompt}"`
			}

			const result = await generateCustomSuggestions(finalPrompt, context)

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
			setLoading(null)
		}
	}

	const handleSuggestionClick = (suggestion: string) => {
		setPreviousValue(text)
		setValue(suggestion)
		setSuggestions([])
		setCustomPrompt('')
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

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

	// Clean, simple button classes with improved hover styles
	const listButtonClass =
		'h-7 text-left justify-start hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-200 text-white hover:text-white'
	const gridButtonClass =
		'flex flex-col h-auto p-2 text-center hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-200 text-white hover:text-white'

	const renderIconOrSpinner = (
		isLoading: boolean,
		Icon: LucideIconType,
		sizeClass: string
	) =>
		isLoading ? (
			<Loader2 className={`${sizeClass} animate-spin text-cranberry-50`} />
		) : (
			<Icon className={`${sizeClass}`} />
		)

	// Reusable buttons with improved styling
	const ListOptionButton = ({ option }: { option: ActionOption }) => {
		const isLoading = loading === option.id
		return (
			<Button
				key={option.id}
				type="button"
				variant="link"
				size="sm"
				onClick={() => handleEnhance(option.id)}
				disabled={isBusy}
				className={listButtonClass}
				aria-busy={isLoading || undefined}
			>
				<div className="flex items-center gap-2 w-full">
					{renderIconOrSpinner(isLoading, option.icon, 'size-3')}
					<span className="text-xs text-white">{option.label}</span>
				</div>
			</Button>
		)
	}

	const GridActionButton = ({ action }: { action: ActionOption }) => {
		const isLoading = loading === action.id
		const IconComponent = action.icon
		return (
			<Button
				key={action.id}
				type="button"
				variant="secondary"
				size="sm"
				onClick={() => handleEnhance(action.id)}
				disabled={isBusy}
				className={gridButtonClass}
				aria-busy={isLoading || undefined}
			>
				<div className="flex items-center justify-center w-6 h-6 mb-1">
					{isLoading ? (
						<Loader2 className="size-4 animate-spin text-white" />
					) : (
						<IconComponent className="size-4 text-white" />
					)}
				</div>
				<span className="text-sm font-medium text-white">{action.label}</span>
			</Button>
		)
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
				className="w-72 p-0 bg-black/5 backdrop-blur-2xl border-gray-70/20"
				style={{
					backdropFilter: 'blur(20px)',
				}}
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
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={handleUndo}
							className="hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-200 text-white hover:text-white"
						>
							<div className="flex items-center gap-2 w-full">
								<Undo2 className="size-3 text-white" />
								<span className="text-sm font-medium text-white">Undo</span>
							</div>
						</Button>
					)}

					{/* Custom Prompt Input - clean styling */}
					<div className="relative">
						<div className="absolute -inset-0.5 bg-gradient-to-r from-cranberry-40 via-purple-40 to-blue-40 rounded-lg blur opacity-30 animate-pulse" />
						<div className="relative">
							<div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
								{loading === 'custom' || loading === 'suggestions' ? (
									<Loader2 className="size-3 animate-spin" />
								) : (
									<Sparkle className="size-3 stroke-white" />
								)}
							</div>
							<Input
								value={customPrompt}
								onChange={(e) => setCustomPrompt(e.target.value)}
								placeholder={
									hasText
										? 'Describe your change'
										: 'What suggestions do you need?'
								}
								className="h-10 text-sm rounded-3xl bg-gray-90/80 border-gray-70/30 text-gray-10 placeholder:text-gray-10 focus:border-cranberry-40/50 focus:ring-cranberry-40/20 pl-10 pr-12"
								onKeyDown={handleKeyDown}
								disabled={isBusy}
							/>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={handleCustomAction}
								disabled={isBusy || !isPromptActive}
								className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full"
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
						/>
					)}

					{/* Show loading for suggestions when no text */}
					{!hasText && loading === 'suggestions' && (
						<div className="flex items-center gap-1 text-xs text-white">
							<Loader2 className="size-3 animate-spin text-white" />
							Generating suggestions...
						</div>
					)}

					{/* CASE 2: Has text - Show all enhancement options + generate suggestions */}
					{hasText && (
						<>
							{/* Main Actions */}
							<div className="grid grid-cols-2 gap-1">
								{MAIN_ACTIONS.map((action) => (
									<GridActionButton key={action.id} action={action} />
								))}
							</div>

							{/* Generate Suggestions Button - improved styling */}
							<div className="border-y border-gray-70/20 py-2">
								<Button
									type="button"
									variant="secondary"
									size="sm"
									onClick={() => {
										setCustomPrompt(
											`Generate suggestions for: ${text.substring(0, 30)}...`
										)
										handleGenerateSuggestions()
									}}
									disabled={isBusy}
									className="w-full justify-start h-8 p-2 text-left hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-200 text-white hover:text-white"
								>
									<div className="flex items-center gap-2 w-full">
										<Wand2 className="size-3 text-white" />
										<span className="text-xs text-white">
											Generate suggestions
										</span>
									</div>
								</Button>
							</div>

							{/* Suggestions generated from existing text */}
							{suggestions.length > 0 && (
								<SuggestionsSection
									suggestions={suggestions}
									onSuggestionClick={handleSuggestionClick}
								/>
							)}

							{/* Tone Section */}
							<div className="flex flex-col gap-1">
								<h4 className="text-xs font-medium text-white">Tone</h4>
								<div className="flex flex-col">
									{TONE_OPTIONS.map((option) => (
										<ListOptionButton key={option.id} option={option} />
									))}
								</div>
							</div>

							{/* Format Section */}
							<div className="flex flex-col gap-1">
								<h4 className="text-xs font-medium text-white">Format</h4>
								<div className="grid">
									{FORMAT_OPTIONS.map((option) => (
										<ListOptionButton key={option.id} option={option} />
									))}
								</div>
							</div>
						</>
					)}
				</div>
			</PopoverContent>
		</Popover>
	)
}
