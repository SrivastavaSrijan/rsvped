import type { Metadata } from 'next'
import { notFound, unauthorized } from 'next/navigation'
import { auth } from '@/lib/auth'
import { canUserManageEvent } from '@/lib/utils'
import { getAPI } from '@/server/api'
import { EventForm } from '../../../components/EventForm'

export const metadata: Metadata = {
	title: "Edit Event · RSVP'd",
	description: 'Edit your event details and settings.',
}

export default async function EditEvent({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const api = await getAPI()
	const session = await auth()

	const event = await api.event.getBySlug({ slug })
	if (!event) {
		return notFound()
	}

	if (!canUserManageEvent(event, session?.user)) {
		return unauthorized()
	}

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<EventForm
				coverImage={{
					alt: 'Event cover',
					url: event.coverImage || '',
					color: null,
				}}
				mode="edit"
				eventSlug={slug}
				event={event}
			/>
		</div>
	)
}
