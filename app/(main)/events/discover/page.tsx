import type { Metadata } from 'next'
import { copy } from '../../copy'

export const metadata: Metadata = {
	title: "Discover Events  · RSVP'd",
	description: 'Explore upcoming and past events in the community and RSVP to join.',
}

export default async function DiscoverEvents() {
	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="flex w-full flex-row justify-between gap-4">
				<div className="flex flex-col gap-2 lg:gap-3">
					<h1 className="px-2 font-bold text-2xl lg:px-0 lg:text-4xl">{copy.discover.title}</h1>
					<p className="text-muted-foreground text-sm lg:text-base">{copy.discover.description}</p>
				</div>
			</div>
		</div>
	)
}
