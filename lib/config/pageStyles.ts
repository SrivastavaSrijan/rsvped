import type { CSSProperties } from 'react'
import { Routes } from '@/lib/config/routes'
import { getRandomColor } from '@/lib/utils'

type PageStyle = {
	background?: (seed?: string) => CSSProperties
	pseudoElement?: (seed?: string) => CSSProperties
	key?: string
}

const getRandomGradient = (seed?: string) => ({
	background: `linear-gradient(${getRandomColor({ faint: true, seed })} 0%, ${getRandomColor({ faint: true, seed })} 50%, var(--color-faint-gray) 100%)`,
})
const getRandomBackground = (seed?: string) => ({
	backgroundColor: getRandomColor({ seed, intensity: 80 }),
})
/**
 * A map of path patterns to their corresponding style functions.
 * The key is a path pattern that can include dynamic segments like `:slug`.
 */
const styleMap: Record<string, PageStyle> = {
	[Routes.Main.Events.Create]: {
		background: getRandomBackground,
	},
	// Use the dynamic route pattern directly as the key.
	[Routes.Main.Events.ViewBySlug(':slug')]: {
		background: getRandomBackground,
		key: 'slug',
	},
	[Routes.Main.Events.Discover]: {
		pseudoElement: getRandomGradient,
	},
	[Routes.Main.Events.Home]: {
		pseudoElement: getRandomGradient,
	},
	[Routes.Main.Events.Communities]: {
		pseudoElement: getRandomGradient,
	},
	[Routes.Main.Events.ManageBySlug(':slug')]: {
		pseudoElement: getRandomGradient,
	},
}
/**
 * Finds the appropriate styles for a given route by matching the pathname
 * against the style map, substituting route parameters where necessary.
 *
 * @param pathname The current URL path from `usePathname`.
 * @param params The dynamic route parameters from `useParams`.
 * @returns The matched style object or an empty object if no match is found.
 */
export function getStylesForRoute(
	pathname: string,
	params: Record<string, string | string[] | undefined>
): PageStyle {
	// First, check for a direct match for static paths.
	if (styleMap[pathname]) {
		return styleMap[pathname]
	}

	// Then, check for dynamic paths by substituting params.
	for (const pathPattern in styleMap) {
		if (pathPattern.includes(':')) {
			let path = pathPattern
			// Replace each param in the pattern with its value.
			for (const key in params) {
				path = path.replace(`:${key}`, String(params[key]))
			}
			// If the constructed path matches the current pathname, we found our rule.
			if (path === pathname) {
				return styleMap[pathPattern]
			}
		}
	}

	return {} // Return empty styles if no match is found.
}
