import { LocationType } from '@prisma/client'

export const LocationTypeLabels: Record<LocationType, string> = {
  [LocationType.PHYSICAL]: 'Physical',
  [LocationType.ONLINE]: 'Online',
  [LocationType.HYBRID]: 'Hybrid',
}
