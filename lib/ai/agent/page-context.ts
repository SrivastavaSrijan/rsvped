'use client'

import { usePathname } from 'next/navigation'
import type { PageContext } from '@/lib/ai/agent'

/**
 * Detect page context from the current pathname.
 * Used by FAB and Stir page to inject context into each message.
 */
export const usePageContext = (): PageContext => {
	const pathname = usePathname()

	// /events/[slug]/view or /events/[slug]
	const eventMatch = pathname.match(/^\/events\/([^/]+)/)
	if (eventMatch) {
		return { page: 'event-detail', eventSlug: eventMatch[1], path: pathname }
	}

	// /communities/[slug]
	const communityMatch = pathname.match(/^\/communities\/([^/]+)/)
	if (communityMatch) {
		return {
			page: 'community',
			communitySlug: communityMatch[1],
			path: pathname,
		}
	}

	// /u/[username]
	const userMatch = pathname.match(/^\/u\/([^/]+)/)
	if (userMatch) {
		return { page: 'user-profile', username: userMatch[1], path: pathname }
	}

	// /feed
	if (pathname === '/feed') {
		return { page: 'feed', path: pathname }
	}

	// /stir
	if (pathname === '/stir') {
		return { page: 'stir-home', path: pathname }
	}

	return { page: 'general', path: pathname }
}
