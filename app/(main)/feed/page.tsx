import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'
import { FeedClient } from './FeedClient'

export default async function FeedPage() {
	const session = await auth()
	if (!session?.user) {
		redirect(Routes.Auth.SignIn)
	}

	const api = await getAPI()
	const feedData = await api.activity.feed({ page: 1, size: 30 })

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-6 px-4 py-12">
			<div className="flex flex-col gap-1">
				<h1 className="font-bold text-2xl text-foreground">Activity Feed</h1>
				<p className="text-sm text-muted-foreground">
					See what your friends have been up to.
				</p>
			</div>
			<FeedClient data={feedData} />
		</div>
	)
}
