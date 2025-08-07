import { createApi } from 'unsplash-js'
import { z } from 'zod'
import { tRPCErrors } from '@/server/api/errors'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

// The unsplash-js library relies on the global fetch API.
// Node.js < 18 needs a polyfill. Since your runtime is >= 20, this might not be strictly
// necessary, but it's good practice for compatibility.
// globalThis.fetch = fetch;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
if (!UNSPLASH_ACCESS_KEY) {
	throw new Error(
		'UNSPLASH_ACCESS_KEY is not defined in the environment variables.'
	)
}

const unsplash = createApi({
	accessKey: UNSPLASH_ACCESS_KEY,
})

const collectionIds = process.env.UNSPLASH_COLLECTION_IDS?.split(',') ?? []

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
			const result = await unsplash.photos.getRandom({
				collectionIds: collectionIds,
				count: 1,
			})

			if (result.errors) {
				console.error('Unsplash API error:', result.errors[0])
				tRPCErrors.external('Failed to fetch image from Unsplash')
			}

			// The API returns an array even for a count of 1
			const photo = Array.isArray(result.response)
				? result.response[0]
				: result.response

			if (!photo) {
				tRPCErrors.external('No photo returned from Unsplash')
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
