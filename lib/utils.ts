import bcrypt from 'bcryptjs'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
	type ThemeColorIntensity,
	type ThemeColorName,
	type ThemeFaintColorName,
	themeColorNames,
	themeFaintColorNames,
} from './config'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
	const saltRounds = 12
	return bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against a hash
 */
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash)
}

/**
 * Generates a CSS variable string for a theme color.
 *
 * - If `color` is provided, it's used directly.
 * - If `seed` is provided, it generates a deterministic color.
 * - Otherwise, it selects a random color.
 *
 * @param {object} options - The options for generating the color.
 * @param {string} [options.seed] - An input string (e.g., user ID) to deterministically select a color.
 * @param {ThemeColorName} [options.color] - A specific color name to force.
 * @param {ThemeColorIntensity} [options.intensity=50] - The color intensity.
 * @returns {string} A CSS variable string (e.g., "var(--color-cranberry-50)").
 */
function simpleHash(str: string): number {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash |= 0 // Convert to 32bit integer
	}
	return Math.abs(hash)
}

/**
 * Generates a CSS variable string for a theme color.
 *
 * - If `color` is provided, it's used directly.
 * - If `seed` is provided, it generates a deterministic color.
 * - Otherwise, it selects a random color.
 *
 * @param {object} options - The options for generating the color.
 * @param {string} [options.seed] - An input string (e.g., user ID) to deterministically select a color.
 * @param {ThemeColorName} [options.color] - A specific color name to force.
 * @param {ThemeColorIntensity} [options.intensity=50] - The color intensity.
 * @returns {string} A CSS variable string (e.g., "var(--color-cranberry-50)").
 */
export function getRandomColor({
	seed,
	color,
	intensity = 50,
	faint = false,
}: {
	seed?: string
	color?: ThemeColorName | ThemeFaintColorName
	intensity?: ThemeColorIntensity
	faint?: boolean
} = {}): string {
	let selectedColor: ThemeColorName | ThemeFaintColorName
	const map = faint ? themeFaintColorNames : themeColorNames
	if (color) {
		selectedColor = color
	} else if (seed) {
		const hash = simpleHash(seed)
		selectedColor = map[hash % map.length]
	} else {
		selectedColor = map[Math.floor(Math.random() * map.length)]
	}

	return `var(--color-${selectedColor}${!faint ? `-${intensity}` : ''})`
}

/**
 * Matches a pathname against a pattern containing dynamic segments like [slug].
 * This provides a reliable way to check for dynamic routes inside middleware.
 *
 * @example
 * matchPathSegments('/events/123/view', '/events/[slug]/view') // true
 * matchPathSegments('/events/create', '/events/[slug]/view')   // false
 *
 * @param pathname The actual URL path from the request.
 * @param pattern The route pattern to match against.
 * @returns `true` if the pathname matches the pattern.
 */
export function matchPathSegments(pathname: string, pattern: string): boolean {
	const pathSegments = pathname.split('/').filter(Boolean)
	const patternSegments = pattern.split('/').filter(Boolean)

	if (pathSegments.length !== patternSegments.length) {
		return false
	}

	return patternSegments.every((segment, i) => {
		// A dynamic segment (e.g., [slug]) is a wildcard for one segment.
		if (segment.startsWith('[') && segment.endsWith(']')) {
			return true
		}
		// Static segments must match exactly.
		return segment === pathSegments[i]
	})
}
