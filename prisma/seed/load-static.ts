/**
 * Load static data (locations + categories) from committed JSON files.
 *
 * Can run standalone:  npx tsx prisma/seed/load-static.ts
 * Also called from seed.ts as the first pipeline stage.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { PrismaClient } from '@prisma/client'

const DATA_DIR = path.join(__dirname, 'data')

interface LocationEntry {
	name: string
	slug: string
	country: string
	continent: string
	timezone: string
	iconPath: string
	coverImage: string | null
}

interface CategoryEntry {
	name: string
	slug: string
	subcategories: string[]
}

export async function loadStaticData(prisma: PrismaClient) {
	const locations: LocationEntry[] = JSON.parse(
		readFileSync(path.join(DATA_DIR, 'locations.json'), 'utf8')
	)
	const categories: CategoryEntry[] = JSON.parse(
		readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf8')
	)

	let locCount = 0
	for (const loc of locations) {
		await prisma.location.upsert({
			where: { slug: loc.slug },
			update: {},
			create: {
				name: loc.name,
				slug: loc.slug,
				country: loc.country,
				continent: loc.continent,
				timezone: loc.timezone,
				iconPath: loc.iconPath,
				coverImage: loc.coverImage,
			},
		})
		locCount++
	}
	console.log(`Locations upserted: ${locCount}`)

	let catCount = 0
	for (const cat of categories) {
		await prisma.category.upsert({
			where: { slug: cat.slug },
			update: {},
			create: {
				name: cat.name,
				slug: cat.slug,
				subcategories: cat.subcategories,
			},
		})
		catCount++
	}
	console.log(`Categories upserted: ${catCount}`)
}

// Standalone execution
if (require.main === module) {
	const { PrismaClient } = require('@prisma/client')
	const prisma = new PrismaClient()
	loadStaticData(prisma)
		.then(() => prisma.$disconnect())
		.catch((e: unknown) => {
			console.error(e)
			process.exit(1)
		})
}
