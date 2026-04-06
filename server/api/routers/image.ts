import { createApi } from 'unsplash-js'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

let unsplashInstance: ReturnType<typeof createApi> | null = null

function getUnsplash(): ReturnType<typeof createApi> | null {
	if (!unsplashInstance) {
		const key = process.env.UNSPLASH_ACCESS_KEY
		if (!key) return null
		unsplashInstance = createApi({ accessKey: key })
	}
	return unsplashInstance
}

function getCollectionIds() {
	return process.env.UNSPLASH_COLLECTION_IDS?.split(',') ?? []
}

const FALLBACK_IMAGE = {
	url: 'https://picsum.photos/seed/rsvped/800/600',
	alt: 'An abstract background image',
	user: { name: 'Placeholder', link: 'https://picsum.photos' },
	color: '#1a1a2e',
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
			const unsplash = getUnsplash()
			if (!unsplash) return FALLBACK_IMAGE

			const result = await unsplash.photos.getRandom({
				collectionIds: getCollectionIds(),
				count: 1,
			})

			if (result.errors) {
				console.error('Unsplash API error:', result.errors[0])
				return FALLBACK_IMAGE
			}

			const photo = Array.isArray(result.response)
				? result.response[0]
				: result.response

			if (!photo) return FALLBACK_IMAGE

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
