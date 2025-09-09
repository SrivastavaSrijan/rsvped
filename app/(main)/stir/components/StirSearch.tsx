'use client'

import { Calendar, Loader2, Sparkle, Users, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useDebounce } from 'use-debounce'
import { Badge, Button, Input } from '@/components/ui'
import { Routes } from '@/lib/config/routes'
import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'

type StirSearchMode = 'autocomplete' | 'live'

interface StirSearchProps {
	initialQuery?: string
	onSearch?: (query: string) => void
	placeholder?: string
	mode?: StirSearchMode
}

interface SearchSuggestion {
	id: string
	title: string
	type: 'event' | 'community'
	slug: string
}

interface RecentSearchChip {
	query: string
	timestamp: Date
}

const SEARCH_HISTORY_KEY = 'stir.search.history'
const MAX_HISTORY_ITEMS = 5

export const StirSearch = ({
	initialQuery = '',
	placeholder = 'Find events, communities, and more...',
	mode = 'autocomplete',
}: StirSearchProps) => {
	const [query, setQuery] = useState(initialQuery)
	const [isFocused, setIsFocused] = useState(false)
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [activeIndex, setActiveIndex] = useState(-1)
	const [history, setHistory] = useState<RecentSearchChip[]>([])

	const router = useRouter()
	const searchParams = useSearchParams()
	const [isPending, startTransition] = useTransition()

	const inputRef = useRef<HTMLInputElement>(null)
	const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([])

	// Debounce query for API calls
	const [debouncedQuery] = useDebounce(query.trim(), 300)

	// Load search history on mount (client-side only)
	useEffect(() => {
		try {
			const raw = localStorage.getItem(SEARCH_HISTORY_KEY)
			if (raw) {
				const parsed = JSON.parse(raw) as RecentSearchChip[]
				const validHistory = parsed
					.filter((item) => item.query && item.timestamp)
					.slice(0, MAX_HISTORY_ITEMS)
				setHistory(validHistory)
			}
		} catch {
			// Ignore localStorage errors
		}
	}, [])

	// Sync with URL search params
	useEffect(() => {
		const urlQuery = searchParams.get('q') ?? ''
		if (urlQuery) {
			setQuery(urlQuery)
		}
	}, [searchParams])

	const autocompleteEnabled = mode === 'autocomplete'

	// Get autocomplete suggestions
	const { data: suggestions = [], isLoading: suggestionsLoading } =
		trpc.stir.autocomplete.useQuery(
			{ query: debouncedQuery, limit: 8 },
			{
				enabled: autocompleteEnabled && debouncedQuery.length > 2,
				staleTime: 30000,
			}
		)

	// Live search mode: push as you type (debounced via useDeferredValue)
	useEffect(() => {
		if (mode !== 'live') return
		const q = debouncedQuery
		if (q.length > 0) {
			startTransition(() => {
				router.replace(`${Routes.Main.Stir.Search(q)}`)
			})
		} else {
			startTransition(() => {
				router.replace(Routes.Main.Stir.Root)
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedQuery, mode, router.replace])

	const saveToHistory = (searchQuery: string) => {
		if (!searchQuery.trim()) return

		try {
			const newItem: RecentSearchChip = {
				query: searchQuery.trim(),
				timestamp: new Date(),
			}

			const updated = [
				newItem,
				...history.filter((h) => h.query !== newItem.query),
			].slice(0, MAX_HISTORY_ITEMS)

			setHistory(updated)
			localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
		} catch {
			// Ignore localStorage errors
		}
	}

	const executeSearch = (searchQuery: string) => {
		const trimmed = searchQuery.trim()
		if (!trimmed) return

		setShowSuggestions(false)
		saveToHistory(trimmed)

		startTransition(() => {
			router.push(`${Routes.Main.Stir.Search(trimmed)}`)
		})
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setQuery(value)
		setActiveIndex(-1)
		setShowSuggestions(autocompleteEnabled && value.trim().length > 2)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const visibleSuggestions = showSuggestions ? suggestions : []

		switch (e.key) {
			case 'Enter':
				e.preventDefault()
				if (query.trim().length === 0) {
					// On empty enter, reset to root and clear local state
					setShowSuggestions(false)
					startTransition(() => router.push(Routes.Main.Stir.Root))
					return
				}
				if (activeIndex >= 0 && visibleSuggestions[activeIndex]) {
					handleSuggestionClick(visibleSuggestions[activeIndex])
				} else {
					executeSearch(query)
				}
				break

			case 'ArrowDown':
				e.preventDefault()
				setActiveIndex((prev) =>
					prev < visibleSuggestions.length - 1 ? prev + 1 : 0
				)
				break

			case 'ArrowUp':
				e.preventDefault()
				setActiveIndex((prev) =>
					prev > 0 ? prev - 1 : visibleSuggestions.length - 1
				)
				break

			case 'Escape':
				setShowSuggestions(false)
				setActiveIndex(-1)
				inputRef.current?.blur()
				break
		}
	}

	const handleSuggestionClick = (suggestion: SearchSuggestion) => {
		// Direct navigation to entity pages when clicking a suggestion
		setShowSuggestions(false)
		if (suggestion.type === 'event') {
			startTransition(() => {
				router.push(Routes.Main.Events.ViewBySlug(suggestion.slug))
			})
		} else {
			startTransition(() => {
				router.push(Routes.Main.Communities.ViewBySlug(suggestion.slug))
			})
		}
	}

	const handleHistoryClick = (historyItem: RecentSearchChip) => {
		setQuery(historyItem.query)
		executeSearch(historyItem.query)
	}

	const removeHistoryItem = (queryToRemove: string) => {
		const updated = history.filter((h) => h.query !== queryToRemove)
		setHistory(updated)

		try {
			if (updated.length === 0) {
				localStorage.removeItem(SEARCH_HISTORY_KEY)
			} else {
				localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
			}
		} catch {
			// Ignore localStorage errors
		}
	}

	const clearAllHistory = () => {
		setHistory([])
		try {
			localStorage.removeItem(SEARCH_HISTORY_KEY)
		} catch {
			// Ignore localStorage errors
		}
	}

	const handleFocus = () => {
		setIsFocused(true)
		if (query.trim().length > 2 && suggestions.length > 0) {
			setShowSuggestions(true)
		}
	}

	const handleBlur = () => {
		setIsFocused(false)
		// Delay hiding suggestions to allow clicks
		setTimeout(() => {
			setShowSuggestions(false)
			setActiveIndex(-1)
		}, 200)
	}

	// Scroll active suggestion into view
	useEffect(() => {
		if (activeIndex >= 0 && suggestionRefs.current[activeIndex]) {
			suggestionRefs.current[activeIndex]?.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
			})
		}
	}, [activeIndex])

	const showRecentSearches =
		!showSuggestions && history.length > 0 && isFocused && query.length === 0

	return (
		<div className="relative w-full">
			{/* Gradient border effect */}
			<div className="absolute -inset-0.5 bg-gradient-to-r from-cranberry-40 via-purple-40 to-blue-40 rounded-2xl blur opacity-30 animate-pulse" />

			{/* Search input container */}
			<div className="relative overflow-hidden rounded-2xl bg-black/10 backdrop-blur-sm">
				<div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
					{suggestionsLoading || isPending ? (
						<Loader2 className="size-3 animate-spin text-white/80" />
					) : (
						<Sparkle
							className={cn('size-3 transition-colors', {
								'text-white/40': !isFocused,
								'text-white/80': isFocused,
							})}
						/>
					)}
				</div>

				<Input
					ref={inputRef}
					type="text"
					value={query}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					onFocus={handleFocus}
					onBlur={handleBlur}
					placeholder={placeholder}
					disabled={isPending}
					className="w-full bg-transparent border-0 text-white placeholder:text-white/50 pl-12 pr-4 py-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
					aria-label="Search events and communities"
					aria-expanded={showSuggestions}
					aria-haspopup="listbox"
					role="combobox"
				/>

				{/* Clear button */}
				{query && (
					<button
						type="button"
						className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
						onClick={() => {
							setQuery('')
							setShowSuggestions(false)
							startTransition(() => {
								router.push(Routes.Main.Stir.Root)
							})
						}}
					>
						<X className="size-4" />
					</button>
				)}
			</div>

			{/* Recent searches */}
			{showRecentSearches && (
				<div className="absolute z-50 mt-2 w-full bg-card rounded-lg border border-border shadow-sm">
					<div className="p-3">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-medium text-muted-foreground">
								Recent searches
							</h3>
							<Button
								variant="ghost"
								size="sm"
								onMouseDown={(e) => {
									e.preventDefault()
									clearAllHistory()
								}}
								className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
							>
								Clear all
							</Button>
						</div>
						<div className="flex flex-col gap-2">
							{history.map((item) => (
								<div key={item.query} className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="sm"
										onMouseDown={(e) => {
											e.preventDefault()
											handleHistoryClick(item)
										}}
										className="h-8 px-3 text-xs justify-start flex-1 text-left"
									>
										{item.query}
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onMouseDown={(e) => {
											e.preventDefault()
											removeHistoryItem(item.query)
										}}
										className="size-8 p-0 text-muted-foreground hover:text-foreground"
									>
										<X className="size-3" />
									</Button>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Autocomplete suggestions */}
			{autocompleteEnabled && showSuggestions && suggestions.length > 0 && (
				<div className="absolute z-50 mt-2 w-full bg-card rounded-lg border border-border shadow-lg overflow-hidden">
					<div className="max-h-80 overflow-y-auto">
						{suggestions.map((suggestion, index) => (
							<button
								type="button"
								key={suggestion.id}
								ref={(el) => {
									suggestionRefs.current[index] = el
								}}
								onClick={() => handleSuggestionClick(suggestion)}
								onMouseEnter={() => setActiveIndex(index)}
								className={cn(
									'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
									index === activeIndex
										? 'bg-muted text-foreground'
										: 'hover:bg-muted/50'
								)}
							>
								<div className="flex items-center gap-3 min-w-0 flex-1">
									{suggestion.type === 'event' ? (
										<Calendar className="size-4 text-muted-foreground flex-shrink-0" />
									) : (
										<Users className="size-4 text-muted-foreground flex-shrink-0" />
									)}
									<span className="truncate text-sm">{suggestion.title}</span>
								</div>
								<Badge
									variant={
										suggestion.type === 'event' ? 'secondary' : 'outline'
									}
									className="ml-2 flex-shrink-0"
								>
									{suggestion.type === 'event' ? 'Event' : 'Community'}
								</Badge>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
