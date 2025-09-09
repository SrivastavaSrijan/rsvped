import { createTRPCRouter } from '@/server/api/trpc'
import { stirAutocompleteRouter } from './autocomplete'
import { stirSearchRouter } from './search'

export const stirRouter = createTRPCRouter({
	autocomplete: stirAutocompleteRouter.suggestions,
	search: stirSearchRouter,
})
