'use client'
import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface FallbackImageProps extends ImageProps {
	className?: string
}

export function FallbackImage({ className, ...props }: FallbackImageProps) {
	const [error, setError] = useState(false)
	const [loaded, setLoaded] = useState(false)

	const { width, height, fill } = props

	return (
		<div
			className={cn('relative overflow-hidden', className)}
			style={!fill ? { width, height } : undefined}
		>
			{!loaded && !error && <Skeleton className="absolute inset-0" />}
			{error ? (
				<div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
					404
				</div>
			) : (
				<Image
					{...props}
					className={cn('object-cover', loaded ? 'opacity-100' : 'opacity-0')}
					onLoadingComplete={() => setLoaded(true)}
					onError={() => setError(true)}
				/>
			)}
		</div>
	)
}
