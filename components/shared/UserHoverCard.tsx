'use client'

import { MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
	AvatarWithFallback,
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
	Skeleton,
} from '@/components/ui'
import { Routes } from '@/lib/config'
import { trpc } from '@/lib/trpc'

interface UserHoverCardProps {
	userId: string
	children: ReactNode
}

export function UserHoverCard({ userId, children }: UserHoverCardProps) {
	const utils = trpc.useUtils()
	const { data, isLoading } = trpc.user.profile.hoverCard.useQuery(
		{ userId },
		{ enabled: false }
	)

	return (
		<HoverCard openDelay={300} closeDelay={100}>
			<HoverCardTrigger asChild>
				<button
					type="button"
					className="inline-flex cursor-pointer"
					onMouseEnter={() => {
						utils.user.profile.hoverCard.prefetch({ userId })
					}}
				>
					{children}
				</button>
			</HoverCardTrigger>
			<HoverCardContent className="w-72" side="top" align="start">
				{isLoading || !data ? (
					<HoverCardSkeleton />
				) : (
					<HoverCardBody data={data} />
				)}
			</HoverCardContent>
		</HoverCard>
	)
}

interface HoverCardData {
	id: string
	name: string | null
	username: string | null
	image: string | null
	bio: string | null
	profession: string | null
	location: { name: string } | null
	_count: {
		sentFriendRequests: number
		receivedFriendRequests: number
	}
}

function HoverCardBody({ data }: { data: HoverCardData }) {
	const friendCount =
		data._count.sentFriendRequests + data._count.receivedFriendRequests

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-start gap-3">
				<AvatarWithFallback
					src={data.image}
					name={data.name ?? undefined}
					className="size-12 text-lg"
				/>
				<div className="flex flex-col gap-0.5">
					<p className="text-sm font-semibold text-text-primary">{data.name}</p>
					{data.username ? (
						<p className="text-xs text-text-secondary">@{data.username}</p>
					) : null}
					{data.profession ? (
						<p className="text-xs text-text-tertiary">{data.profession}</p>
					) : null}
				</div>
			</div>

			{data.bio ? (
				<p className="text-xs text-text-secondary line-clamp-2">{data.bio}</p>
			) : null}

			<div className="flex items-center gap-3 text-xs text-text-tertiary">
				{data.location ? (
					<span className="flex items-center gap-1">
						<MapPin className="size-3" />
						{data.location.name}
					</span>
				) : null}
				<span className="flex items-center gap-1">
					<Users className="size-3" />
					{friendCount} {friendCount === 1 ? 'friend' : 'friends'}
				</span>
			</div>

			{data.username ? (
				<Link
					href={Routes.Main.Users.ViewByUsername(data.username)}
					className="text-xs font-medium text-brand hover:underline"
				>
					View Profile
				</Link>
			) : null}
		</div>
	)
}

function HoverCardSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-start gap-3">
				<Skeleton className="size-12 rounded-full" />
				<div className="flex flex-col gap-1">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-3 w-16" />
				</div>
			</div>
			<Skeleton className="h-3 w-full" />
			<Skeleton className="h-3 w-20" />
		</div>
	)
}
