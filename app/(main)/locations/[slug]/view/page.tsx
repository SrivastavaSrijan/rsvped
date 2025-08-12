import { notFound } from 'next/navigation'
import { type EventListSearchParams, getAPI } from '@/server/api'
import { FilteredEventsList, LocationHeader } from '../../../components'

interface DiscoverLocationProps {
	params: Promise<{ slug: string }>
	searchParams: Promise<EventListSearchParams>
}

export default async function DiscoverLocation({
	params,
	searchParams,
}: DiscoverLocationProps) {
	const { slug } = await params
	const api = await getAPI()
	try {
		const location = await api.location.get.core({ slug })
		if (!location) {
			return notFound()
		}
		return (
			<div className="flex flex-col w-full">
				<LocationHeader {...location} />
				<div className="mx-auto flex w-full max-w-wide-page flex-col gap-4">
					<div className="flex flex-col px-3 pb-6 lg:gap-8 lg:px-8 gap-4 lg:pb-8">
						<FilteredEventsList
							where={{ locationId: location.id }}
							{...(await searchParams)}
						/>
					</div>
				</div>
			</div>
		)
	} catch (e) {
		console.log('Error fetching location:', e)
		return notFound()
	}
}
