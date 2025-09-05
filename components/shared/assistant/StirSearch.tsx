'use client'
import { Loader2, Sparkle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState } from 'react'
import { Textarea } from '@/components/ui'
import { Routes } from '@/lib/config/routes'
import { useAutosizeTextArea } from '@/lib/hooks'

export const StirSearch = () => {
	const [query, setQuery] = useState<string>('')
	const [isLoading, setLoading] = useState<boolean>(false)
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const router = useRouter()
	const params = useSearchParams()

	const { adjustHeight } = useAutosizeTextArea(textareaRef, { padding: 4 })

	const submitSearch = () => {
		const q = query.trim()
		if (!q) return
		setLoading(true)
		const type = params.get('type') as
			| 'all'
			| 'events'
			| 'users'
			| 'communities'
		router.push(Routes.Main.Stir.Search(q, type ?? undefined))
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			e.stopPropagation()
			submitSearch()
		}
	}

	return (
		<div className="relative w-full">
			<div className="absolute -inset-0.5 bg-gradient-to-r from-cranberry-40 via-purple-40 to-blue-40 rounded-full blur opacity-30 animate-pulse" />
			<div className="relative overflow-hidden rounded-full">
				<div className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-10">
					{isLoading ? (
						<Loader2 className="size-3 lg:size-4 animate-spin text-white/80" />
					) : (
						<Sparkle className="size-3 lg:size-4 stroke-white/80" />
					)}
				</div>
				<Textarea
					ref={textareaRef}
					value={query}
					onChange={(e) => {
						setQuery(e.target.value)
						adjustHeight()
					}}
					placeholder="What's your story, morning glory?"
					className="w-full text-base lg:text-2xl min-h-[60px] lg:min-h-[80px] max-h-64 bg-black/5 rounded-full border-gray-70/30 text-gray-10 placeholder:text-gray-10/70 focus:border-cranberry-40/50 focus:ring-cranberry-40/20 pl-12 lg:pl-20 pr-12 lg:pr-16 py-4 lg:py-6 resize-none overflow-hidden focus:outline-none focus:ring-2"
					onKeyDown={handleKeyDown}
					rows={1}
				/>
			</div>
		</div>
	)
}
