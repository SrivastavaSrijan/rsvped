import { LocationType, MembershipRole, RsvpStatus } from '@prisma/client'
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
	[MembershipRole.MEMBER]: 'secondary',
	[MembershipRole.MODERATOR]: 'outline',
}
