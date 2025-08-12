'use client'
import { ArrowLeft, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Form } from '@/components/shared'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
	Button,
	Card,
	CardContent,
	ScrollArea,
} from '@/components/ui'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Routes } from '@/lib/config'
import { useActionStateWithError } from '@/lib/hooks'
import { type LocationFormData, updateLocationAction } from '@/server/actions'
import { LocationActionErrorCodeMap } from '@/server/actions/constants'
import type { LocationUpdateActionResponse } from '@/server/actions/types'
import type { RouterOutput } from '@/server/api'
import { LocationDiscoverCard } from './LocationsDiscover'

const initialState: LocationUpdateActionResponse = {
	success: false,
	fieldErrors: {},
}

enum LocationStep {
	CONTINENT = 'continent',
	COUNTRY = 'country',
	LOCATION = 'location',
}

interface LocationModalProps {
	prefill: Partial<LocationFormData> | null
	locations: RouterOutput['location']['list']['core']
}

interface StepState {
	selectedContinent: string | null
	selectedCountry: string | null
	selectedLocationId: string | null
}

const STEP_CONFIG = {
	[LocationStep.CONTINENT]: {
		title: 'Where are you located?',
		description: '',
	},
	[LocationStep.COUNTRY]: {
		title: 'Which country are you in?',
		description: '',
	},
	[LocationStep.LOCATION]: {
		title: 'Which metro are you in?',
		description: '',
	},
}

export const LocationModal = ({ locations }: LocationModalProps) => {
	const { replace } = useRouter()
	const [currentStep, setCurrentStep] = useState<LocationStep>(
		LocationStep.CONTINENT
	)
	const [stepState, setStepState] = useState<StepState>({
		selectedContinent: null,
		selectedCountry: null,
		selectedLocationId: null,
	})

	const {
		state,
		formAction,
		isPending: isFormPending,
		errorComponent: locationError,
	} = useActionStateWithError({
		action: updateLocationAction,
		initialState: initialState,
		errorCodeMap: LocationActionErrorCodeMap,
		displayMode: 'inline',
	})

	const handleClose = (open: boolean) => {
		if (!open) {
			replace(Routes.Main.Events.Discover)
		}
	}

	const handleContinentSelect = (continent: string) => {
		setStepState((prev) => ({
			...prev,
			selectedContinent: continent,
			selectedCountry: null,
			selectedLocationId: null,
		}))
		setCurrentStep(LocationStep.COUNTRY)
	}

	const handleCountrySelect = (country: string) => {
		setStepState((prev) => ({
			...prev,
			selectedCountry: country,
			selectedLocationId: null,
		}))
		setCurrentStep(LocationStep.LOCATION)
	}

	const handleLocationSelect = (locationId: string) => {
		setStepState((prev) => ({ ...prev, selectedLocationId: locationId }))
	}

	const handleBack = () => {
		switch (currentStep) {
			case LocationStep.COUNTRY:
				setCurrentStep(LocationStep.CONTINENT)
				setStepState((prev) => ({
					...prev,
					selectedCountry: null,
					selectedContinent: null,
					selectedLocationId: null,
				}))
				break
			case LocationStep.LOCATION:
				setCurrentStep(LocationStep.COUNTRY)
				setStepState((prev) => ({ ...prev, selectedLocationId: null }))
				break
		}
	}

	if (state.success) {
		return (
			<Dialog open onOpenChange={handleClose}>
				<DialogContent>
					<DialogHeader className="text-center items-center">
						<div className="mb-3 flex size-10 items-center justify-center rounded-full bg-green-500/20 text-green-500 p-2">
							<Check />
						</div>
						<DialogTitle>Location Updated!</DialogTitle>
						<DialogDescription>
							Your location preference has been successfully updated.
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		)
	}

	return (
		<Dialog open onOpenChange={handleClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader className="text-left">
					{/* ShadCN Breadcrumbs */}
					<Breadcrumb className="mb-2">
						<BreadcrumbList>
							<BreadcrumbItem>
								{currentStep === LocationStep.CONTINENT ? (
									<BreadcrumbPage>Select Continent</BreadcrumbPage>
								) : (
									<BreadcrumbLink
										onClick={() => {
											setCurrentStep(LocationStep.CONTINENT)
											setStepState((prev) => ({
												...prev,
												selectedContinent: null,
												selectedCountry: null,
												selectedLocationId: null,
											}))
										}}
									>
										Select Continent
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>

							{stepState.selectedContinent && (
								<>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										{currentStep === LocationStep.COUNTRY ? (
											<BreadcrumbPage>
												{stepState.selectedContinent}
											</BreadcrumbPage>
										) : (
											<BreadcrumbLink
												onClick={() => {
													if (currentStep === LocationStep.LOCATION) {
														setCurrentStep(LocationStep.COUNTRY)
														setStepState((prev) => ({
															...prev,
															selectedLocationId: null,
														}))
													}
												}}
											>
												{stepState.selectedContinent}
											</BreadcrumbLink>
										)}
									</BreadcrumbItem>
								</>
							)}

							{stepState.selectedCountry && (
								<>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbPage>{stepState.selectedCountry}</BreadcrumbPage>
									</BreadcrumbItem>
								</>
							)}
						</BreadcrumbList>
					</Breadcrumb>

					{/* Back button */}
					{currentStep !== LocationStep.CONTINENT && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleBack}
							className="self-start -ml-2 mb-2"
						>
							<ArrowLeft className="size-3 mr-1" />
							Back
						</Button>
					)}

					<DialogTitle>{STEP_CONFIG[currentStep].title}</DialogTitle>
					<DialogDescription>
						{STEP_CONFIG[currentStep].description}
					</DialogDescription>
					{locationError}
				</DialogHeader>

				{/* Scrollable content */}
				<ScrollArea className="max-h-[60vh]">
					<div className="flex flex-col gap-4">
						{/* Continent Selection */}
						{currentStep === LocationStep.CONTINENT && (
							<div className="grid grid-cols-1 lg:grid-cols-1 gap-3">
								{Object.entries(locations.continents).map(
									([continent, data]) => (
										<Card
											key={continent}
											className="cursor-pointer hover:border-primary transition-colors p-3 lg:p-6"
											onClick={() => handleContinentSelect(continent)}
										>
											<CardContent className="flex flex-col items-center justify-center gap-3 p-0 text-center">
												<div>
													<h4 className="font-medium text-lg">{continent}</h4>
													<p className="text-sm text-muted-foreground mt-1">
														{data._count.countries}{' '}
														{data._count.countries === 1
															? 'country'
															: 'countries'}
													</p>
												</div>
											</CardContent>
										</Card>
									)
								)}
							</div>
						)}

						{/* Country Selection */}
						{currentStep === LocationStep.COUNTRY &&
							stepState.selectedContinent && (
								<div className="grid grid-cols-1 lg:grid-cols-1 gap-3">
									{Object.entries(
										locations.countries[stepState.selectedContinent]
											?.countries || {}
									).map(([country, data]) => (
										<Card
											key={country}
											className="cursor-pointer hover:border-primary transition-colors p-3 lg:p-6"
											onClick={() => handleCountrySelect(country)}
										>
											<CardContent className="flex flex-col items-center justify-center gap-3 p-0 text-center">
												<div>
													<h4 className="font-medium text-lg">{country}</h4>
													<p className="text-sm text-muted-foreground mt-1">
														{data._count.locations}{' '}
														{data._count.locations === 1
															? 'location'
															: 'locations'}
													</p>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}

						{/* Location Selection - Using the existing Location component */}
						{currentStep === LocationStep.LOCATION &&
							stepState.selectedContinent &&
							stepState.selectedCountry && (
								<div className="flex flex-col gap-4">
									<div className="grid grid-cols-1 lg:grid-cols-1 gap-3">
										{locations.countries[
											stepState.selectedContinent
										]?.countries[stepState.selectedCountry]?.locations.map(
											(location) => (
												<Card
													key={location.id}
													className="cursor-pointer transition-colors p-3 lg:p-6"
													onClick={() => handleLocationSelect(location.id)}
												>
													<CardContent className="flex items-center justify-between p-0">
														<LocationDiscoverCard {...location} />
														{stepState.selectedLocationId === location.id && (
															<Check className="size-4 text-primary" />
														)}
													</CardContent>
												</Card>
											)
										)}
									</div>
								</div>
							)}
					</div>
				</ScrollArea>
				{/* Submit Button */}
				<Form action={formAction} className="mt-2 ">
					<input
						type="hidden"
						name="locationId"
						value={stepState.selectedLocationId ?? ''}
					/>
					<Button
						type="submit"
						disabled={isFormPending || stepState.selectedLocationId === null}
						className="w-full"
					>
						Update Location
					</Button>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
