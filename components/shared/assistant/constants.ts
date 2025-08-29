import {
	BarChart3,
	Briefcase,
	CheckCircle2,
	List,
	Scissors,
	Smile,
	Table,
	Wand2,
} from 'lucide-react'
import type {
	ActionOption,
	FormatActionType,
	MainActionType,
	ToneActionType,
} from './types'

export const MAIN_ACTIONS: readonly ActionOption<MainActionType>[] = [
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

export const TONE_OPTIONS: readonly ActionOption<ToneActionType>[] = [
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

export const FORMAT_OPTIONS: readonly ActionOption<FormatActionType>[] = [
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

// Button styling constants
export const BUTTON_STYLES = {
	list: 'h-7 text-left justify-start hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-200 text-white hover:text-white',
	grid: 'flex flex-col h-auto p-2 text-center hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-200 text-white hover:text-white',
} as const
