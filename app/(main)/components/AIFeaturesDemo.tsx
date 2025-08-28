/**
 * AI Features Demo Component
 *
 * Demonstrates AI-powered content generation capabilities for events.
 */

'use client'

import { useState } from 'react'
import {
	Alert,
	AlertDescription,
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Textarea,
} from '@/components/ui'
import { useActionStateWithError } from '@/lib/hooks'
import {
	AIActionErrorCodeMap,
	generateEventDescription,
	generateEventTitles,
	initialAIActionState,
} from '@/server/actions/ai'

interface TitleSuggestion {
	title: string
	reason: string
}

interface TitleGenerationResult {
	suggestions: TitleSuggestion[]
	bestPick: string
	tips: string[]
}

interface DescriptionGenerationResult {
	description: string
	keyFeatures: string[]
	callToAction: string
	tips: string[]
}

export function AIFeaturesDemo() {
	// Title Generation State
	const [titleDescription, setTitleDescription] = useState('')
	const [titleEventType, setTitleEventType] = useState('')
	const [titleTone, setTitleTone] = useState('professional')

	// Description Generation State
	const [descTitle, setDescTitle] = useState('')
	const [descBasicInfo, setDescBasicInfo] = useState('')
	const [descTargetAudience, setDescTargetAudience] = useState('')
	const [descTone, setDescTone] = useState('professional')
	const [descLength, setDescLength] = useState('medium')

	// Title generation hook
	const {
		formAction: generateTitlesAction,
		errorComponent: titleError,
		isPending: isTitleGenerating,
		state: titleState,
	} = useActionStateWithError({
		action: generateEventTitles,
		initialState: initialAIActionState,
		errorCodeMap: AIActionErrorCodeMap,
	})

	// Description generation hook
	const {
		formAction: generateDescAction,
		errorComponent: descError,
		isPending: isDescGenerating,
		state: descState,
	} = useActionStateWithError({
		action: generateEventDescription,
		initialState: initialAIActionState,
		errorCodeMap: AIActionErrorCodeMap,
	})

	const handleGenerateTitles = async (formData: FormData) => {
		formData.append('description', titleDescription)
		formData.append('eventType', titleEventType)
		formData.append('tone', titleTone)
		await generateTitlesAction(formData)
	}

	const handleGenerateDescription = async (formData: FormData) => {
		formData.append('title', descTitle)
		formData.append('basicInfo', descBasicInfo)
		formData.append('targetAudience', descTargetAudience)
		formData.append('tone', descTone)
		formData.append('length', descLength)
		await generateDescAction(formData)
	}

	const titleResult = titleState.data as TitleGenerationResult | undefined
	const descResult = descState.data as DescriptionGenerationResult | undefined

	return (
		<div className="space-y-6">
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold">AI Content Generation</h1>
				<p className="text-muted-foreground">
					Generate compelling event titles and descriptions using AI
				</p>
			</div>

			<Tabs defaultValue="titles" className="space-y-4">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="titles">Title Generator</TabsTrigger>
					<TabsTrigger value="descriptions">Description Generator</TabsTrigger>
				</TabsList>

				{/* Title Generation Tab */}
				<TabsContent value="titles" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>AI Title Generator</CardTitle>
							<CardDescription>
								Describe your event and get compelling title suggestions
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="title-description">Event Description</Label>
								<Textarea
									id="title-description"
									value={titleDescription}
									onChange={(e) => setTitleDescription(e.target.value)}
									placeholder="Describe your event - what it's about, who it's for, what attendees will learn or experience..."
									className="mt-2"
									rows={4}
								/>
							</div>

							<div>
								<Label htmlFor="event-type">Event Type (Optional)</Label>
								<Input
									id="event-type"
									value={titleEventType}
									onChange={(e) => setTitleEventType(e.target.value)}
									placeholder="e.g., Workshop, Conference, Networking, Webinar"
									className="mt-2"
								/>
							</div>

							<div>
								<Label htmlFor="title-tone">Tone</Label>
								<Select value={titleTone} onValueChange={setTitleTone}>
									<SelectTrigger className="mt-2">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="professional">Professional</SelectItem>
										<SelectItem value="casual">Casual</SelectItem>
										<SelectItem value="creative">Creative</SelectItem>
										<SelectItem value="urgent">Urgent</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<form action={handleGenerateTitles}>
								<Button
									type="submit"
									disabled={isTitleGenerating || titleDescription.length < 10}
								>
									{isTitleGenerating ? 'Generating...' : 'Generate Titles'}
								</Button>
							</form>

							{titleError}
						</CardContent>
					</Card>

					{/* Title Results */}
					{titleState.success && titleResult && (
						<Card>
							<CardHeader>
								<CardTitle>Title Suggestions</CardTitle>
								<CardDescription>
									AI-generated title options for your event
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Best Pick */}
								<div>
									<div className="flex items-center gap-2 mb-2">
										<Badge variant="default">Recommended</Badge>
										<span className="font-medium">Best Pick</span>
									</div>
									<div className="p-3 border rounded-lg bg-primary/5">
										<p className="font-medium">{titleResult.bestPick}</p>
									</div>
								</div>

								{/* All Suggestions */}
								<div>
									<h4 className="font-medium mb-3">All Suggestions</h4>
									<div className="space-y-3">
										{titleResult.suggestions.map((suggestion) => (
											<div
												key={suggestion.title}
												className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
											>
												<p className="font-medium mb-1">{suggestion.title}</p>
												<p className="text-sm text-muted-foreground">
													{suggestion.reason}
												</p>
											</div>
										))}
									</div>
								</div>

								{/* Tips */}
								{titleResult.tips.length > 0 && (
									<div>
										<h4 className="font-medium mb-2">Tips for Great Titles</h4>
										<ul className="space-y-1">
											{titleResult.tips.map((tip) => (
												<li
													key={tip}
													className="text-sm text-muted-foreground flex items-start gap-2"
												>
													<span className="text-primary">•</span>
													<span>{tip}</span>
												</li>
											))}
										</ul>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Description Generation Tab */}
				<TabsContent value="descriptions" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>AI Description Generator</CardTitle>
							<CardDescription>
								Create compelling event descriptions from basic information
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="desc-title">Event Title</Label>
								<Input
									id="desc-title"
									value={descTitle}
									onChange={(e) => setDescTitle(e.target.value)}
									placeholder="Your event title"
									className="mt-2"
								/>
							</div>

							<div>
								<Label htmlFor="desc-basic-info">Basic Information</Label>
								<Textarea
									id="desc-basic-info"
									value={descBasicInfo}
									onChange={(e) => setDescBasicInfo(e.target.value)}
									placeholder="Key details about your event - date, time, location, main topics, speakers, activities..."
									className="mt-2"
									rows={4}
								/>
							</div>

							<div>
								<Label htmlFor="desc-audience">
									Target Audience (Optional)
								</Label>
								<Input
									id="desc-audience"
									value={descTargetAudience}
									onChange={(e) => setDescTargetAudience(e.target.value)}
									placeholder="e.g., Developers, Marketing professionals, Entrepreneurs"
									className="mt-2"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="desc-tone">Tone</Label>
									<Select value={descTone} onValueChange={setDescTone}>
										<SelectTrigger className="mt-2">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="professional">Professional</SelectItem>
											<SelectItem value="casual">Casual</SelectItem>
											<SelectItem value="creative">Creative</SelectItem>
											<SelectItem value="formal">Formal</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="desc-length">Length</Label>
									<Select value={descLength} onValueChange={setDescLength}>
										<SelectTrigger className="mt-2">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="short">Short</SelectItem>
											<SelectItem value="medium">Medium</SelectItem>
											<SelectItem value="detailed">Detailed</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<form action={handleGenerateDescription}>
								<Button
									type="submit"
									disabled={
										isDescGenerating ||
										descTitle.length < 5 ||
										descBasicInfo.length < 10
									}
								>
									{isDescGenerating ? 'Generating...' : 'Generate Description'}
								</Button>
							</form>

							{descError}
						</CardContent>
					</Card>

					{/* Description Results */}
					{descState.success && descResult && (
						<Card>
							<CardHeader>
								<CardTitle>Generated Description</CardTitle>
								<CardDescription>
									AI-created description for your event
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Main Description */}
								<div>
									<Label>Description</Label>
									<Textarea
										value={descResult.description}
										readOnly
										className="mt-2 min-h-[150px]"
									/>
								</div>

								{/* Key Features */}
								{descResult.keyFeatures.length > 0 && (
									<div>
										<Label>Key Features</Label>
										<div className="mt-2 space-y-1">
											{descResult.keyFeatures.map((feature) => (
												<div key={feature} className="flex items-start gap-2">
													<span className="text-primary">•</span>
													<span className="text-sm">{feature}</span>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Call to Action */}
								<div>
									<Label>Call to Action</Label>
									<div className="mt-2 p-3 border rounded-lg bg-primary/5">
										<p className="text-sm font-medium">
											{descResult.callToAction}
										</p>
									</div>
								</div>

								{/* Tips */}
								{descResult.tips.length > 0 && (
									<div>
										<Label>Writing Tips</Label>
										<div className="mt-2 space-y-1">
											{descResult.tips.map((tip) => (
												<div key={tip} className="flex items-start gap-2">
													<span className="text-primary">•</span>
													<span className="text-sm text-muted-foreground">
														{tip}
													</span>
												</div>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>

			{/* AI Status Alert */}
			<Alert>
				<AlertDescription>
					AI features are powered by Llama 3.1 70B. Generated content should be
					reviewed and customized for your specific needs.
				</AlertDescription>
			</Alert>
		</div>
	)
}
