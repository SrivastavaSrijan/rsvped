'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'
import type * as React from 'react'

import { cn, getRandomColor } from '@/lib/utils'

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
	return (
		<AvatarPrimitive.Root
			data-slot="avatar"
			className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
			{...props}
		/>
	)
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
	return (
		<AvatarPrimitive.Image
			data-slot="avatar-image"
			className={cn('aspect-square size-full', className)}
			{...props}
		/>
	)
}

function AvatarFallback({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
	return (
		<AvatarPrimitive.Fallback
			data-slot="avatar-fallback"
			className={cn('bg-muted flex size-full items-center justify-center rounded-full', className)}
			{...props}
		/>
	)
}

function AvatarWithFallback({
	className,
	src,
	name,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
	src?: string | null
	name?: string
	alt?: string
}) {
	const initials = name?.charAt(0).toUpperCase() ?? ''
	return (
		<Avatar
			className={className}
			style={{ backgroundColor: getRandomColor({ seed: name, intensity: 30 }) }}
			{...props}
		>
			<AvatarImage src={src ?? undefined} alt={name} />
			<AvatarFallback className="bg-[unset]">{initials}</AvatarFallback>
		</Avatar>
	)
}

export { Avatar, AvatarImage, AvatarFallback, AvatarWithFallback }
