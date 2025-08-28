/**
 * WritingAssistant - Icon that shows select with enhancement options
 *
 * Hover/click → select opens with options from prompts
 * Click option → show sparkles, mutate input value
 */

'use client'

import {
	Briefcase,
	CheckCircle2,
	FileText,
	Loader2,
	Scissors,
	Sparkles,
	Wand2,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { enhanceText } from '@/server/actions/ai/universal'

interface WritingAssistantProps {
	getValue: () => string
	setValue: (value: string) => void
	context?: Record<string, unknown>
	size?: 'sm' | 'default'
}

const WRITING_OPTIONS = [
	{
		id: 'professional',
		label: 'Professional',
		icon: Briefcase,
	},
	{
		id: 'improve',
		label: 'Improve',
		icon: Wand2,
	},
	{
		id: 'fix',
		label: 'Fix Grammar',
		icon: CheckCircle2,
	},
	{
		id: 'concise',
		label: 'Make Concise',
		icon: Scissors,
	},
	{
		id: 'detailed',
		label: 'Add Details',
		icon: FileText,
	},
]

export const WritingAssistant = ({
	getValue,
	setValue,
	context = {},
	size = 'sm',
}: WritingAssistantProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [loading, setLoading] = useState<string | null>(null)

	const handleEnhance = async (type: string) => {
		const currentText = getValue()
		if (!currentText.trim()) return

		setLoading(type)

		try {
			const formData = new FormData()
			formData.append('text', currentText)
			formData.append('type', type)
			formData.append('context', JSON.stringify(context))

			const result = await enhanceText(null, formData)
			if (result.success && result.text) {
				setValue(result.text)
				setIsOpen(false)
			}
		} finally {
			setLoading(null)
		}
	}

	const text = getValue()
	const hasText = text.trim().length > 0

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size={size}
					disabled={!hasText}
					className="shrink-0 hover:bg-accent/50 data-[state=open]:bg-accent"
					title={hasText ? 'Enhance with AI' : 'Type something first'}
				>
					<Sparkles
						className={`${size === 'sm' ? 'size-3' : 'size-4'} ${hasText ? 'text-foreground' : 'text-muted-foreground'}`}
					/>
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-48 p-1">
				<div className="grid gap-0.5">
					{WRITING_OPTIONS.map((option) => {
						const IconComponent = option.icon
						const isLoading = loading === option.id

						return (
							<Button
								key={option.id}
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => handleEnhance(option.id)}
								disabled={!!loading}
								className="justify-start h-8 p-2 hover:bg-accent text-left"
							>
								<div className="flex items-center gap-2 w-full">
									{isLoading ? (
										<Loader2 className="size-3 animate-spin text-primary" />
									) : (
										<IconComponent className="size-3 text-muted-foreground" />
									)}
									<span className="text-sm">{option.label}</span>
								</div>
							</Button>
						)
					})}
				</div>
			</PopoverContent>
		</Popover>
	)
}
