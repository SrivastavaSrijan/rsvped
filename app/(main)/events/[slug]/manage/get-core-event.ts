import { cache } from 'react'
import { getAPI } from '@/server/api'

export const getCoreEvent = cache(async (slug: string) => {
	const api = await getAPI()
	return api.event.get.core({ slug })
})
