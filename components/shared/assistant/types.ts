export type AIContext = {
	domain: string
	page: string
	field: string
	location?: string
	category?: string
	metadata?: Record<string, unknown>
}

export type LucideIconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

export const ENHANCEMENT_TYPES = {
	MAIN: ['proofread', 'rewrite'] as const,
	TONE: ['friendly', 'professional', 'concise'] as const,
	FORMAT: ['keypoints', 'summary', 'table'] as const,
	CUSTOM: ['custom'] as const,
} as const

export type MainActionType = (typeof ENHANCEMENT_TYPES.MAIN)[number]
export type ToneActionType = (typeof ENHANCEMENT_TYPES.TONE)[number]
export type FormatActionType = (typeof ENHANCEMENT_TYPES.FORMAT)[number]
export type CustomActionType = (typeof ENHANCEMENT_TYPES.CUSTOM)[number]
export type EnhancementType =
	| MainActionType
	| ToneActionType
	| FormatActionType
	| CustomActionType

export type ActionOption<TType extends EnhancementType = EnhancementType> = {
	readonly id: TType
	readonly label: string
	readonly icon: LucideIconType
}

export type Suggestion = {
	text: string
	disposition: string
}

export interface WritingAssistantProps {
	getValue: () => string
	setValue: (value: string) => void
	generatePrompt: (currentValue: string) => string
	context: AIContext
	size?: 'sm' | 'default'
}
