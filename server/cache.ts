import { unstable_cache } from 'next/cache'
import { getAPI } from '@/server/api'

export const getCachedDefaultLocation = () =>
	unstable_cache(
		async () => {
			const api = await getAPI()
			return api.location.getDefault()
		},
		['location', 'default'],
		{ revalidate: 3600, tags: ['location'] }
	)()

export const getCachedLocations = () =>
	unstable_cache(
		async () => {
			const api = await getAPI()
			return api.location.list()
		},
		['location', 'list'],
		{ revalidate: 3600, tags: ['location'] }
	)()

export const getCachedNearbyEvents = (locationId: string, take: number) =>
	unstable_cache(
		async () => {
			const api = await getAPI()
			return api.event.listNearby({ locationId, take })
		},
		['event', 'nearby', locationId, String(take)],
		{ revalidate: 60, tags: [`event-${locationId}`] }
	)()

export const getCachedNearbyCategories = (locationId: string, take: number) =>
	unstable_cache(
		async () => {
			const api = await getAPI()
			return api.category.listNearby({ locationId, take })
		},
		['category', 'nearby', locationId, String(take)],
		{ revalidate: 300, tags: [`category-${locationId}`] }
	)()

export const getCachedNearbyCommunities = (locationId: string, take: number) =>
	unstable_cache(
		async () => {
			const api = await getAPI()
			return api.community.listNearby({ locationId, take })
		},
		['community', 'nearby', locationId, String(take)],
		{ revalidate: 300, tags: [`community-${locationId}`] }
	)()
