import type React from 'react'

export function useHighlighter(query: string) {
	const q = (query ?? '').trim()
	if (!q) return (s: string) => s

	return (s: string): React.ReactNode => {
		if (!s) return s

		const queryWords = q.toLowerCase().split(/\s+/).filter(Boolean)

		// Create a single comprehensive regex that captures all possible matches
		// Priority: exact phrase > individual words
		const patterns: string[] = []

		// Add exact phrase (highest priority)
		const safeFullQuery = q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
		patterns.push(safeFullQuery)

		// Add individual words with word boundaries
		queryWords.forEach((word) => {
			const safeWord = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
			patterns.push(`\\b${safeWord}\\b`)
		})

		// Combine all patterns with alternation, order matters (longest first)
		const combinedPattern = new RegExp(`(${patterns.join('|')})`, 'gi')

		// Split text and highlight matches
		const parts = s.split(combinedPattern)

		return parts
			.map((part, index) => {
				// Every odd index is a match (due to capture group in regex)
				const isMatch = index % 2 === 1

				if (isMatch && part) {
					return (
						<mark key={`${part}-match`} className="rsvped-search-highlight">
							{part}
						</mark>
					)
				}

				return part || null
			})
			.filter(Boolean)
	}
}

/**
 * Hook to get a formatted search match reason from search metadata
 */
export const useSearchMatchReason = (
	searchMetadata?: {
		matches?: Array<{
			reason: string
			matchedField: string
			matchedText: string
		}>
	},
	query?: string,
	eventData?: { title?: string; description?: string },
	communityData?: { name?: string; description?: string },
	excludeField?: string // Field to exclude from showing (e.g., 'title' for events, 'name' for communities)
) => {
	if (!searchMetadata?.matches?.length || !query) return null

	// Get the primary match (first match which determines the main relevance)
	const primaryMatch = searchMetadata.matches[0]
	if (!primaryMatch) return null

	const { matchedField } = primaryMatch

	// Don't show match reason if it's for the excluded field (already highlighted in main display)
	if (excludeField && matchedField === excludeField) return null

	// Get the full text from the field that was matched
	let fullText = ''
	if (matchedField === 'title' && eventData?.title) {
		fullText = eventData.title
	} else if (matchedField === 'description' && eventData?.description) {
		fullText = eventData.description
	} else if (matchedField === 'name' && communityData?.name) {
		fullText = communityData.name
	} else if (matchedField === 'description' && communityData?.description) {
		fullText = communityData.description
	}

	if (!fullText) return null

	// Truncate text if it's too long (similar to line-clamp-2)
	const maxLength = 120 // Approximate 2 lines worth of text
	const truncatedText =
		fullText.length > maxLength
			? `${fullText.substring(0, maxLength)}...`
			: fullText

	return {
		text: truncatedText,
		field: matchedField,
		originalText: fullText,
	}
}
