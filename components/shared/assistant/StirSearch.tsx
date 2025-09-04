'use client'
import { Loader2, Sparkle } from 'lucide-react'
import { useRef, useState } from 'react'
import { Textarea } from '@/components/ui'
import { useAutosizeTextArea } from '@/lib/hooks'

export const StirSearch = () => {
	const [customPrompt, setCustomPrompt] = useState<string>('')
	const [isLoading, setLoading] = useState<boolean>(false)
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)

	const { adjustHeight } = useAutosizeTextArea(textareaRef, { padding: 4 })

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			e.stopPropagation()
			if (customPrompt.trim()) {
				// handleCustomAction()
			}
		}
	}
	return (
		<div className="relative w">
			<div className="absolute -inset-0.5 bg-gradient-to-r from-cranberry-40 via-purple-40 to-blue-40 rounded-lg blur opacity-30 animate-pulse" />
			<div className="relative">
				<div className="absolute left-3 top-[18px] -translate-y-1/2 z-10">
					{isLoading ? (
						<Loader2 className="size-3 animate-spin" />
					) : (
						<Sparkle className="size-3 stroke-white" />
					)}
				</div>
				<Textarea
					ref={textareaRef}
					value={customPrompt}
					onChange={(e) => {
						setCustomPrompt(e.target.value)
						adjustHeight()
					}}
					placeholder="What's your story, moring glory?"
					className="w-full min-h-[80px] max-h-32 text-sm bg-black/5 rounded-3xl  border-gray-70/30 text-gray-10 placeholder:text-gray-10 focus:border-cranberry-40/50 focus:ring-cranberry-40/20 pl-10 pr-12 py-2.5 resize-none overflow-hidden focus:outline-none focus:ring-1"
					onKeyDown={handleKeyDown}
					rows={1}
				/>
			</div>
		</div>
	)
}
