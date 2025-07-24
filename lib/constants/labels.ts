import { LocationType, RsvpStatus } from '@prisma/client'
import { VariantProps } from 'class-variance-authority'
import { badgeVariants } from '@/components/ui'

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
export const RSVPBadgeVariants: Record<RsvpStatus, BadgeVariantProps['variant']> = {
  [RsvpStatus.CONFIRMED]: 'success',
  [RsvpStatus.WAITLIST]: 'secondary',
  [RsvpStatus.CANCELLED]: 'destructive',
}
