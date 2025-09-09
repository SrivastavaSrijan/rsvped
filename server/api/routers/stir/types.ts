export const SearchType = {
	ALL: 'all',
	EVENTS: 'events',
	COMMUNITIES: 'communities',
} as const

export type SearchType = (typeof SearchType)[keyof typeof SearchType]

export const SearchTypes = Object.values(SearchType)

export const SearchScope = {
	CORE: 'core',
	ENHANCED: 'enhanced',
} as const

export type SearchScope = (typeof SearchScope)[keyof typeof SearchScope]
