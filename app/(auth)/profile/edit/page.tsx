import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'
import { EditProfileForm } from './EditProfileForm'

export default async function EditProfilePage() {
	const session = await auth()
	if (!session?.user) {
		redirect(Routes.Auth.SignIn)
	}

	const api = await getAPI()
	const [profile, locationGroups] = await Promise.all([
		api.user.profile.enhanced(),
		api.location.list.core(),
	])

	if (!profile) {
		redirect(Routes.Auth.SignIn)
	}

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-6 px-4 py-12">
			<div className="flex flex-col gap-1">
				<h1 className="font-bold text-2xl text-foreground">Edit Profile</h1>
				<p className="text-sm text-muted-foreground">
					Update your profile information visible to other users.
				</p>
			</div>
			<EditProfileForm
				profile={profile}
				locations={Object.values(locationGroups.continents).flatMap(
					(g) => g.locations
				)}
			/>
		</div>
	)
}
