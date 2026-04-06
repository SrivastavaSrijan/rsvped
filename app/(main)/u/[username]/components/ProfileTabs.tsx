'use client'

import { Activity, Calendar, Users, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { UserHoverCard } from '@/components/shared'
import {
	AvatarWithFallback,
	Badge,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui'
import { Routes } from '@/lib/config'
import { ActivityTypeLabels } from '@/lib/constants/labels'
import { trpc } from '@/lib/trpc'
import type { PublicProfileUser } from './types'

interface ProfileTabsProps {
	userId: string
	user: PublicProfileUser
}

export function ProfileTabs({ userId, user }: ProfileTabsProps) {
	return (
		<Tabs defaultValue="activity">
			<TabsList className="w-full justify-start">
				<TabsTrigger value="activity" className="cursor-pointer gap-1">
					<Activity className="size-4" />
					Activity
				</TabsTrigger>
				<TabsTrigger value="events" className="cursor-pointer gap-1">
					<Calendar className="size-4" />
					Events
				</TabsTrigger>
				<TabsTrigger value="communities" className="cursor-pointer gap-1">
					<Users className="size-4" />
					Communities
				</TabsTrigger>
				<TabsTrigger value="friends" className="cursor-pointer gap-1">
					<UsersRound className="size-4" />
					Friends
				</TabsTrigger>
			</TabsList>

			<TabsContent value="activity">
				<ActivityTab userId={userId} />
			</TabsContent>
			<TabsContent value="events">
				<EventsTab user={user} />
			</TabsContent>
			<TabsContent value="communities">
				<CommunitiesTab user={user} />
			</TabsContent>
			<TabsContent value="friends">
				<FriendsTab userId={userId} />
			</TabsContent>
		</Tabs>
	)
}

function ActivityTab({ userId }: { userId: string }) {
	const { data, isLoading } = trpc.activity.forUser.useQuery({
		userId,
		page: 1,
		size: 20,
	})

	if (isLoading) {
		return <TabLoading />
	}

	if (!data || data.data.length === 0) {
		return <TabEmpty message="No activity yet." />
	}

	return (
		<div className="flex flex-col gap-2 py-4">
			{data.data.map((activity) => (
				<div
					key={activity.id}
					className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-3"
				>
					<Activity className="size-4 text-muted-foreground" />
					<div className="flex flex-1 flex-col">
						<p className="text-sm text-foreground">
							{ActivityTypeLabels[activity.type]}
						</p>
						<p className="text-xs text-muted-foreground">
							{new Date(activity.createdAt).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric',
							})}
						</p>
					</div>
				</div>
			))}
		</div>
	)
}

function EventsTab({ user }: { user: PublicProfileUser }) {
	if (user.hostedEvents.length === 0) {
		return <TabEmpty message="No events hosted yet." />
	}

	return (
		<div className="flex flex-col gap-2 py-4">
			{user.hostedEvents.map((event) => (
				<Link
					key={event.id}
					href={Routes.Main.Events.ViewBySlug(event.slug)}
					className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3 transition-colors hover:bg-muted"
				>
					<div className="flex flex-col gap-0.5">
						<span className="text-sm font-medium text-foreground">
							{event.title}
						</span>
						{event.location ? (
							<span className="text-xs text-muted-foreground">
								{event.location.name}
							</span>
						) : null}
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="secondary">{event._count.rsvps} RSVPs</Badge>
						<span className="text-xs text-muted-foreground">
							{new Date(event.startDate).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
							})}
						</span>
					</div>
				</Link>
			))}
		</div>
	)
}

function CommunitiesTab({ user }: { user: PublicProfileUser }) {
	if (user.communityMemberships.length === 0) {
		return <TabEmpty message="Not a member of any communities yet." />
	}

	return (
		<div className="flex flex-col gap-2 py-4">
			{user.communityMemberships.map((membership) => (
				<Link
					key={membership.id}
					href={Routes.Main.Communities.ViewBySlug(membership.community.slug)}
					className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3 transition-colors hover:bg-muted"
				>
					<span className="text-sm font-medium text-foreground">
						{membership.community.name}
					</span>
					<Badge variant="outline">{membership.role}</Badge>
				</Link>
			))}
		</div>
	)
}

function FriendsTab({ userId }: { userId: string }) {
	const { data, isLoading } = trpc.friendship.list.useQuery({
		userId,
		page: 1,
		size: 20,
	})

	if (isLoading) {
		return <TabLoading />
	}

	if (!data || data.data.length === 0) {
		return <TabEmpty message="No friends yet." />
	}

	return (
		<div className="grid grid-cols-1 gap-3 py-4 lg:grid-cols-2">
			{data.data.map((item) => (
				<UserHoverCard key={item.id} userId={item.friend.id}>
					<Link
						href={
							item.friend.username
								? Routes.Main.Users.ViewByUsername(item.friend.username)
								: '#'
						}
						className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-3 transition-colors hover:bg-muted"
					>
						<AvatarWithFallback
							src={item.friend.image}
							name={item.friend.name ?? undefined}
							className="size-10"
						/>
						<div className="flex flex-col gap-0.5">
							<span className="text-sm font-medium text-foreground">
								{item.friend.name}
							</span>
							{item.friend.username ? (
								<span className="text-xs text-muted-foreground">
									@{item.friend.username}
								</span>
							) : null}
							{item.friend.profession ? (
								<span className="text-xs text-muted-foreground">
									{item.friend.profession}
								</span>
							) : null}
						</div>
					</Link>
				</UserHoverCard>
			))}
		</div>
	)
}

function TabLoading() {
	return (
		<div className="flex flex-col gap-2 py-4">
			{Array.from({ length: 3 }).map((_, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
					key={i}
					className="h-14 animate-pulse rounded-lg bg-secondary"
				/>
			))}
		</div>
	)
}

function TabEmpty({ message }: { message: string }) {
	return (
		<div className="flex items-center justify-center py-12">
			<p className="text-sm text-muted-foreground">{message}</p>
		</div>
	)
}
