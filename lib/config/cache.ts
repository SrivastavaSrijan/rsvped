export const CacheTags = {
	Event: {
		Root: 'event',
		Nearby(locationId: string) {
			return `${this.Root}/nearby/${locationId}`
		},
	},
	Category: {
		Root: 'category',
		Nearby(locationId: string) {
			return `${this.Root}/nearby/${locationId}`
		},
	},
	Community: {
		Root: 'community',
		Nearby(locationId: string) {
			return `${this.Root}/nearby/${locationId}`
		},
	},
	Location: {
		Root: 'location',
		get List() {
			return `${this.Root}/list`
		},
		get Default() {
			return `${this.Root}/default`
		},
	},
} as const

export type CacheTag = (typeof CacheTags)[keyof typeof CacheTags]
