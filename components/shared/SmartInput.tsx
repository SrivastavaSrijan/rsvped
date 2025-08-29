'use client'

import { useRef } from 'react'
import {
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
	useForm,
} from 'react-hook-form'
import { Input, type InputProps } from '@/components/ui/input'
import { Textarea, type TextareaProps } from '@/components/ui/textarea'
import { WritingAssistant } from './WritingAssistant'

type BaseInputProps = InputProps & {
	variant?: 'naked' | 'outlined' | 'filled'
}

type BaseTextareaProps = TextareaProps & {
	variant?: 'naked' | 'outlined' | 'filled'
}

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

type AssistantProps = {
	enabled: boolean
	context: AIContext // Required context
	generatePrompt?: (currentValue: string) => string
} & Omit<
	React.ComponentProps<typeof WritingAssistant>,
	'getValue' | 'setValue' | 'generatePrompt' | 'context'
>

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
	assistant?: AssistantProps
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
	assistant = {
		enabled: false,
		context: { domain: 'general', page: 'create', field: name || 'input' },
	},
	children,

	...restProps
}: SmartInputProps) => {
	const inputRef = useRef<HTMLInputElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	// Internal form for non-controlled usage
	const form = useForm({
		defaultValues: {
			[name || 'input']: defaultValue,
		},
	})

	// Use provided control or internal control
	const formControl = form.control
	const controlFieldName = (name || 'input') as FieldPath<FieldValues>

	const renderInput = (
		field: Parameters<ControllerProps['render']>[0]['field']
	) => {
		const mutations = {
			getValue: () => String(field.value || ''),
			setValue: (value: string) => {
				field.onChange(value)
			},
		}

		return (
			<div className="relative">
				<div className="flex items-start gap-2">
					{type === 'textarea' ? (
						<Textarea
							{...field}
							ref={textareaRef}
							name={name}
							placeholder={placeholder}
							disabled={disabled}
							rows={rows}
							className={className}
							{...textareaProps}
						/>
					) : (
						<Input
							{...field}
							ref={inputRef}
							name={name}
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
								{...mutations}
								generatePrompt={assistant.generatePrompt}
								{...assistant}
								context={assistant.context}
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
			</div>
		)
	}

	return (
		<Controller
			control={formControl}
			name={controlFieldName}
			defaultValue={defaultValue}
			render={({ field }) => renderInput(field)}
		/>
	)
}
