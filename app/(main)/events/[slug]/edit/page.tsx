import { TRPCError } from '@trpc/server'
import type { Metadata } from 'next'
import { notFound, unauthorized } from 'next/navigation'
import { EventForm } from '@/app/(main)/events/components'
import { getAPI } from '@/server/api'

export const metadata: Metadata = {
	title: "Edit Event · RSVP'd",
	description: 'Edit your event details and settings.',
}

export default async function EditEvent({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const api = await getAPI()
	try {
		const event = await api.event.get.edit({ slug })
		if (!event) {
			return notFound()
		}

		// If the event is found, render the edit form
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
	} catch (error) {
		console.error('Error fetching event:', error)
		if (error instanceof TRPCError && error.code.includes('FORBIDDEN')) {
			return unauthorized()
		}
		return notFound()
	}
}
