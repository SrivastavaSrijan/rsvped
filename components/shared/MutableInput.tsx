/**
 * SmartInput - Uncontrolled input with AI plugins
 *
 * Works with server actions, form submissions, and defaultValue.
 * Plugins can read/write the DOM input value directly.
 */

'use client'

import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface MutableInputProps {
	name: string
	defaultValue?: string
	placeholder?: string
	disabled?: boolean
	className?: string
	type?: 'input' | 'textarea'
	rows?: number
	autoFocus?: boolean
	variant?: 'naked' | 'outlined' | 'filled'
	// Plugin children get access to input mutations
	children?:
		| React.ReactNode
		| ((mutations: {
				getValue: () => string
				setValue: (value: string) => void
				getElement: () => HTMLInputElement | HTMLTextAreaElement | null
		  }) => React.ReactNode)
}

export const MutableInput = ({
	name,
	defaultValue = '',
	placeholder,
	disabled,
	className,
	type = 'input',
	rows = 4,
	autoFocus,
	variant,
	children,
}: MutableInputProps) => {
	const inputRef = useRef<HTMLInputElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	// Mutation methods exposed to child plugins
	const mutations = {
		getValue: () => {
			const element =
				type === 'textarea' ? textareaRef.current : inputRef.current
			return element?.value || ''
		},
		setValue: (value: string) => {
			const element =
				type === 'textarea' ? textareaRef.current : inputRef.current
			if (element) {
				element.value = value
				// Trigger change event so form libraries notice
				element.dispatchEvent(new Event('input', { bubbles: true }))
			}
		},
		getElement: () =>
			type === 'textarea' ? textareaRef.current : inputRef.current,
	}

	return (
		<div className="relative">
			<div className="flex items-start gap-2">
				{type === 'textarea' ? (
					<Textarea
						ref={textareaRef}
						name={name}
						defaultValue={defaultValue}
						placeholder={placeholder}
						disabled={disabled}
						rows={rows}
						className={className}
						variant={variant}
					/>
				) : (
					<Input
						ref={inputRef}
						name={name}
						defaultValue={defaultValue}
						placeholder={placeholder}
						disabled={disabled}
						className={className}
						autoFocus={autoFocus}
						variant={variant}
					/>
				)}

				{/* Plugins render here */}
				{children && (
					<div className="flex items-center gap-1 mt-1 shrink-0">
						{typeof children === 'function' ? children(mutations) : children}
					</div>
				)}
			</div>
		</div>
	)
}
