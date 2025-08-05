export const CacheTags = {
	Event: {
		Root: 'event',
		get List() {
			return `${this.Root}/list`
		},
		ListByUser(userId: string) {
			return `${this.List}/${userId}`
		},
		Get(slug: string) {
			return `${this.Root}/get/${slug}`
		},
		Nearby(locationId: string) {
			return `${this.Root}/nearby/${locationId}`
		},
	},
	Category: {
		Root: 'category',
		get List() {
			return `${this.Root}/list`
		},
		Get(slug: string) {
			return `${this.Root}/get/${slug}`
		},
		Nearby(locationId: string) {
			return `${this.Root}/nearby/${locationId}`
		},
	},
	Community: {
		Root: 'community',
		get List() {
			return `${this.Root}/list`
		},
		Get(slug: string) {
			return `${this.Root}/get/${slug}`
		},
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
		Get(slug: string) {
			return `${this.Root}/get/${slug}`
		},
	},
	User: {
		Root: 'user',
		Get(id: string) {
			return `${this.Root}/${id}`
		},
	},
}

export type CacheTag = (typeof CacheTags)[keyof typeof CacheTags]
