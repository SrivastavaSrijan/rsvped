/**
 * Load static data (locations + categories) from CSV exports.
 * Run: npx tsx prisma/seed/load-static.ts
 *
 * CSV files expected at: prisma/seed/init/locations.csv, prisma/seed/init/categories.csv
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const INIT_DIR = path.join(__dirname, 'init')

async function main() {
	// Insert locations
	const locLines = readFileSync(path.join(INIT_DIR, 'locations.csv'), 'utf8')
		.trim()
		.split('\n')

	let locCount = 0
	for (const line of locLines) {
		const parts = line.split(',')
		const [
			id,
			name,
			slug,
			country,
			continent,
			timezone,
			icon,
			_createdAt,
			_updatedAt,
			...coverParts
		] = parts
		const coverImage = coverParts.join(',') || null
		await prisma.location.upsert({
			where: { id },
			update: {},
			create: {
				id,
				name,
				slug,
				country,
				continent,
				timezone,
				iconPath: icon.includes('/') ? icon : `/assets/location-icons/${icon}`,
				coverImage,
			},
		})
		locCount++
	}
	console.log(`Locations inserted: ${locCount}`)

	// Insert categories
	const catLines = readFileSync(path.join(INIT_DIR, 'categories.csv'), 'utf8')
		.trim()
		.split('\n')

	let catCount = 0
	for (const line of catLines) {
		const match = line.match(/^([^,]+),([^,]+),([^,]+),(.+)$/)
		if (!match) {
			console.log('Skip:', line.slice(0, 50))
			continue
		}
		const [, id, name, slug, rawSubs] = match
		const subcategories = rawSubs
			.replace(/[{}"']/g, '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)

		await prisma.category.upsert({
			where: { id },
			update: {},
			create: { id, name, slug, subcategories },
		})
		catCount++
	}
	console.log(`Categories inserted: ${catCount}`)
}

main()
	.then(() => prisma.$disconnect())
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
