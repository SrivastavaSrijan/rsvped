import { cache, cacheTag } from 'next/cache'

export type CacheOptions<Args extends unknown[]> = {
	cacheTime?: number
	tags?: string[] | ((...args: Args) => string[])
}

export function withCache<Args extends unknown[], R>(
	fn: (...args: Args) => Promise<R>,
	options: CacheOptions<Args> = {}
) {
	return cache(
		async (...args: Args): Promise<R> => {
			'use cache'
			const result = await fn(...args)
			const tags =
				typeof options.tags === 'function'
					? options.tags(...args)
					: options.tags
			tags?.forEach((tag) => {
				cacheTag(tag)
			})
			return result
		},
		{ revalidate: options.cacheTime }
	)
}
