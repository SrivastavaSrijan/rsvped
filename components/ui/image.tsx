'use client'

import NextImage, { type ImageProps as NextImageProps } from 'next/image'
import type { CSSProperties } from 'react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { Skeleton } from './skeleton'

const BREAKPOINTS = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	'2xl': 1536,
}

type ResponsiveSizes = Partial<Record<keyof typeof BREAKPOINTS, string>>

interface ImageProps extends Omit<NextImageProps, 'src' | 'alt' | 'sizes'> {
	src?: NextImageProps['src']
	alt?: string
	fallbackSrc?: NextImageProps['src']
	wrapperClassName?: string
	wrapperStyle?: CSSProperties
	sizes?: NextImageProps['sizes'] | ResponsiveSizes
}

export const Image = ({
	src,
	alt = '',
	fallbackSrc = '/404.png',
	fill,
	sizes,
	className,
	wrapperClassName,
	wrapperStyle,
	...props
}: ImageProps) => {
	const [isLoading, setIsLoading] = useState(true)
	const imageSrc = src || fallbackSrc
	let computedSizes: string | undefined

	if (fill) {
		if (sizes && typeof sizes === 'object') {
			const mediaSizes = Object.entries(sizes)
				.sort(
					([a], [b]) =>
						BREAKPOINTS[a as keyof typeof BREAKPOINTS] -
						BREAKPOINTS[b as keyof typeof BREAKPOINTS]
				)
				.map(
					([breakpoint, size]) =>
						`(max-width: ${BREAKPOINTS[breakpoint as keyof typeof BREAKPOINTS]}px) ${size}`
				)
			mediaSizes.push('100vw')
			computedSizes = mediaSizes.join(', ')
		} else {
			computedSizes = typeof sizes === 'string' ? sizes : '100vw'
		}
	} else {
		computedSizes = typeof sizes === 'string' ? sizes : undefined
	}

	return (
		<div className={cn('relative', wrapperClassName)} style={wrapperStyle}>
			{isLoading && (
				<Skeleton className={cn('absolute inset-0 h-full w-full', className)} />
			)}
			<NextImage
				{...props}
				src={imageSrc}
				alt={alt}
				fill={fill}
				sizes={computedSizes}
				className={cn(className, isLoading && 'opacity-0')}
				onLoadingComplete={() => setIsLoading(false)}
			/>
		</div>
	)
}

export default Image
