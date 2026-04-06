import {
	type ActivityType,
	type FriendshipStatus,
	LocationType,
	MembershipRole,
	RsvpStatus,
} from '@prisma/client'
import type { VariantProps } from 'class-variance-authority'
import type { badgeVariants } from '@/components/ui'

export const LocationTypeLabels: Record<LocationType, string> = {
	[LocationType.PHYSICAL]: 'Physical',
	[LocationType.ONLINE]: 'Online',
	[LocationType.HYBRID]: 'Hybrid',
}

export const RSVPLabels: Record<RsvpStatus, string> = {
	[RsvpStatus.CONFIRMED]: 'Going',
	[RsvpStatus.WAITLIST]: 'Waitlist',
	[RsvpStatus.CANCELLED]: 'Cancelled',
}

type BadgeVariantProps = VariantProps<typeof badgeVariants>
export const RSVPBadgeVariants: Record<
	RsvpStatus,
	BadgeVariantProps['variant']
> = {
	[RsvpStatus.CONFIRMED]: 'success',
	[RsvpStatus.WAITLIST]: 'secondary',
	[RsvpStatus.CANCELLED]: 'destructive',
}

export const MembershipLabels: Record<MembershipRole, string> = {
	[MembershipRole.ADMIN]: 'Admin',
	[MembershipRole.MEMBER]: 'Member',
	[MembershipRole.MODERATOR]: 'Moderator',
}

export const MembershipBadgeVariants: Record<
	MembershipRole,
	BadgeVariantProps['variant']
> = {
	[MembershipRole.ADMIN]: 'success',
	[MembershipRole.MEMBER]: 'default',
	[MembershipRole.MODERATOR]: 'outline',
}

export const FriendshipLabels: Record<FriendshipStatus, string> = {
	PENDING: 'Pending',
	ACCEPTED: 'Friends',
	BLOCKED: 'Blocked',
}

export const FriendshipBadgeVariants: Record<
	FriendshipStatus,
	BadgeVariantProps['variant']
> = {
	PENDING: 'secondary',
	ACCEPTED: 'success',
	BLOCKED: 'destructive',
}

export const ActivityTypeLabels: Record<ActivityType, string> = {
	RSVP_EVENT: "RSVP'd to an event",
	HOST_EVENT: 'Hosted an event',
	JOIN_COMMUNITY: 'Joined a community',
	LEAVE_COMMUNITY: 'Left a community',
	SEND_FRIEND_REQUEST: 'Sent a friend request',
	ACCEPT_FRIEND_REQUEST: 'Became friends',
}
