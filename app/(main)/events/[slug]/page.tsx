import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getAPI } from '@/server/api'

export default async function ViewEvent({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const api = await getAPI()
	const _session = await auth()
	const event = await api.event.getBySlug({ slug })

	if (!event) {
		notFound()
	}

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			Maange event here
		</div>
	)
}
