import { notFound } from 'next/navigation'
import { EventPage } from '@/app/(main)/components'
import { getAPI } from '@/server/api'

export const generateMetadata = async ({
	params,
}: {
	params: Promise<{ slug: string }>
}) => {
	// Throw an error if needed so that PPR does not cache the page
	const { slug } = await params
	const api = await getAPI()
	const event = await api.event.getMetadata({ slug })
	return {
		title: `${event.title} · RSVP'd`,
		description: `View details for the event: ${event.title}`,
	}
}

export default async function ViewEvent({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const api = await getAPI()
	const eventPromise = api.event.get({ slug })
	const rsvpsPromise = api.event.getRsvps({ slug })
	const event = await eventPromise
	if (!event) {
		return notFound()
	}
	return (
		<div className="mx-auto flex w-full max-w-wide-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<EventPage {...event} rsvpsPromise={rsvpsPromise} />
		</div>
	)
}
