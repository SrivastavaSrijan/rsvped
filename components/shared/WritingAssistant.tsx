/**
 * WritingAssistant - Icon that shows select with enhancement options
 *
 * Hover/click → select opens with options from prompts
 * Click option → show sparkles, mutate input value
 */

'use client'

import { Loader2, Sparkles } from 'lucide-react'
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
	{ id: 'professional', label: 'Professional', icon: '💼' },
	{ id: 'improve', label: 'Improve', icon: '✨' },
	{ id: 'fix', label: 'Fix Grammar', icon: '✓' },
	{ id: 'concise', label: 'Concise', icon: '✂️' },
	{ id: 'detailed', label: 'Lengthen', icon: '📝' },
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

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size={size}
					disabled={!text.trim()}
					className="shrink-0"
				>
					<Sparkles className="size-3" />
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-40">
				<div className="grid gap-1">
					{WRITING_OPTIONS.map((option) => (
						<Button
							key={option.id}
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => handleEnhance(option.id)}
							disabled={!!loading}
							className="justify-start h-auto p-2"
						>
							{loading === option.id ? (
								<Loader2 className="size-3 animate-spin mr-2" />
							) : (
								<span className="mr-2">{option.icon}</span>
							)}
							<span className="text-sm">{option.label}</span>
						</Button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	)
}
