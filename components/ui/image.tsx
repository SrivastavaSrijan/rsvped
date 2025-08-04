import NextImage, { type ImageProps as NextImageProps } from 'next/image'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { Skeleton } from './skeleton'

interface ImageProps extends Omit<NextImageProps, 'src' | 'alt'> {
	src?: NextImageProps['src']
	alt?: string
	fallbackSrc?: NextImageProps['src']
	wrapperClassName?: string
}

export const Image = ({
	src,
	alt = '',
	fallbackSrc = '/404.png',
	fill,
	sizes,
	className,
	wrapperClassName,
	...props
}: ImageProps) => {
	const [isLoading, setIsLoading] = useState(true)
	const imageSrc = src || fallbackSrc
	const computedSizes = fill && !sizes ? '100vw' : sizes

	return (
		<div className={cn('relative', wrapperClassName)}>
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
