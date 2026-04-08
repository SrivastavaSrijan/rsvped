'use client'

import { usePathname } from 'next/navigation'
import { Routes } from '@/lib/config'
import { PAGE_CONTEXT_PAGES, type PageContext } from './types'

/**
 * Detect page context from the current pathname.
 * Uses Routes constants as single source of truth for path prefixes.
 */
export const usePageContext = (): PageContext => {
	const pathname = usePathname()

	// /events/[slug]/view or /events/[slug]
	const eventsPrefix = `${Routes.Main.Events.Root}/`
	if (pathname.startsWith(eventsPrefix)) {
		const slug = pathname.slice(eventsPrefix.length).split('/')[0]
		if (slug) {
			return {
				page: PAGE_CONTEXT_PAGES.EVENT_DETAIL,
				eventSlug: slug,
				path: pathname,
			}
		}
	}

	// /communities/[slug]
	const communitiesPrefix = `${Routes.Main.Communities.Root}/`
	if (pathname.startsWith(communitiesPrefix)) {
		const slug = pathname.slice(communitiesPrefix.length).split('/')[0]
		if (slug) {
			return {
				page: PAGE_CONTEXT_PAGES.COMMUNITY,
				communitySlug: slug,
				path: pathname,
			}
		}
	}

	// /u/[username]
	const usersPrefix = `${Routes.Main.Users.Root}/`
	if (pathname.startsWith(usersPrefix)) {
		const username = pathname.slice(usersPrefix.length).split('/')[0]
		if (username) {
			return {
				page: PAGE_CONTEXT_PAGES.USER_PROFILE,
				username,
				path: pathname,
			}
		}
	}

	// /feed
	if (pathname === Routes.Main.Feed) {
		return { page: PAGE_CONTEXT_PAGES.FEED, path: pathname }
	}

	// /stir
	if (pathname === Routes.Main.Stir.Root) {
		return { page: PAGE_CONTEXT_PAGES.STIR_HOME, path: pathname }
	}

	return { page: PAGE_CONTEXT_PAGES.GENERAL, path: pathname }
}
