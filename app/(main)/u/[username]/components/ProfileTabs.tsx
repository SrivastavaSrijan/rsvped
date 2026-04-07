'use client'

import { Activity, Calendar, Users, UsersRound } from 'lucide-react'
import Link from 'next/link'
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
import type { RouterOutput } from '@/server/api'
import type { PublicProfileUser } from './types'

type ActivityData = RouterOutput['activity']['forUser']
type FriendsData = RouterOutput['friendship']['list']

interface ProfileTabsProps {
	user: PublicProfileUser
	activityData: ActivityData
	friendsData: FriendsData
}

export const ProfileTabs = ({
	user,
	activityData,
	friendsData,
}: ProfileTabsProps) => {
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
				<ActivityTab data={activityData} />
			</TabsContent>
			<TabsContent value="events">
				<EventsTab user={user} />
			</TabsContent>
			<TabsContent value="communities">
				<CommunitiesTab user={user} />
			</TabsContent>
			<TabsContent value="friends">
				<FriendsTab data={friendsData} />
			</TabsContent>
		</Tabs>
	)
}

const ActivityTab = ({ data }: { data: ActivityData }) => {
	if (data.data.length === 0) {
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

const EventsTab = ({ user }: { user: PublicProfileUser }) => {
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

const CommunitiesTab = ({ user }: { user: PublicProfileUser }) => {
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

const FriendsTab = ({ data }: { data: FriendsData }) => {
	if (data.data.length === 0) {
		return <TabEmpty message="No friends yet." />
	}

	return (
		<div className="grid grid-cols-1 gap-3 py-4 lg:grid-cols-2">
			{data.data.map((item) => (
				<Link
					key={item.id}
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
			))}
		</div>
	)
}

const TabEmpty = ({ message }: { message: string }) => {
	return (
		<div className="flex items-center justify-center py-12">
			<p className="text-sm text-muted-foreground">{message}</p>
		</div>
	)
}
