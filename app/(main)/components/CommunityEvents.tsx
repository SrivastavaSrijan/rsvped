import { Plus } from 'lucide-react'
import Link from 'next/link'
import { EventCalendar } from '@/components/shared'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'
import {
	type CreateEventListParams,
	createEventListParams,
	ProgressiveEventsList,
} from './index'

interface CommunityEventsProps extends CreateEventListParams {}

export const CommunityEvents = async ({
	period,
	page,
	...props
}: CommunityEventsProps) => {
	const api = await getAPI()
	const params = createEventListParams({ period, ...props })
	const coreEvents = await api.event.list.core(params)

	return (
		<div className="grid grid-cols-12 lg:gap-4 gap-4">
			<div className="col-span-12 lg:col-span-4 lg:order-2 flex lg:flex-col flex-row gap-4">
				<Link href={Routes.Main.Events.Create} passHref>
					<Button variant="secondary">
						<Plus />
						Submit Event
					</Button>
				</Link>
				<EventCalendar />
			</div>
			<div className="col-span-12 lg:col-span-8 lg:order-1 flex flex-col gap-4 lg:gap-8">
				<ProgressiveEventsList coreEvents={coreEvents} params={params} />
			</div>
		</div>
	)
}
