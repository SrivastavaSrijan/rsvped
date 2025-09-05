import type { PrismaClient } from '@prisma/client'
import { llm } from '@/lib/ai'
import {
	type SearchIntent,
	SearchIntentSchema,
	StirPrompts,
	type StirSearchInput,
	StirSystemPrompts,
} from '@/server/actions/ai/prompts/stir'

type Dependences = {
	prisma: PrismaClient
	userId?: string
	userContext?: {
		locationId?: string | null
		interests: { categoryId: string; level: number }[]
		communities: { communityId: string; role: string }[]
	}
}

export class StirService {
	private prisma: PrismaClient
	private userId?: string
	private userContext?: Dependences['userContext']

	constructor(deps: Dependences) {
		this.prisma = deps.prisma
		this.userId = deps.userId
		this.userContext = deps.userContext
	}

	async parseSearchIntent(query: string): Promise<SearchIntent> {
		const prompt = StirPrompts.buildIntentPrompt(query)
		const system = StirSystemPrompts.intent
		const raw = await llm.generate(
			prompt,
			system,
			SearchIntentSchema,
			'stir-parse-intent'
		)
		// Normalize optional arrays/objects to keep downstream logic stable
		const normalized: SearchIntent = {
			primaryType: raw.primaryType,
			keywords: raw.keywords ?? [],
			eventFilters: {
				categories: raw.eventFilters?.categories ?? [],
				price: raw.eventFilters?.price ?? {},
				location: raw.eventFilters?.location,
				dateRange: raw.eventFilters?.dateRange ?? {},
				online: raw.eventFilters?.online,
			},
			userFilters: {
				professions: raw.userFilters?.professions ?? [],
				experienceLevels: raw.userFilters?.experienceLevels ?? [],
				interests: raw.userFilters?.interests ?? [],
				location: raw.userFilters?.location,
			},
			communityFilters: {
				topics: raw.communityFilters?.topics ?? [],
				location: raw.communityFilters?.location,
				isPublic: raw.communityFilters?.isPublic,
			},
			summary: {
				interpretation: raw.summary.interpretation,
				extracted: raw.summary.extracted ?? {},
				suggestions: raw.summary.suggestions ?? [],
			},
		}
		return normalized
	}

	// Helper: map string category names/slugs to IDs
	private async resolveCategoryIds(names: string[]): Promise<string[]> {
		if (!names.length) return []
		const categories = await this.prisma.category.findMany({
			where: { OR: [{ name: { in: names } }, { slug: { in: names } }] },
			select: { id: true },
		})
		return categories.map((c) => c.id)
	}

	// Helper: resolve location name/slug to ID
	private async resolveLocationId(loc?: string): Promise<string | undefined> {
		if (!loc) return undefined
		const match = await this.prisma.location.findFirst({
			where: {
				OR: [{ name: { equals: loc, mode: 'insensitive' } }, { slug: loc }],
			},
			select: { id: true },
		})
		return match?.id ?? undefined
	}

	// Basic multi-factor scoring for events
	private scoreEvent(args: {
		title: string
		categoryIds: string[]
		locationId?: string | null
		userInterestMap: Map<string, number>
		queryKeywords: string[]
	}): { score: number; reason: string } {
		let score = 0
		let reason = ''

		// Interest overlap (0.45)
		const interestSum = args.categoryIds.reduce(
			(acc, id) => acc + (args.userInterestMap.get(id) ?? 0),
			0
		)
		const interestNorm = Math.min(
			1,
			interestSum / Math.max(10, args.userInterestMap.size * 10)
		)
		if (interestNorm > 0) {
			score += 0.45 * interestNorm
			reason ||= 'Matches your interests'
		}

		// Keyword presence in title (0.3)
		const titleLower = args.title.toLowerCase()
		const keywordHits = args.queryKeywords.filter((k) =>
			titleLower.includes(k.toLowerCase())
		).length
		if (args.queryKeywords.length > 0) {
			const kwNorm = Math.min(1, keywordHits / args.queryKeywords.length)
			score += 0.3 * kwNorm
			if (!reason && kwNorm > 0) reason = 'Keyword match'
		}

		// Location match (0.25)
		if (
			args.locationId &&
			this.userContext?.locationId &&
			args.locationId === this.userContext.locationId
		) {
			score += 0.25
			reason ||= 'Near you'
		}

		return {
			score: Math.max(0, Math.min(1, score)),
			reason: reason || 'Relevant',
		}
	}

	async searchEvents(intent: SearchIntent, input: StirSearchInput) {
		const userInterestMap = new Map(
			(this.userContext?.interests ?? []).map((i) => [i.categoryId, i.level])
		)

		const categoryIds = await this.resolveCategoryIds(
			intent.eventFilters?.categories ?? []
		)
		const locationId =
			(await this.resolveLocationId(intent.eventFilters?.location)) ||
			(await this.resolveLocationId(input.location))

		const dateRange = intent.eventFilters?.dateRange
		const start = dateRange?.start ? new Date(dateRange.start) : undefined
		const end = dateRange?.end ? new Date(dateRange.end) : undefined

		const events = await this.prisma.event.findMany({
			where: {
				status: 'PUBLISHED',
				isPublished: true,
				...(locationId ? { locationId } : {}),
				...(start || end
					? {
							startDate: start ? { gte: start } : undefined,
							endDate: end ? { lte: end } : undefined,
						}
					: {}),
				...(categoryIds.length
					? {
							categories: { some: { categoryId: { in: categoryIds } } },
						}
					: {}),
			},
			include: { categories: true },
			take: input.limit,
		})

		const scored = events.map((e) => {
			const catIds = e.categories.map((c) => c.categoryId)
			const { score, reason } = this.scoreEvent({
				title: e.title,
				categoryIds: catIds,
				locationId: e.locationId,
				userInterestMap,
				queryKeywords: intent.keywords ?? [],
			})
			return {
				id: e.id,
				title: e.title,
				startDate: e.startDate,
				locationId: e.locationId,
				communityId: e.communityId ?? null,
				score,
				reason,
			}
		})

		return scored.sort((a, b) => b.score - a.score)
	}

	async searchUsers(intent: SearchIntent, input: StirSearchInput) {
		// Privacy-first: only return users that have at least one RSVP or community membership (basic discoverability heuristic)
		const locationId =
			(await this.resolveLocationId(intent.userFilters?.location)) ||
			(await this.resolveLocationId(input.location))

		const users = await this.prisma.user.findMany({
			where: {
				...(locationId ? { locationId } : {}),
				OR: [{ rsvps: { some: {} } }, { communityMemberships: { some: {} } }],
			},
			select: {
				id: true,
				name: true,
				profession: true,
				experienceLevel: true,
				categoryInterests: {
					select: { categoryId: true, interestLevel: true },
				},
			},
			take: input.limit,
		})

		const interestNames = intent.userFilters?.interests ?? []
		const interestIds = await this.resolveCategoryIds(interestNames)

		return users.map((u) => {
			const userInterestIds = u.categoryInterests.map((ci) => ci.categoryId)
			const overlap = userInterestIds.filter((id) =>
				interestIds.includes(id)
			).length
			const expMatch = intent.userFilters?.experienceLevels?.includes(
				u.experienceLevel ?? 'MID'
			)
			let score = 0
			let reason = ''
			if (overlap > 0) {
				score += Math.min(1, overlap / Math.max(1, interestIds.length)) * 0.6
				reason ||= 'Shared interests'
			}
			if (expMatch) {
				score += 0.4
				reason ||= 'Experience match'
			}
			return {
				id: u.id,
				name: u.name,
				profession: u.profession ?? null,
				experienceLevel: u.experienceLevel ?? null,
				score: Math.max(0, Math.min(1, score)),
				reason: reason || 'Relevant',
			}
		})
	}

	async searchCommunities(intent: SearchIntent, input: StirSearchInput) {
		const locationId = await this.resolveLocationId(
			intent.communityFilters?.location || input.location
		)
		const topics = intent.communityFilters?.topics ?? []
		const topicIds = await this.resolveCategoryIds(topics)

		// Simple heuristic: communities with events in those categories/locations
		const communities = await this.prisma.community.findMany({
			where: {
				...(intent.communityFilters?.isPublic === true
					? { isPublic: true }
					: {}),
			},
			select: {
				id: true,
				name: true,
				isPublic: true,
				events: {
					where: {
						status: 'PUBLISHED',
						...(locationId ? { locationId } : {}),
						...(topicIds.length
							? { categories: { some: { categoryId: { in: topicIds } } } }
							: {}),
					},
					select: { id: true },
				},
			},
			take: input.limit,
		})

		return communities.map((c) => ({
			id: c.id,
			name: c.name,
			isPublic: c.isPublic,
			score: Math.max(0, Math.min(1, Math.min(1, c.events.length / 5))),
			reason: c.events.length > 0 ? 'Active events' : 'Community match',
		}))
	}
}
