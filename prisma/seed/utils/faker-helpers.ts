/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
import { faker } from '@faker-js/faker'
import slugify from 'slugify'

// --- UTILITIES -------------------------------------------------
export const rand = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

export const sampleSize = <T>(arr: T[], n: number) =>
	faker.helpers.arrayElements(arr, Math.min(n, arr.length))

export const slug = (s: string) =>
	slugify(s, { lower: true, strict: true }).substring(0, 48) ||
	faker.string.alphanumeric(8)

// To ensure uniqueness beyond slugify collisions:
const usedSlugs = new Set<string>()
export function uniqueSlug(base: string): string {
	let s = slug(base)
	while (usedSlugs.has(s)) {
		s = `${s}-${faker.string.alphanumeric(4).toLowerCase()}`
	}
	usedSlugs.add(s)
	return s
}

export function randomDateWithinRange({
	startDaysAgo = 120,
	endDaysAhead = 120,
} = {}) {
	const start = faker.date.soon({ days: endDaysAhead })
	const end = faker.date.recent({ days: startDaysAgo })
	return faker.date.between({ from: end, to: start })
}

export function addHours(date: Date, hours = 2) {
	return new Date(date.getTime() + hours * 60 * 60 * 1000)
}
