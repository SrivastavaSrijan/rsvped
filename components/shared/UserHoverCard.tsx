'use client'

import { MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { type ReactNode, useEffect, useRef, useState, useTransition } from 'react'
import {
	AvatarWithFallback,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Skeleton,
} from '@/components/ui'
import { Routes } from '@/lib/config'
import { getUserHoverCardAction } from '@/server/actions'

interface UserHoverCardData {
	id: string
	name: string | null
	image: string | null
	username?: string | null
}

interface UserHoverCardProps {
	user: UserHoverCardData
	children: ReactNode
}

interface FullHoverCardData {
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

export const UserHoverCard = ({ user, children }: UserHoverCardProps) => {
	const [fullData, setFullData] = useState<FullHoverCardData | null>(null)
	const [isPending, startTransition] = useTransition()
	const [open, setOpen] = useState(false)
	const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
	const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)

	const fetchData = () => {
		if (fullData || isPending) return
		startTransition(async () => {
			const data = await getUserHoverCardAction(user.id)
			if (data) {
				setFullData(data as FullHoverCardData)
			}
		})
	}

	const handleMouseEnter = () => {
		if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
		fetchData()
		hoverTimeoutRef.current = setTimeout(() => setOpen(true), 300)
	}

	const handleMouseLeave = () => {
		if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
		closeTimeoutRef.current = setTimeout(() => setOpen(false), 100)
	}

	const handleClick = () => {
		fetchData()
		setOpen((prev: boolean) => !prev)
	}

	useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
			if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
		}
	}, [])

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					ref={triggerRef}
					type="button"
					className="inline-flex cursor-pointer"
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onClick={handleClick}
				>
					{children}
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-72"
				side="top"
				align="start"
				onMouseEnter={() => {
					if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
				}}
				onMouseLeave={handleMouseLeave}
				onOpenAutoFocus={(e: Event) => e.preventDefault()}
			>
				{isPending || !fullData ? (
					<HoverCardSkeleton user={user} />
				) : (
					<HoverCardBody data={fullData} />
				)}
			</PopoverContent>
		</Popover>
	)
}

const HoverCardBody = ({ data }: { data: FullHoverCardData }) => {
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
					<p className="text-sm font-semibold text-foreground">{data.name}</p>
					{data.username ? (
						<p className="text-xs text-muted-foreground">@{data.username}</p>
					) : null}
					{data.profession ? (
						<p className="text-xs text-muted-foreground">{data.profession}</p>
					) : null}
				</div>
			</div>

			{data.bio ? (
				<p className="text-xs text-muted-foreground line-clamp-2">{data.bio}</p>
			) : null}

			<div className="flex items-center gap-3 text-xs text-muted-foreground">
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

const HoverCardSkeleton = ({ user }: { user: UserHoverCardData }) => {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-start gap-3">
				<AvatarWithFallback
					src={user.image}
					name={user.name ?? undefined}
					className="size-12 text-lg"
				/>
				<div className="flex flex-col gap-1">
					<p className="text-sm font-semibold text-foreground">
						{user.name ?? <Skeleton className="h-4 w-24" />}
					</p>
					<Skeleton className="h-3 w-16" />
				</div>
			</div>
			<Skeleton className="h-3 w-full" />
			<Skeleton className="h-3 w-20" />
		</div>
	)
}
