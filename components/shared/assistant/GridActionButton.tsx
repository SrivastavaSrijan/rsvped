'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import type { ActionOption, EnhancementType } from './types'

interface GridActionButtonProps {
	action: ActionOption
	loading: EnhancementType | 'suggestions' | null
	onEnhance: (type: EnhancementType) => void
	disabled?: boolean
}

export const GridActionButton = ({
	action,
	loading,
	onEnhance,
	disabled = false,
}: GridActionButtonProps) => {
	const isLoading = loading === action.id
	const IconComponent = action.icon

	return (
		<Button
			type="button"
			variant="secondary"
			size="sm"
			onClick={() => onEnhance(action.id)}
			disabled={disabled}
			className="flex flex-col h-auto p-2 text-center hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-200 text-white hover:text-white"
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
