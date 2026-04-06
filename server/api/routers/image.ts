import { createApi } from 'unsplash-js'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

// Lazy initialization — avoids crashing at module load when env var is missing (e.g. in tests)
let unsplashInstance: ReturnType<typeof createApi> | null = null

function getUnsplash() {
	if (!unsplashInstance) {
		const key = process.env.UNSPLASH_ACCESS_KEY
		if (!key) {
			throw new Error(
				'UNSPLASH_ACCESS_KEY is not defined in the environment variables.'
			)
		}
		unsplashInstance = createApi({ accessKey: key })
	}
	return unsplashInstance
}

function getCollectionIds() {
	return process.env.UNSPLASH_COLLECTION_IDS?.split(',') ?? []
}

export const imageRouter = createTRPCRouter({
	getRandom: publicProcedure
		.meta({
			description:
				'Get a random abstract image from a predefined Unsplash collection.',
		})
		.output(
			z.object({
				url: z.string(),
				alt: z.string(),
				user: z.object({
					name: z.string(),
					link: z.string(),
				}),
				color: z.string().nullable(),
			})
		)
		.query(async () => {
			const result = await getUnsplash().photos.getRandom({
				collectionIds: getCollectionIds(),
				count: 1,
			})

			if (result.errors) {
				console.error('Unsplash API error:', result.errors[0])
				throw new Error('Failed to fetch image from Unsplash.')
			}

			// The API returns an array even for a count of 1
			const photo = Array.isArray(result.response)
				? result.response[0]
				: result.response

			if (!photo) {
				throw new Error('No photo returned from Unsplash.')
			}

			return {
				url: photo.urls.regular,
				alt: photo.alt_description ?? 'An abstract background image',
				user: {
					name: photo.user.name,
					link: photo.user.links.html,
				},
				color: photo.color ?? null,
			}
		}),
})
