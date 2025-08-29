'use client'

import { useRef } from 'react'
import {
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
	useForm,
} from 'react-hook-form'
import { Textarea, type TextareaProps } from '@/components/ui'
import { useAutosizeTextArea } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { type AIContext, WritingAssistant } from '.'

type AssistantProps = {
	enabled: boolean
	context: AIContext
	generatePrompt: (currentValue: string) => string
} & Omit<React.ComponentProps<typeof WritingAssistant>, 'getValue' | 'setValue'>

interface SmartInputProps extends TextareaProps {
	assistant?: AssistantProps
	children?: React.ReactNode
}

export const SmartInput = ({
	name,
	defaultValue = '',
	placeholder,
	disabled,
	className,
	assistant = {
		enabled: false,
		context: { domain: 'general', page: 'create', field: name || 'input' },
		generatePrompt: (currentValue) => `Enhance this text: "${currentValue}"`,
	},
	children,
	...restProps
}: SmartInputProps) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const { adjustHeight } = useAutosizeTextArea(textareaRef, { padding: 4 })

	// Internal form for non-controlled usage
	const form = useForm({
		defaultValues: {
			[name || 'input']: defaultValue,
		},
	})

	const formControl = form.control
	const controlFieldName = (name || 'input') as FieldPath<FieldValues>

	const renderInput = (
		field: Parameters<ControllerProps['render']>[0]['field']
	) => {
		const mutations = {
			getValue: () => String(field.value || ''),
			setValue: (value: string) => {
				field.onChange(value)
				setTimeout(() => {
					adjustHeight()
				}, 100)
			},
		}

		return (
			<div className="relative">
				<div className="flex items-start gap-2">
					<Textarea
						{...field}
						ref={textareaRef}
						name={name}
						placeholder={placeholder}
						disabled={disabled}
						className={cn(className, 'scrollbar-thin')}
						variant={restProps.variant}
						onChange={(e) => {
							field.onChange(e)
							adjustHeight()
						}}
						{...restProps}
					/>
					{/* Show assistant button only if enabled */}
					{assistant.enabled && (
						<div className="flex items-center gap-1 mt-1 shrink-0">
							<WritingAssistant {...mutations} {...assistant} />
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
