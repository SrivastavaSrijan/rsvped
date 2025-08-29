'use client'

import { LocationType } from '@prisma/client'
import {
	Globe,
	Loader,
	LocateIcon,
	Lock,
	MapPin,
	PartyPopper,
	Settings2,
	Text,
	Timer,
	Users,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Form } from '@/components/shared'
import { SmartInput } from '@/components/shared/assistant'
import {
	Button,
	DateTimePicker,
	Image,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Switch,
} from '@/components/ui'
import { TimezoneConfig } from '@/lib/config'
import { LocationTypeLabels } from '@/lib/constants'
import { useActionStateWithError } from '@/lib/hooks'
import {
	EventActionErrorCodeMap,
	type EventActionResponse,
	saveEvent,
} from '@/server/actions'
import { EventPrompts } from '@/server/actions/ai/prompts'
import type { RouterOutput } from '@/server/api'

interface EventFormProps {
	coverImage: {
		url: string
		alt: string
		color: string | null
	}
	mode?: 'create' | 'edit'
	eventSlug?: string
	event?: RouterOutput['event']['get']['edit']
}

const initialEventState: EventActionResponse = {
	success: false,
}

export function EventForm({
	coverImage,
	mode = 'create',
	eventSlug,
	event,
}: EventFormProps) {
	const [startDate, setStartDate] = useState<Date | undefined>(() => {
		if (event?.startDate) return new Date(event.startDate)
		const aWeekFromNow = new Date()
		aWeekFromNow.setDate(aWeekFromNow.getDate() + 7)
		return aWeekFromNow
	})

	const [endDate, setEndDate] = useState<Date | undefined>(() => {
		if (event?.endDate) return new Date(event.endDate)
		const aWeekFromNowPlusAnHour = new Date()
		aWeekFromNowPlusAnHour.setDate(aWeekFromNowPlusAnHour.getDate() + 7)
		aWeekFromNowPlusAnHour.setHours(aWeekFromNowPlusAnHour.getHours() + 1)
		return aWeekFromNowPlusAnHour
	})

	const [locationType, setLocationType] = useState<LocationType>(
		event?.locationType || LocationType.PHYSICAL
	)

	const isEditMode = mode === 'edit'

	const { formAction, errorComponent, isPending, state } =
		useActionStateWithError({
			action: saveEvent,
			initialState: initialEventState,
			errorCodeMap: EventActionErrorCodeMap,
			displayMode: 'inline',
		})

	const searchParams = useSearchParams()

	// Extract field errors from state
	const fieldErrors = state?.fieldErrors || {}

	// Build AI context for this form
	const createAIContext = (
		field: string,
		additionalMetadata?: Record<string, unknown>
	) => ({
		domain: 'events',
		page: isEditMode ? 'edit' : 'create',
		field,
		location: event?.location?.name,
		metadata: {
			locationType: locationType,
			startDate: startDate?.toLocaleDateString(),
			eventTitle: event?.title,
			...additionalMetadata,
		},
	})

	return (
		<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
			<div className="flex flex-col items-center justify-center lg:col-span-1">
				<Image
					fill
					src={coverImage.url}
					alt={coverImage.alt}
					className="h-auto w-full rounded-xl object-cover"
					sizes={{ md: '50vw', sm: '100vw' }}
					wrapperClassName="relative aspect-square h-auto w-full max-w-[350px] rounded-xl shadow-lg lg:max-w-[340px]"
					wrapperStyle={{ backgroundColor: coverImage.color || 'transparent' }}
				/>
			</div>
			<div className="w-full px-2 lg:col-span-2 lg:px-0">
				<Form action={formAction} className="flex flex-col gap-4">
					<Input
						type="hidden"
						name="coverImage"
						value={event?.coverImage || coverImage.url}
					/>
					<Input
						type="hidden"
						name="next"
						value={searchParams.get('next') || ''}
					/>

					{isEditMode && eventSlug && (
						<Input type="hidden" name="slug" value={eventSlug} />
					)}

					{/* Title with direct EventPrompts call */}
					<div className="flex flex-col gap-1">
						<SmartInput
							name="title"
							placeholder="Event Name"
							defaultValue={event?.title || ''}
							variant="naked"
							autoFocus
							className="min-h-8 w-full p-2 font-semibold font-serif font-stretch-semi-condensed text-3xl lg:min-h-16 lg:p-2 lg:text-4xl"
							assistant={{
								enabled: true,
								context: createAIContext('title'),
								generatePrompt: (currentValue: string) =>
									EventPrompts.title(currentValue, {
										description: event?.description ?? undefined,
										locationType: locationType,
										startDate: startDate?.toLocaleDateString(),
									}),
							}}
						/>
						{fieldErrors.title && (
							<p className="text-destructive text-sm">{fieldErrors.title[0]}</p>
						)}
					</div>

					{/* Date & Time Section */}
					<div className="flex grid-cols-1 flex-col gap-4 lg:grid lg:grid-cols-3">
						<div className="col-span-2 flex flex-col gap-3 rounded-lg bg-white/10 p-3 lg:gap-3">
							<div className="flex items-center gap-2">
								<Timer className="size-3" />
								<h3 className="font-semibold text-sm">Date & Time</h3>
							</div>
							<div className="flex flex-col gap-2">
								<DateTimePicker date={startDate} setDate={setStartDate} />
								<Input
									type="hidden"
									name="startDate"
									value={startDate?.toISOString()}
								/>
								{fieldErrors.startDate && (
									<p className="text-destructive text-sm">
										{fieldErrors.startDate[0]}
									</p>
								)}
							</div>
							<div className="flex flex-col gap-2">
								<DateTimePicker date={endDate} setDate={setEndDate} />
								<Input
									type="hidden"
									name="endDate"
									value={endDate?.toISOString()}
								/>
								{fieldErrors.endDate && (
									<p className="text-destructive text-sm">
										{fieldErrors.endDate[0]}
									</p>
								)}
							</div>
						</div>
						<div className="col-span-1 flex flex-col gap-3 rounded-lg bg-white/10 p-3 lg:gap-3">
							<div className="flex items-center gap-2">
								<Globe className="size-3" />
								<h3 className="font-semibold text-sm">Timezone</h3>
							</div>
							<span className="text-sm">{TimezoneConfig.current}</span>
							<Input
								type="hidden"
								name="timezone"
								value={TimezoneConfig.current}
							/>
						</div>
					</div>

					<div className="flex flex-col gap-3 rounded-lg bg-white/10 p-3 lg:gap-3">
						<div className="flex items-center gap-2">
							<Text className="size-3" />
							<h3 className="font-semibold text-sm">Details</h3>
						</div>
						<div className="flex flex-col gap-3">
							{/* Description with direct EventPrompts call */}
							<SmartInput
								name="description"
								placeholder="Add Description"
								variant="naked"
								defaultValue={event?.description || ''}
								assistant={{
									enabled: true,
									context: createAIContext('description', {
										currentTitle: event?.title,
									}),
									generatePrompt: (currentValue: string) =>
										EventPrompts.description(currentValue, {
											title: event?.title,
											locationType: locationType,
											startDate: startDate?.toLocaleDateString(),
										}),
								}}
							/>
							{fieldErrors.description && (
								<p className="text-destructive text-xs">
									{fieldErrors.description[0]}
								</p>
							)}
						</div>
					</div>

					{/* Location section */}
					<div className="flex flex-col gap-3 rounded-lg bg-white/10 p-3 lg:gap-3">
						<div className="flex items-center gap-2">
							<LocateIcon className="size-3" />
							<h3 className="font-semibold text-sm">Location</h3>
						</div>
						<div className="flex flex-col gap-3">
							{/* Location & Description */}
							<Input type="hidden" name="locationType" value={locationType} />
							<div className="flex flex-col gap-1">
								<Select
									name="locationType"
									defaultValue={locationType}
									onValueChange={(value) =>
										setLocationType(value as LocationType)
									}
								>
									<SelectTrigger className="flex h-auto w-full justify-start gap-2 rounded-lg bg-white/10 p-2">
										<MapPin className="size-3" />
										<SelectValue placeholder="Select event location type">
											{LocationTypeLabels[locationType]}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={LocationType.PHYSICAL}>
											{LocationTypeLabels[LocationType.PHYSICAL]}
										</SelectItem>
										<SelectItem value={LocationType.ONLINE}>
											{LocationTypeLabels[LocationType.ONLINE]}
										</SelectItem>
										<SelectItem value={LocationType.HYBRID}>
											{LocationTypeLabels[LocationType.HYBRID]}
										</SelectItem>
									</SelectContent>
								</Select>
								{fieldErrors.locationType && (
									<p className="text-destructive text-sm">
										{fieldErrors.locationType[0]}
									</p>
								)}
							</div>

							{(locationType === LocationType.PHYSICAL ||
								locationType === LocationType.HYBRID) && (
								<div className="grid grid-cols-3 gap-2">
									<div className="flex flex-col gap-1">
										<Input
											name="venueName"
											placeholder="Venue Name"
											defaultValue={event?.venueName || ''}
											className="col-span-1"
										/>
										{fieldErrors.venueName && (
											<p className="text-destructive text-sm">
												{fieldErrors.venueName[0]}
											</p>
										)}
									</div>
									<div className="col-span-2 flex flex-col gap-1">
										<Input
											name="venueAddress"
											placeholder="Address"
											defaultValue={event?.venueAddress || ''}
										/>
										{fieldErrors.venueAddress && (
											<p className="text-destructive text-sm">
												{fieldErrors.venueAddress[0]}
											</p>
										)}
									</div>
								</div>
							)}

							{(locationType === LocationType.ONLINE ||
								locationType === LocationType.HYBRID) && (
								<div className="flex flex-col gap-1">
									<Input
										name="onlineUrl"
										placeholder="Zoom/Google Meet Link"
										defaultValue={event?.onlineUrl || ''}
									/>
									{fieldErrors.onlineUrl && (
										<p className="text-destructive text-sm">
											{fieldErrors.onlineUrl[0]}
										</p>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Event Options */}
					<div className="flex flex-col gap-3 rounded-lg bg-white/10 p-3 lg:gap-3">
						<div className="mb-2 flex items-center gap-2">
							<Settings2 className="size-3" />
							<h3 className="font-semibold text-sm">Options</h3>
						</div>
						<div className="flex flex-col gap-3">
							<div className="flex h-auto items-center justify-between text-left">
								<div className="flex items-center gap-2">
									<Lock className="size-3" />
									<span className="font-medium text-sm">Require Approval</span>
								</div>
								<Switch
									name="requiresApproval"
									defaultChecked={event?.requiresApproval || false}
									value={event?.requiresApproval ? 'true' : 'false'}
								/>
							</div>
							<div className="flex h-auto w-full items-center justify-between text-left">
								<div className="flex items-center gap-2">
									<Users className="size-3" />
									<span className="font-medium text-sm">Capacity</span>
								</div>
								<div className="flex flex-col gap-1">
									<Input
										min={1}
										max={10000}
										name="capacity"
										variant="naked"
										type="number"
										className="w-[calc(5ch+24px)] text-right"
										placeholder="∞"
										defaultValue={event?.capacity?.toString() || ''}
									/>
									{fieldErrors.capacity && (
										<p className="text-destructive text-sm">
											{fieldErrors.capacity[0]}
										</p>
									)}
								</div>
							</div>
						</div>
					</div>

					{errorComponent}

					<Button
						size="lg"
						type="submit"
						disabled={isPending}
						className="flex flex-row items-center justify-center gap-2 text-base"
					>
						{isPending ? (
							<Loader className="size-3 animate-spin" />
						) : (
							<PartyPopper className="size-3" />
						)}
						{isEditMode ? 'Update Event' : 'Create Event'}
					</Button>
				</Form>
			</div>
		</div>
	)
}
