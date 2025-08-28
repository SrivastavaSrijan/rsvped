/**
 * AI Event Description Enhancer Component
 *
 * Provides AI-powered event description enhancement with preview and apply functionality.
 */

'use client'

import { useState } from 'react'
import {
	Alert,
	AlertDescription,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
	Textarea,
} from '@/components/ui'
import { useActionStateWithError } from '@/lib/hooks'
import {
	AIActionErrorCodeMap,
	applyEnhancedDescription,
	enhanceEventDescription,
	initialAIActionState,
} from '@/server/actions/ai'
import type { RouterOutput } from '@/server/api'

interface EventDescriptionEnhancerProps {
	event: RouterOutput['event']['get']['enhanced']
}

interface EnhancementResult {
	enhancedDescription: string
	improvements: string[]
	tone: string
}

const enhancementTypes = [
	{
		value: 'professional',
		label: 'Professional',
		description: 'Clean, clear, and business-focused',
	},
	{
		value: 'engaging',
		label: 'Engaging',
		description: 'Dynamic and exciting language',
	},
	{
		value: 'detailed',
		label: 'Detailed',
		description: 'Rich with helpful information',
	},
	{ value: 'concise', label: 'Concise', description: 'Brief and to the point' },
	{
		value: 'creative',
		label: 'Creative',
		description: 'Memorable and storytelling-focused',
	},
] as const

export function EventDescriptionEnhancer({
	event,
}: EventDescriptionEnhancerProps) {
	const [enhancementType, setEnhancementType] = useState<string>('professional')
	const [additionalContext, setAdditionalContext] = useState('')
	const [showPreview, setShowPreview] = useState(false)

	// Enhancement state
	const {
		formAction: enhanceAction,
		errorComponent: enhanceError,
		isPending: isEnhancing,
		state: enhanceState,
	} = useActionStateWithError({
		action: enhanceEventDescription,
		initialState: initialAIActionState,
		errorCodeMap: AIActionErrorCodeMap,
	})

	// Apply state
	const {
		formAction: applyAction,
		errorComponent: applyError,
		isPending: isApplying,
	} = useActionStateWithError({
		action: applyEnhancedDescription,
		initialState: initialAIActionState,
		errorCodeMap: AIActionErrorCodeMap,
	})

	const handleEnhance = async (formData: FormData) => {
		formData.append('eventSlug', event.slug)
		formData.append('currentDescription', event.description || '')
		formData.append('enhancementType', enhancementType)
		if (additionalContext) {
			formData.append('additionalContext', additionalContext)
		}

		await enhanceAction(formData)
		setShowPreview(true)
	}

	const handleApply = async () => {
		if (!enhanceState.generatedContent) return

		const formData = new FormData()
		formData.append('eventSlug', event.slug)
		formData.append('enhancedDescription', enhanceState.generatedContent)

		await applyAction(formData)
	}

	const enhancementResult = enhanceState.data as EnhancementResult | undefined

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>AI Description Enhancer</CardTitle>
					<CardDescription>
						Use AI to improve your event description with different styles and
						tones.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Current Description */}
					<div>
						<Label htmlFor="current-description">Current Description</Label>
						<Textarea
							id="current-description"
							value={event.description || ''}
							readOnly
							className="mt-2 min-h-[100px]"
							placeholder="No description provided"
						/>
					</div>

					{/* Enhancement Type Selection */}
					<div>
						<Label htmlFor="enhancement-type">Enhancement Style</Label>
						<Select value={enhancementType} onValueChange={setEnhancementType}>
							<SelectTrigger className="mt-2">
								<SelectValue placeholder="Select enhancement style" />
							</SelectTrigger>
							<SelectContent>
								{enhancementTypes.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										<div>
											<div className="font-medium">{type.label}</div>
											<div className="text-sm text-muted-foreground">
												{type.description}
											</div>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Additional Context */}
					<div>
						<Label htmlFor="additional-context">
							Additional Context (Optional)
						</Label>
						<Textarea
							id="additional-context"
							value={additionalContext}
							onChange={(e) => setAdditionalContext(e.target.value)}
							className="mt-2"
							placeholder="Provide any additional context or specific requirements..."
							rows={3}
						/>
					</div>

					{/* Enhance Button */}
					<form action={handleEnhance}>
						<Button type="submit" disabled={isEnhancing || !event.description}>
							{isEnhancing ? 'Enhancing...' : 'Enhance Description'}
						</Button>
					</form>

					{enhanceError}
				</CardContent>
			</Card>

			{/* Preview Enhanced Description */}
			{showPreview && enhanceState.success && enhanceState.generatedContent && (
				<Card>
					<CardHeader>
						<CardTitle>Enhanced Description Preview</CardTitle>
						<CardDescription>
							Review the AI-generated description before applying it to your
							event.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Enhanced Description */}
						<div>
							<Label>Enhanced Description</Label>
							<Textarea
								value={enhanceState.generatedContent}
								readOnly
								className="mt-2 min-h-[150px]"
							/>
						</div>

						{/* Improvements Summary */}
						{enhancementResult?.improvements && (
							<div>
								<Label>Key Improvements</Label>
								<div className="mt-2 space-y-1">
									{enhancementResult.improvements.map((improvement) => (
										<div
											key={improvement}
											className="text-sm text-muted-foreground flex items-start gap-2"
										>
											<span className="text-primary">•</span>
											<span>{improvement}</span>
										</div>
									))}
								</div>
							</div>
						)}

						<Separator />

						{/* Action Buttons */}
						<div className="flex gap-3">
							<Button onClick={handleApply} disabled={isApplying}>
								{isApplying ? 'Applying...' : 'Apply Enhanced Description'}
							</Button>
							<Button
								variant="outline"
								onClick={() => setShowPreview(false)}
								disabled={isApplying}
							>
								Generate New Version
							</Button>
						</div>

						{applyError}
					</CardContent>
				</Card>
			)}

			{/* Error State */}
			{enhanceState.errorCode && (
				<Alert variant="destructive">
					<AlertDescription>
						{AIActionErrorCodeMap[enhanceState.errorCode]}
					</AlertDescription>
				</Alert>
			)}
		</div>
	)
}
