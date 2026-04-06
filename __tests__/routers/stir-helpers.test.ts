import { describe, expect, it } from 'vitest'
import {
	calculateEventScoreWithMatches,
	calculateTextScoreWithMatches,
	createCommunitySearchWhere,
	createEventSearchWhere,
	detectCategories,
	extractSignificantWords,
} from '@/server/api/routers/stir/helpers'

// --- extractSignificantWords ---

describe('extractSignificantWords', () => {
	it('removes English stop words', () => {
		expect(extractSignificantWords('tech in the city')).toEqual(['tech', 'city'])
	})

	it('removes event-domain stop words', () => {
		expect(extractSignificantWords('find best events near me')).toEqual([])
	})

	it('removes temporal qualifiers', () => {
		expect(extractSignificantWords('tech events this week')).toEqual(['tech'])
	})

	it('keeps meaningful keywords', () => {
		expect(extractSignificantWords('yoga meditation')).toEqual([
			'yoga',
			'meditation',
		])
	})

	it('handles single meaningful word', () => {
		expect(extractSignificantWords('tech')).toEqual(['tech'])
	})

	it('handles all stop words → empty array', () => {
		expect(extractSignificantWords('the best events this week')).toEqual([])
	})

	it('filters words shorter than 2 chars', () => {
		expect(extractSignificantWords('a b c tech')).toEqual(['tech'])
	})

	it('lowercases everything', () => {
		expect(extractSignificantWords('Tech Yoga')).toEqual(['tech', 'yoga'])
	})
})

// --- detectCategories ---

describe('detectCategories', () => {
	it('maps "tech" to Tech & Startups', () => {
		expect(detectCategories(['tech'])).toEqual(['Tech & Startups'])
	})

	it('maps "yoga" to Wellness & Self-Care', () => {
		expect(detectCategories(['yoga'])).toEqual(['Wellness & Self-Care'])
	})

	it('maps "music" to Music & Concerts', () => {
		expect(detectCategories(['music'])).toEqual(['Music & Concerts'])
	})

	it('maps multiple keywords to multiple categories', () => {
		const result = detectCategories(['tech', 'music'])
		expect(result).toContain('Tech & Startups')
		expect(result).toContain('Music & Concerts')
	})

	it('returns empty for unrecognized keywords', () => {
		expect(detectCategories(['xyzabc', 'foobar'])).toEqual([])
	})

	it('detects from synonyms like "coding", "hackathon"', () => {
		expect(detectCategories(['coding'])).toEqual(['Tech & Startups'])
		expect(detectCategories(['hackathon'])).toEqual(['Tech & Startups'])
	})
})

// --- createEventSearchWhere ---

describe('createEventSearchWhere', () => {
	it('uses AND semantics for significant words', () => {
		const where = createEventSearchWhere('tech yoga')
		// Should have OR at top level with AND branch
		expect(where).toHaveProperty('OR')
		const orBranches = where.OR as Record<string, unknown>[]
		// First branch should be AND of word conditions
		const andBranch = orBranches.find(
			(b) => 'AND' in b
		) as Record<string, unknown>
		expect(andBranch).toBeDefined()
		const andConditions = andBranch.AND as unknown[]
		// Should have conditions for both "tech" and "yoga"
		expect(andConditions.length).toBeGreaterThanOrEqual(2)
	})

	it('includes category detection in WHERE', () => {
		const where = createEventSearchWhere('tech events this week')
		const orBranches = where.OR as Record<string, unknown>[]
		// Should have a branch with category condition
		const categoryBranch = orBranches.find((b) => {
			if (!('AND' in b)) return false
			const andArr = b.AND as Record<string, unknown>[]
			return andArr.some((c) => 'categories' in c)
		})
		expect(categoryBranch).toBeDefined()
	})

	it('includes temporal heuristics in WHERE for "this week"', () => {
		const where = createEventSearchWhere('tech events this week')
		// The AND conditions should include a date range (from parseTemporalHints)
		const orBranches = where.OR as Record<string, unknown>[]
		const hasDates = orBranches.some((b) => {
			if (!('AND' in b)) return false
			const andArr = b.AND as Record<string, unknown>[]
			return andArr.some(
				(c) => 'OR' in c && Array.isArray((c as Record<string, unknown>).OR)
			)
		})
		expect(hasDates).toBe(true)
	})

	it('falls back to full phrase when all words are stop words', () => {
		const where = createEventSearchWhere('the best events')
		// Should have OR with title/description contains
		expect(where).toHaveProperty('OR')
		const orBranches = where.OR as Record<string, unknown>[]
		const hasTitleContains = orBranches.some((b) => 'title' in b)
		expect(hasTitleContains).toBe(true)
	})

	it('always includes isPublished and deletedAt filters', () => {
		const where = createEventSearchWhere('tech')
		expect(where.isPublished).toBe(true)
		expect(where.deletedAt).toBeNull()
	})

	it('includes full phrase fallback branches', () => {
		const where = createEventSearchWhere('tech startup mixer')
		const orBranches = where.OR as Record<string, unknown>[]
		// Should have title and description full phrase fallbacks
		const hasTitleFallback = orBranches.some(
			(b) =>
				'title' in b &&
				typeof (b as { title: { contains: string } }).title === 'object'
		)
		expect(hasTitleFallback).toBe(true)
	})
})

// --- createCommunitySearchWhere ---

describe('createCommunitySearchWhere', () => {
	it('uses AND semantics for significant words', () => {
		const where = createCommunitySearchWhere('tech yoga')
		expect(where).toHaveProperty('OR')
		const orBranches = where.OR as Record<string, unknown>[]
		const andBranch = orBranches.find((b) => 'AND' in b)
		expect(andBranch).toBeDefined()
	})

	it('filters stop words', () => {
		const where = createCommunitySearchWhere('find best events near me')
		// All words are stop words, should fall back to full phrase
		const orBranches = where.OR as Record<string, unknown>[]
		const hasNameContains = orBranches.some((b) => 'name' in b)
		expect(hasNameContains).toBe(true)
	})

	it('always includes isPublic filter', () => {
		const where = createCommunitySearchWhere('tech')
		expect(where.isPublic).toBe(true)
	})
})

// --- Scoring: relevance ranking ---

describe('scoring relevance', () => {
	it('scores title match higher than description match', () => {
		const titleMatch = calculateTextScoreWithMatches(
			'Tech Startup Mixer',
			'tech',
			'title'
		)
		const descMatch = calculateTextScoreWithMatches(
			'A community wellness event with tech discussions',
			'tech',
			'description'
		)
		expect(titleMatch.score).toBeGreaterThan(descMatch.score)
	})

	it('ranks tech event above wellness retreat for "tech" query', () => {
		const techEvent = calculateEventScoreWithMatches(
			{
				title: 'Tech Startup Mixer: Q2 Launch',
				description: 'Network with founders and investors in the tech scene.',
				startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days out
			},
			{ query: 'tech' }
		)

		const wellnessEvent = calculateEventScoreWithMatches(
			{
				title: 'Wellness Retreat: 3-Day Immersion',
				description:
					'Escape to a ranch for yoga and meditation. Our tech-free environment...',
				startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days out
			},
			{ query: 'tech' }
		)

		expect(techEvent.total).toBeGreaterThan(wellnessEvent.total)
	})

	it('scores exact word match higher than fuzzy match', () => {
		const exact = calculateTextScoreWithMatches('tech talk', 'tech', 'title')
		const fuzzy = calculateTextScoreWithMatches(
			'technique workshop',
			'tech',
			'title'
		)
		expect(exact.score).toBeGreaterThan(fuzzy.score)
	})
})
