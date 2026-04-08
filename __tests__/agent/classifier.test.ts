import { describe, expect, it, vi } from 'vitest'
import { classifyIntent } from '@/lib/ai/agent/classifier'

// Mock the AI SDK generateObject
vi.mock('ai', () => ({
	generateObject: vi.fn(),
}))

// Mock getModel
vi.mock('@/lib/ai', () => ({
	getModel: vi.fn(() => 'mock-model'),
}))

describe('classifyIntent', () => {
	describe('short-circuit patterns', () => {
		it('should classify "trending" as search without LLM', async () => {
			const result = await classifyIntent('trending')
			expect(result.intent).toBe('search')
			expect(result.reasoning).toContain('Short-circuit')
		})

		it('should classify "popular" as search without LLM', async () => {
			const result = await classifyIntent('popular')
			expect(result.intent).toBe('search')
		})

		it('should classify "help" as general without LLM', async () => {
			const result = await classifyIntent('help')
			expect(result.intent).toBe('general')
			expect(result.reasoning).toContain('Short-circuit')
		})

		it('should classify "hello" as general without LLM', async () => {
			const result = await classifyIntent('hello')
			expect(result.intent).toBe('general')
		})

		it('should classify "hi there" as general without LLM (2-word match)', async () => {
			const result = await classifyIntent('hi there')
			expect(result.intent).toBe('general')
		})
	})

	describe('empty and edge-case inputs', () => {
		it('should classify empty string as general', async () => {
			const result = await classifyIntent('')
			expect(result.intent).toBe('general')
			expect(result.reasoning).toBe('Empty query')
		})

		it('should classify whitespace-only as general', async () => {
			const result = await classifyIntent('   ')
			expect(result.intent).toBe('general')
			expect(result.reasoning).toBe('Empty query')
		})

		it('should classify emoji-only input as general (fallback)', async () => {
			const { generateObject } = await import('ai')
			const mockedGenerate = vi.mocked(generateObject)
			mockedGenerate.mockResolvedValueOnce({
				object: { intent: 'general', reasoning: 'Emoji input' },
			} as never)

			const result = await classifyIntent('🎉')
			expect(result.intent).toBe('general')
		})
	})

	describe('LLM classification', () => {
		it('should classify "tech meetups this weekend" via LLM', async () => {
			const { generateObject } = await import('ai')
			const mockedGenerate = vi.mocked(generateObject)
			mockedGenerate.mockResolvedValueOnce({
				object: {
					intent: 'search',
					reasoning: 'User looking for events by keyword and date',
				},
			} as never)

			const result = await classifyIntent('tech meetups this weekend')
			expect(result.intent).toBe('search')
			expect(mockedGenerate).toHaveBeenCalled()
		})

		it('should classify "what should I go to?" as recommend', async () => {
			const { generateObject } = await import('ai')
			const mockedGenerate = vi.mocked(generateObject)
			mockedGenerate.mockResolvedValueOnce({
				object: {
					intent: 'recommend',
					reasoning: 'User wants personalized suggestions',
				},
			} as never)

			const result = await classifyIntent('what should I go to?')
			expect(result.intent).toBe('recommend')
		})

		it('should classify "tell me about TechCon" as detail', async () => {
			const { generateObject } = await import('ai')
			const mockedGenerate = vi.mocked(generateObject)
			mockedGenerate.mockResolvedValueOnce({
				object: {
					intent: 'detail',
					reasoning: 'Asking about a specific event',
				},
			} as never)

			const result = await classifyIntent('tell me about TechCon')
			expect(result.intent).toBe('detail')
		})

		it('should classify "compare TechCon and DevConf" as compare', async () => {
			const { generateObject } = await import('ai')
			const mockedGenerate = vi.mocked(generateObject)
			mockedGenerate.mockResolvedValueOnce({
				object: {
					intent: 'compare',
					reasoning: 'User comparing two events',
				},
			} as never)

			const result = await classifyIntent('compare TechCon and DevConf')
			expect(result.intent).toBe('compare')
		})
	})

	describe('error handling', () => {
		it('should fall back to general on LLM timeout', async () => {
			const { generateObject } = await import('ai')
			const mockedGenerate = vi.mocked(generateObject)
			// Simulate a call that never resolves (timeout will trigger)
			mockedGenerate.mockImplementationOnce(
				() =>
					new Promise((resolve) => {
						setTimeout(() => resolve({ object: { intent: 'search', reasoning: 'late' } } as never), 5000)
					})
			)

			const result = await classifyIntent('find me tech events nearby')
			expect(result.intent).toBe('general')
			expect(result.reasoning).toContain('Fallback')
		})

		it('should fall back to general on LLM error', async () => {
			const { generateObject } = await import('ai')
			const mockedGenerate = vi.mocked(generateObject)
			mockedGenerate.mockRejectedValueOnce(new Error('API error'))

			const result = await classifyIntent('find me jazz concerts')
			expect(result.intent).toBe('general')
			expect(result.reasoning).toContain('Fallback')
		})

		it('should truncate very long queries before classifying', async () => {
			const { generateObject } = await import('ai')
			const mockedGenerate = vi.mocked(generateObject)
			mockedGenerate.mockResolvedValueOnce({
				object: { intent: 'search', reasoning: 'Truncated query' },
			} as never)

			const longQuery = 'a'.repeat(1000)
			const result = await classifyIntent(longQuery)
			expect(result.intent).toBe('search')

			// Verify the prompt passed to generateObject was truncated
			const callArgs = mockedGenerate.mock.calls.at(-1)?.[0] as
				| { prompt?: string }
				| undefined
			expect(callArgs?.prompt?.length).toBeLessThanOrEqual(500)
		})
	})
})
