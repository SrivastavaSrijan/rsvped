'use client'

import { Check, Clock, UserMinus, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui'
import {
	removeFriendAction,
	respondFriendRequestAction,
	sendFriendRequestAction,
} from '@/server/actions'
import type { RouterOutput } from '@/server/api'

type FriendshipStatus = RouterOutput['friendship']['status']

interface FriendButtonProps {
	targetUserId: string
	status: FriendshipStatus
}

export const FriendButton = ({ targetUserId, status }: FriendButtonProps) => {
	const [isPending, startTransition] = useTransition()
	const router = useRouter()

	const handleSend = () => {
		startTransition(async () => {
			await sendFriendRequestAction(targetUserId)
			router.refresh()
		})
	}

	const handleAccept = () => {
		const id = status.friendshipId
		if (!id) return
		startTransition(async () => {
			await respondFriendRequestAction(id, 'accept')
			router.refresh()
		})
	}

	const handleRemove = () => {
		const id = status.friendshipId
		if (!id) return
		startTransition(async () => {
			await removeFriendAction(id)
			router.refresh()
		})
	}

	switch (status.status) {
		case 'none':
			return (
				<Button
					variant="default"
					size="sm"
					onClick={handleSend}
					disabled={isPending}
					className="cursor-pointer gap-1"
				>
					<UserPlus className="size-4" />
					Add Friend
				</Button>
			)
		case 'pending_sent':
			return (
				<Button variant="secondary" size="sm" disabled className="gap-1">
					<Clock className="size-4" />
					Request Sent
				</Button>
			)
		case 'pending_received':
			return (
				<Button
					variant="default"
					size="sm"
					onClick={handleAccept}
					disabled={isPending}
					className="cursor-pointer gap-1"
				>
					<Check className="size-4" />
					Accept Request
				</Button>
			)
		case 'friends':
			return (
				<Button
					variant="outline"
					size="sm"
					onClick={handleRemove}
					disabled={isPending}
					className="cursor-pointer gap-1"
				>
					<UserMinus className="size-4" />
					Unfriend
				</Button>
			)
	}
}
