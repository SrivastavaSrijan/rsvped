'use server'

import { getAPI } from '@/server/api'

export async function getAutocompleteAction(query: string, limit = 8) {
	if (!query.trim()) return []
	const api = await getAPI()
	return api.stir.autocomplete({ query, limit })
}
