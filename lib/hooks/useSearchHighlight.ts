export function useSearchHighlight(query: string) {
	const q = (query ?? '').trim()
	const esc = (s: string) =>
		s.replace(
			/[&<>"]/g,
			(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!
		)
	if (!q) return (s: string) => esc(s)
	const safeQ = q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
	const regex = new RegExp(`(${safeQ})`, 'ig')
	return (s: string) =>
		esc(s).replace(regex, '<mark class="rsvped-search-highlight">$1</mark>')
}
