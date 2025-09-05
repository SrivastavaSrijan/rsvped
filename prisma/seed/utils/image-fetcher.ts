/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
import { faker } from '@faker-js/faker'
import { logger } from '../utils'
import { config, limits } from './config'
import { ExternalAPIError } from './errors'

export async function fetchUnsplashImages(
	count = limits.maxUnsplashImages
): Promise<string[]> {
	const operation = logger.startOperation('fetch_unsplash_images')

	try {
		if (!config.UNSPLASH_ACCESS_KEY) {
			logger.warn('No Unsplash access key provided, using placeholder images')
			return Array.from({ length: count }, () =>
				faker.image.urlPicsumPhotos({ width: 1200, height: 630 })
			)
		}

		const maxPerPage = 10
		const totalPages = Math.ceil(count / maxPerPage)
		const allImages: string[] = []

		for (let page = 1; page <= totalPages; page++) {
			const perPage = Math.min(maxPerPage, count - allImages.length)
			const url = `https://api.unsplash.com/collections/${config.UNSPLASH_COLLECTION_ID}/photos?per_page=${perPage}&page=${page}&client_id=${config.UNSPLASH_ACCESS_KEY}`

			const res = await fetch(url)
			if (!res.ok) {
				throw new ExternalAPIError(
					`Failed to fetch images from page ${page}`,
					'unsplash',
					res.status
				)
			}

			const data: any[] = await res.json()
			const pageImages = data.map((p) => p.urls?.regular).filter(Boolean)
			allImages.push(...pageImages)

			// If we got fewer images than requested, we've reached the end
			if (pageImages.length < perPage) {
				break
			}

			// Rate limiting
			await new Promise((resolve) => setTimeout(resolve, 100))
		}

		operation.complete({ imagesCount: allImages.length })
		return allImages
	} catch (error) {
		operation.fail(error)
		logger.warn('Unsplash failed, using placeholders', { error })
		return Array.from({ length: count }, () =>
			faker.image.urlPicsumPhotos({ width: 1200, height: 630 })
		)
	}
}
