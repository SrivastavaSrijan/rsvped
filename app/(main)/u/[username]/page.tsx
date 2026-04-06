import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAPI } from '@/server/api'
import { ProfileHeader, ProfileTabs } from './components'

interface ProfilePageProps {
	params: Promise<{ username: string }>
}

export async function generateMetadata({
	params,
}: ProfilePageProps): Promise<Metadata> {
	const { username } = await params
	const api = await getAPI()
	try {
		const user = await api.user.profile.byUsername({ username })
		return {
			title: `${user.name ?? username} (@${username})`,
			description: user.bio ?? `${user.name}'s profile on RSVP'd`,
		}
	} catch {
		return { title: 'User Not Found' }
	}
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
	const { username } = await params
	const api = await getAPI()

	let user: Awaited<ReturnType<typeof api.user.profile.byUsername>>
	try {
		user = await api.user.profile.byUsername({ username })
	} catch {
		notFound()
	}

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-8 px-4 py-12">
			<ProfileHeader user={user} />
			<ProfileTabs userId={user.id} user={user} />
		</div>
	)
}
