'use server'

import { getAPI } from '@/server/api'

export async function getUserHoverCardAction(userId: string) {
	const api = await getAPI()
	return api.user.profile.hoverCard({ userId })
}
