'use client'
import { type Location, LocationType } from '@prisma/client'
import { Globe, MapPin, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

const LocationIcons = {
	[LocationType.PHYSICAL]: MapPin,
	[LocationType.ONLINE]: Video,
	[LocationType.HYBRID]: Globe,
} as const

interface EventLocation {
	locationType: LocationType
	venueName?: string | null
	venueAddress?: string | null
	location?: Location | null
	onlineUrl?: string | null
	className?: string
	size?: 'sm' | 'lg'
}

export const EventLocation = ({
	locationType,
	venueName,
	venueAddress,
	location,
	onlineUrl,
	className,
	size = 'sm',
}: EventLocation) => {
	const physicalAddress = location
		? ` ${location.name}, ${location.country}`
		: venueAddress
	const physicalUrl = venueAddress
		? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`
		: undefined
	switch (locationType) {
		case LocationType.PHYSICAL:
			if (!venueName) return null
			return (
				<LocationItem
					className={className}
					locationType={LocationType.PHYSICAL}
					title={venueName}
					subtitle={physicalAddress}
					href={physicalUrl}
					size={size}
				/>
			)

		case LocationType.ONLINE:
			return (
				<LocationItem
					className={className}
					locationType={LocationType.ONLINE}
					title="Zoom"
					subtitle={onlineUrl}
					size={size}
				/>
			)

		case LocationType.HYBRID:
			return (
				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-2">
						{venueName && (
							<LocationItem
								className={className}
								locationType={LocationType.PHYSICAL}
								title={venueName}
								subtitle={physicalAddress}
								href={physicalUrl}
								size={size}
							/>
						)}
						{onlineUrl && (
							<LocationItem
								className={className}
								locationType={LocationType.ONLINE}
								title="Zoom"
								subtitle={onlineUrl}
								size={size}
							/>
						)}
					</div>
				</div>
			)

		default:
			return null
	}
}

interface LocationItemProps {
	locationType: LocationType
	title: string
	subtitle?: string | null
	href?: string | null
	className?: string
	size?: 'sm' | 'lg'
}

export const LocationItem = ({
	locationType,
	title,
	subtitle,
	href,
	className,
	size = 'sm',
}: LocationItemProps) => {
	const Icon = LocationIcons[locationType]
	const titleElement = (
		<p
			className={cn(
				'truncate font-medium leading-tight',
				size === 'lg' && 'font-serif text-base'
			)}
		>
			{title}
		</p>
	)
	return (
		<div
			className={cn(
				'grid w-full grid-cols-[auto_1fr_auto] items-center text-sm',
				{ 'gap-3': size === 'lg', 'gap-2': size === 'sm' },
				className
			)}
		>
			<div
				className={
					size === 'lg' ? 'rounded-xl border border-white/5 foreground p-2' : ''
				}
			>
				<Icon className={size === 'sm' ? 'size-3' : 'size-4'} />
			</div>
			<div className="flex min-w-0 flex-col gap-1">
				{href ? (
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className="truncate font-medium hover:underline hover:underline-offset-2"
					>
						{titleElement}
					</a>
				) : (
					titleElement
				)}

				{size === 'lg' && (
					<p className="text-muted-foreground text-sm">{subtitle}</p>
				)}
			</div>
		</div>
	)
}
