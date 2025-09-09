import React from 'react'

export function useHighlighter(query: string) {
	const q = (query ?? '').trim()
	if (!q) return (s: string) => s
	const safeQ = q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
	const regex = new RegExp(`(${safeQ})`, 'ig')
	return (s: string): React.ReactNode => {
		const parts = s.split(regex)
		return parts.map((part) =>
			regex.test(part) ? (
				<mark key={part} className="rsvped-search-highlight">
					{part}
				</mark>
			) : (
				<React.Fragment key={part}>{part}</React.Fragment>
			)
		)
	}
}
