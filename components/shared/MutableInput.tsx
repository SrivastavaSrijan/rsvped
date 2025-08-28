/**
 * MutableInput - Core input that can be mutated programmatically
 *
 * Supports plugins like WritingAssistant and SuggestionChips.
 * Exposes simple value/onChange interface + mutation methods.
 */

'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface MutableInputProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	disabled?: boolean
	className?: string
	type?: 'input' | 'textarea'
	rows?: number
	children?:
		| React.ReactNode
		| ((mutations: {
				setValue: (value: string) => void
				getValue: () => string
				isEmpty: () => boolean
		  }) => React.ReactNode)
}

export const MutableInput = ({
	value,
	onChange,
	placeholder,
	disabled,
	className,
	type = 'input',
	rows = 4,
	children,
}: MutableInputProps) => {
	const [isMutating, setIsMutating] = useState(false)

	// Mutation methods exposed to child plugins
	const mutations = {
		setValue: (newValue: string) => {
			setIsMutating(true)
			onChange(newValue)
			// Brief flash to show mutation
			setTimeout(() => setIsMutating(false), 300)
		},
		getValue: () => value,
		isEmpty: () => !value.trim(),
	}

	const InputComponent = type === 'textarea' ? Textarea : Input

	return (
		<div className="relative">
			<div className="flex items-start gap-2">
				<InputComponent
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					disabled={disabled}
					rows={type === 'textarea' ? rows : undefined}
					className={cn(
						className,
						isMutating && 'ring-2 ring-primary/20 transition-all'
					)}
				/>

				{/* Plugins render here */}
				{children && (
					<div className="flex items-center gap-1 mt-1">
						{typeof children === 'function' ? children(mutations) : children}
					</div>
				)}
			</div>
		</div>
	)
}
