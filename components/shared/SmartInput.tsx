'use client'

import { useEffect, useRef, useState } from 'react'
import { Input, type InputProps } from '@/components/ui/input'
import { Textarea, type TextareaProps } from '@/components/ui/textarea'
import { SuggestionChips } from './SuggestionChips'
import { WritingAssistant } from './WritingAssistant'

type BaseInputProps = InputProps & {
	variant?: 'naked' | 'outlined' | 'filled'
}

type BaseTextareaProps = TextareaProps & {
	variant?: 'naked' | 'outlined' | 'filled'
}

interface SmartInputProps extends Omit<BaseInputProps, 'type'> {
	type?: 'input' | 'textarea'
	rows?: number
	textareaProps?: Omit<
		BaseTextareaProps,
		| 'name'
		| 'defaultValue'
		| 'placeholder'
		| 'disabled'
		| 'rows'
		| 'className'
		| 'variant'
	>
	suggestions?: {
		enabled: boolean
		promptTemplate?: (
			value: string,
			context?: Record<string, unknown>
		) => string
		minLength?: number
		props?: Omit<
			React.ComponentProps<typeof SuggestionChips>,
			'getValue' | 'setValue' | 'promptTemplate' | 'minLength'
		>
	}
	assistant?: {
		enabled: boolean
		size?: 'sm' | 'default'
		props?: Omit<
			React.ComponentProps<typeof WritingAssistant>,
			'getValue' | 'setValue' | 'size'
		>
	}
	context?: Record<string, unknown>
	children?: React.ReactNode
}

export const SmartInput = ({
	name,
	defaultValue = '',
	placeholder,
	disabled,
	className,
	type = 'input',
	rows = 4,
	textareaProps,
	suggestions = { enabled: false },
	assistant = { enabled: false },
	context = {},
	children,
	...restProps
}: SmartInputProps) => {
	const inputRef = useRef<HTMLInputElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	// Track input value to ensure we can access it reliably
	const [inputValue, setInputValue] = useState(defaultValue || '')

	// Update internal state when input changes
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setInputValue(e.target.value)
	}

	// Ensure defaultValue gets set in our internal state
	useEffect(() => {
		setInputValue(defaultValue || '')
	}, [defaultValue])

	// Fixed mutations for accessing/updating input value
	const mutations = {
		getValue: () => {
			// Reliably return the current input value
			return String(inputValue)
		},
		setValue: (value: string) => {
			// Update our internal state
			setInputValue(value)

			// Update the actual DOM element
			const element =
				type === 'textarea' ? textareaRef.current : inputRef.current
			if (element) {
				element.value = value
				// Trigger synthetic event for React and form libraries
				const event = new Event('input', { bubbles: true })
				Object.defineProperty(event, 'target', {
					writable: false,
					value: { value },
				})
				element.dispatchEvent(event)
			}
		},
	}

	return (
		<div className="relative">
			<div className="flex items-start gap-2">
				{type === 'textarea' ? (
					<Textarea
						ref={textareaRef}
						name={name}
						defaultValue={defaultValue}
						value={inputValue}
						onChange={handleInputChange}
						placeholder={placeholder}
						disabled={disabled}
						rows={rows}
						className={className}
						{...textareaProps}
					/>
				) : (
					<Input
						ref={inputRef}
						name={name}
						defaultValue={defaultValue}
						value={inputValue}
						onChange={handleInputChange}
						placeholder={placeholder}
						disabled={disabled}
						className={className}
						{...restProps}
					/>
				)}

				{/* Show assistant button only if enabled */}
				{assistant.enabled && (
					<div className="flex items-center gap-1 mt-1 shrink-0">
						<WritingAssistant
							getValue={mutations.getValue}
							setValue={mutations.setValue}
							context={context}
							size={assistant.size}
							{...assistant.props}
						/>
						{children}
					</div>
				)}

				{/* Show children if assistant is disabled */}
				{!assistant.enabled && children && (
					<div className="flex items-center gap-1 mt-1 shrink-0">
						{children}
					</div>
				)}
			</div>

			{/* Only render suggestions if enabled and template is provided */}
			{suggestions.enabled && suggestions.promptTemplate && (
				<div className="mt-2">
					<SuggestionChips
						getValue={mutations.getValue}
						setValue={mutations.setValue}
						promptTemplate={suggestions.promptTemplate}
						context={context}
						minLength={suggestions.minLength}
						{...suggestions.props}
					/>
				</div>
			)}
		</div>
	)
}
