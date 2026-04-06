'use client'

import Link from 'next/link'
import { Form } from '@/components/shared'
import {
	Button,
	Input,
	Label,
	RadioGroup,
	RadioGroupItem,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from '@/components/ui'
import { Routes } from '@/lib/config'
import { useActionStateWithError } from '@/lib/hooks'
import {
	ProfileActionErrorCodeMap,
	updateProfileAction,
} from '@/server/actions'
import type { ProfileUpdateActionResponse } from '@/server/actions/types'

interface EditProfileFormProps {
	profile: {
		name: string | null
		username?: string | null
		bio: string | null
		profession: string | null
		industry: string | null
		experienceLevel: string | null
		networkingStyle: string | null
		locationId: string | null
	}
	locations: Array<{ id: string; name: string }>
}

const initialState: ProfileUpdateActionResponse = {
	success: false,
}

export function EditProfileForm({ profile, locations }: EditProfileFormProps) {
	const { formAction, isPending, errorComponent, state } =
		useActionStateWithError({
			action: updateProfileAction,
			initialState,
			errorCodeMap: ProfileActionErrorCodeMap,
			displayMode: 'inline',
		})

	return (
		<Form action={formAction} className="flex flex-col gap-6">
			{errorComponent}

			{state.success ? (
				<div className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400">
					Profile updated successfully!
				</div>
			) : null}

			<div className="flex flex-col gap-4">
				{/* Name */}
				<div className="flex flex-col gap-2">
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						name="name"
						defaultValue={profile.name ?? ''}
						required
						placeholder="Your name"
					/>
				</div>

				{/* Username */}
				<div className="flex flex-col gap-2">
					<Label htmlFor="username">Username</Label>
					<Input
						id="username"
						name="username"
						defaultValue={profile.username ?? ''}
						required
						placeholder="lowercase_username"
						pattern="^[a-z0-9_]{3,30}$"
						title="3-30 characters, lowercase letters, numbers, or underscores"
					/>
					<p className="text-xs text-text-tertiary">
						3-30 characters. Lowercase letters, numbers, and underscores only.
					</p>
				</div>

				{/* Bio */}
				<div className="flex flex-col gap-2">
					<Label htmlFor="bio">Bio</Label>
					<Textarea
						id="bio"
						name="bio"
						defaultValue={profile.bio ?? ''}
						placeholder="Tell people about yourself..."
						maxLength={500}
						rows={3}
					/>
				</div>

				{/* Profession */}
				<div className="flex flex-col gap-2">
					<Label htmlFor="profession">Profession</Label>
					<Input
						id="profession"
						name="profession"
						defaultValue={profile.profession ?? ''}
						placeholder="e.g. Software Engineer"
					/>
				</div>

				{/* Industry */}
				<div className="flex flex-col gap-2">
					<Label htmlFor="industry">Industry</Label>
					<Input
						id="industry"
						name="industry"
						defaultValue={profile.industry ?? ''}
						placeholder="e.g. Technology"
					/>
				</div>

				{/* Experience Level */}
				<div className="flex flex-col gap-2">
					<Label htmlFor="experienceLevel">Experience Level</Label>
					<Select
						name="experienceLevel"
						defaultValue={profile.experienceLevel ?? ''}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select level" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">Not specified</SelectItem>
							<SelectItem value="JUNIOR">Junior</SelectItem>
							<SelectItem value="MID">Mid</SelectItem>
							<SelectItem value="SENIOR">Senior</SelectItem>
							<SelectItem value="EXECUTIVE">Executive</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Networking Style */}
				<div className="flex flex-col gap-2">
					<Label>Networking Style</Label>
					<RadioGroup
						name="networkingStyle"
						defaultValue={profile.networkingStyle ?? ''}
						className="flex gap-4"
					>
						<div className="flex items-center gap-2">
							<RadioGroupItem value="ACTIVE" id="ns-active" />
							<Label htmlFor="ns-active" className="font-normal">
								Active
							</Label>
						</div>
						<div className="flex items-center gap-2">
							<RadioGroupItem value="SELECTIVE" id="ns-selective" />
							<Label htmlFor="ns-selective" className="font-normal">
								Selective
							</Label>
						</div>
						<div className="flex items-center gap-2">
							<RadioGroupItem value="CASUAL" id="ns-casual" />
							<Label htmlFor="ns-casual" className="font-normal">
								Casual
							</Label>
						</div>
					</RadioGroup>
				</div>

				{/* Location */}
				<div className="flex flex-col gap-2">
					<Label htmlFor="locationId">Location</Label>
					<Select name="locationId" defaultValue={profile.locationId ?? ''}>
						<SelectTrigger>
							<SelectValue placeholder="Select location" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">Not specified</SelectItem>
							{locations.map((loc) => (
								<SelectItem key={loc.id} value={loc.id}>
									{loc.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-3">
				<Button type="submit" disabled={isPending} className="cursor-pointer">
					{isPending ? 'Saving...' : 'Save Changes'}
				</Button>
				<Link
					href={Routes.Auth.Profile}
					className="text-sm text-text-secondary hover:underline"
				>
					Cancel
				</Link>
			</div>
		</Form>
	)
}
