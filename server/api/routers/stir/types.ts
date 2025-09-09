export const SearchType = {
	EVENTS: 'events',
	COMMUNITIES: 'communities',
} as const

export type SearchType = (typeof SearchType)[keyof typeof SearchType]

export const SearchTypes = Object.values(SearchType)
