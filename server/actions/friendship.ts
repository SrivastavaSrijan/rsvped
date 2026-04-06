'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'
import {
	FriendshipActionErrorCodes,
	type FriendshipActionResponse,
} from './types'

export async function sendFriendRequestAction(
	targetUserId: string
): Promise<FriendshipActionResponse> {
	const session = await auth()
	if (!session?.user) {
		return {
			success: false,
			error: FriendshipActionErrorCodes.UNAUTHORIZED,
		}
	}

	try {
		const api = await getAPI()
		await api.friendship.send({ targetUserId })
	} catch {
		return {
			success: false,
			error: FriendshipActionErrorCodes.UNEXPECTED_ERROR,
		}
	}

	revalidatePath(Routes.Auth.Profile)
	return { success: true }
}

export async function respondFriendRequestAction(
	friendshipId: string,
	action: 'accept' | 'reject'
): Promise<FriendshipActionResponse> {
	const session = await auth()
	if (!session?.user) {
		return {
			success: false,
			error: FriendshipActionErrorCodes.UNAUTHORIZED,
		}
	}

	try {
		const api = await getAPI()
		await api.friendship.respond({ friendshipId, action })
	} catch {
		return {
			success: false,
			error: FriendshipActionErrorCodes.UNEXPECTED_ERROR,
		}
	}

	revalidatePath(Routes.Auth.Profile)
	return { success: true }
}

export async function removeFriendAction(
	friendshipId: string
): Promise<FriendshipActionResponse> {
	const session = await auth()
	if (!session?.user) {
		return {
			success: false,
			error: FriendshipActionErrorCodes.UNAUTHORIZED,
		}
	}

	try {
		const api = await getAPI()
		await api.friendship.remove({ friendshipId })
	} catch {
		return {
			success: false,
			error: FriendshipActionErrorCodes.UNEXPECTED_ERROR,
		}
	}

	revalidatePath(Routes.Auth.Profile)
	return { success: true }
}
