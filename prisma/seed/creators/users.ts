/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { faker } from '@faker-js/faker'
import type { PrismaClient } from '@prisma/client'
import { snakeCase } from 'es-toolkit/string'
import { getAvatarURL } from '@/lib/config/routes'
import type { BatchProcessedData } from '../utils'
import { logger } from '../utils'
import { config, paths } from '../utils/config'

export async function createUsers(
	prisma: PrismaClient,
	count: number,
	categories: any[],
	locations?: any[],
	batchData?: BatchProcessedData
) {
	const testCredentials: {
		email: string
		password: string
		name: string
		id?: string
	}[] = []
	const users: any[] = []

	// Load cached LLM users, prefer batch data if available
	const llmUsers = config.USE_LLM ? batchData?.users || [] : []
	const locationMap = new Map((locations || []).map((l: any) => [l.name, l]))

	logger.info(
		`Creating ${count} users with concurrent password hashing... (LLM candidates: ${llmUsers.length})`
	)

	const usedEmails = new Set<string>()
	const genEmail = (base: string) => {
		let email = base.toLowerCase()
		let i = 1
		while (usedEmails.has(email)) {
			const [local, domain] = base.toLowerCase().split('@')
			email = `${local}+${i}@${domain}`
			i++
		}
		usedEmails.add(email)
		return email
	}
	const passwordsPath = path.join(paths.staticDir, 'passwords.json')
	const prehashed = JSON.parse(readFileSync(passwordsPath, 'utf8')) as {
		plain: string
		hash: string
	}[]

	// First, prepare LLM batch data users (without hashing passwords yet)
	let createdFromBatch = 0
	for (const persona of llmUsers) {
		const first = persona.firstName?.trim() || faker.person.firstName()
		const last = persona.lastName?.trim() || faker.person.lastName()
		const name = `${first} ${last}`.trim()

		const baseEmail = `${snakeCase(first)}.${snakeCase(last)}@example.com`
		const email = genEmail(baseEmail)

		const { plain, hash } = faker.helpers.arrayElement(prehashed)

		const loc = persona.location && locationMap.get(persona.location)
		testCredentials.push({
			email,
			password: plain,
			name,
		})

		users.push({
			name,
			email,
			image: getAvatarURL(name),
			password: hash,
			emailVerified: faker.datatype.boolean() ? faker.date.past() : null,
			location: {
				connect: {
					id: loc?.id ?? null,
				},
			},
			profession: persona.profession ?? null,
			industry: persona.industry ?? null,
			experienceLevel: persona.experienceLevel
				? persona.experienceLevel.toUpperCase()
				: null,
			interests: Array.isArray(persona.interests)
				? persona.interests.slice(0, 10)
				: [],
			networkingStyle: persona.networkingStyle
				? persona.networkingStyle.toUpperCase()
				: null,
			spendingPower: persona.spendingPower
				? persona.spendingPower.toUpperCase()
				: null,
			bio: persona.bio ?? null,
			userCohort: ((): any => {
				// Prefer personas with high spending as POWER
				const sp = (persona.spendingPower || '').toLowerCase()
				if (sp === 'high') return 'POWER'
				// Randomly bucket others
				return faker.helpers.weightedArrayElement([
					{ weight: 2, value: 'POWER' },
					{ weight: 4, value: 'FRIEND_GROUP' },
					{ weight: 6, value: 'CASUAL' },
				])
			})(),
			_llmUser: persona,
		})
		createdFromBatch++
	}

	// Generate remaining users with faker
	for (let i = users.length; i < count; i++) {
		const first = faker.person.firstName()
		const last = faker.person.lastName()
		const name = `${first} ${last}`
		const baseEmail = `${first}.${last}@example.com`
		const email = genEmail(baseEmail)
		const { plain, hash } = faker.helpers.arrayElement(prehashed)

		testCredentials.push({
			email,
			password: plain,
			name,
		})

		// Store user data without hashed password
		users.push({
			name,
			email,
			password: hash,
			image: getAvatarURL(name),
			emailVerified: faker.datatype.boolean() ? faker.date.past() : null,
			location: {
				connect: {
					id: locations?.length
						? faker.helpers.arrayElement(locations).id
						: null,
				},
			},

			userCohort: faker.helpers.weightedArrayElement([
				{ weight: 2, value: 'POWER' },
				{ weight: 4, value: 'FRIEND_GROUP' },
				{ weight: 6, value: 'CASUAL' },
			]),
		})
	}
	// Upsert users to avoid duplicates by email
	const created: any[] = []
	for (const { _llmUser, ...u } of users) {
		const user = await prisma.user.upsert({
			where: { email: u.email },
			update: {
				name: u.name,
				image: u.image,
				location: u.location,
				profession: u.profession,
				industry: u.industry,
				experienceLevel: u.experienceLevel,
				interests: u.interests,
				networkingStyle: u.networkingStyle,
				spendingPower: u.spendingPower,
				bio: u.bio,
				userCohort: u.userCohort,
				password: u.password,
			},
			create: u,
		})
		created.push({ _llmUser, ...user })
	}

	// Attach LLM user data
	for (const user of created) {
		const categoryIds = categories
			.filter((c) => user._llmUser?.interests.includes(c.name))
			.map((c) => c.id)

		await prisma.userCategory.createMany({
			data: categoryIds.map((id) => ({
				userId: user.id,
				categoryId: id,
			})),
		})
	}

	// Write credentials to JSON file for testing
	writeFileSync(
		paths.testAccountsFile,
		JSON.stringify(testCredentials, null, 2),
		'utf-8'
	)
	logger.info(`📁 Test credentials saved to ${paths.testAccountsFile}`)
	logger.info(
		`✅ ${created.length} users created/updated (from batch: ${createdFromBatch})`
	)

	return created
}
