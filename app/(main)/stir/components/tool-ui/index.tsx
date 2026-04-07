'use client'

import { GetCategoriesToolUI } from './GetCategoriesToolUI'
import { GetEventDetailsToolUI } from './GetEventDetailsToolUI'
import { SearchCommunitiesToolUI } from './SearchCommunitiesToolUI'
import { SearchEventsToolUI } from './SearchEventsToolUI'

export const StirToolUIs = () => {
	return (
		<>
			<SearchEventsToolUI />
			<SearchCommunitiesToolUI />
			<GetEventDetailsToolUI />
			<GetCategoriesToolUI />
		</>
	)
}
