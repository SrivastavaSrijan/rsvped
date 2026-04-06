'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
	AlertCircle,
	Loader2,
	Search,
	Sparkles,
	WrenchIcon,
	X,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Button, Image, Input } from '@/components/ui'
import { Routes } from '@/lib/config'
import { getEventDateTime } from '@/lib/hooks'

export const AIDiscover = () => {
	const [input, setInput] = useState('')

	const transport = useMemo(
		() => new DefaultChatTransport({ api: '/api/ai/discover' }),
		[]
	)

	const { messages, sendMessage, stop, status, error } = useChat({
		id: 'ai-discover',
		transport,
	})

	const isStreaming = status === 'streaming'
	const assistantMessages = messages.filter((m) => m.role === 'assistant')

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!input.trim() || isStreaming) return
		sendMessage({ text: input })
		setInput('')
	}

	return (
		<div className="flex flex-col gap-4">
			<form onSubmit={handleSubmit} className="flex gap-2">
				<div className="relative flex-1">
					<Sparkles className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Find events — try 'tech meetups this weekend' or 'music in Brooklyn'"
						className="pl-10"
						disabled={isStreaming}
					/>
				</div>
				{isStreaming ? (
					<Button type="button" variant="secondary" onClick={stop}>
						<X className="size-4" />
					</Button>
				) : (
					<Button type="submit" disabled={!input.trim()}>
						<Search className="size-4" />
					</Button>
				)}
			</form>

			{error ? (
				<div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
					<AlertCircle className="size-4 shrink-0" />
					<span>
						AI search is temporarily unavailable. Try browsing events below.
					</span>
				</div>
			) : null}

			{assistantMessages.map((message) => (
				<div key={message.id} className="flex flex-col gap-3">
					{message.parts.map((part, idx) => {
						if (part.type === 'text') {
							return (
								<div
									key={`text-${message.id}-${idx}`}
									className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed"
								>
									<AIMessageContent content={part.text} />
								</div>
							)
						}
						// Show tool results as event cards
						if (
							part.type.startsWith('tool-') &&
							'state' in part &&
							part.state === 'output-available'
						) {
							const output = part.output as unknown
							if (Array.isArray(output) && output.length > 0) {
								return (
									<EventCardGrid
										key={`tool-result-${message.id}-${idx}`}
										events={output as EventResult[]}
									/>
								)
							}
							return null
						}
						// Show tool execution states
						if (
							part.type.startsWith('tool-') &&
							'state' in part &&
							part.state === 'input-available'
						) {
							return (
								<ToolLoadingIndicator
									key={`tool-${message.id}-${idx}`}
									toolName={part.type.replace('tool-', '')}
								/>
							)
						}
						return null
					})}
				</div>
			))}

			{isStreaming && assistantMessages.length === 0 ? (
				<div className="flex items-center gap-2 text-muted-foreground text-sm">
					<Loader2 className="size-4 animate-spin" />
					<span>Searching events...</span>
				</div>
			) : null}
		</div>
	)
}

function ToolLoadingIndicator({ toolName }: { toolName: string }) {
	const labels: Record<string, string> = {
		searchEvents: 'Searching events...',
		getEventDetails: 'Getting event details...',
		getCommunityEvents: 'Loading community events...',
	}
	return (
		<div className="flex items-center gap-2 text-muted-foreground text-xs">
			<WrenchIcon className="size-3 animate-pulse" />
			<span>{labels[toolName] ?? 'Processing...'}</span>
		</div>
	)
}

function AIMessageContent({ content }: { content: string }) {
	if (!content.trim()) return null
	const paragraphs = content.split('\n\n').filter(Boolean)
	return (
		<>
			{paragraphs.map((p, i) => (
				<p key={`p-${i}-${p.slice(0, 20)}`}>{p}</p>
			))}
		</>
	)
}

interface EventResult {
	id: string
	title: string
	slug: string
	startDate: string
	endDate: string
	coverImage: string | null
	location: string
	community?: string | null
	categories?: string[]
}

function EventCardGrid({ events }: { events: EventResult[] }) {
	return (
		<div className="flex flex-col gap-2">
			{events.map((event) => (
				<EventResultCard key={event.id} event={event} />
			))}
		</div>
	)
}

function EventResultCard({ event }: { event: EventResult }) {
	const { range } = getEventDateTime({
		start: event.startDate,
		end: event.endDate,
	})

	return (
		<Link
			href={Routes.Main.Events.ViewBySlug(event.slug)}
			className="flex items-center gap-3 rounded-lg border border-border-primary p-2 transition-colors hover:bg-muted/50"
		>
			<div className="shrink-0">
				{event.coverImage ? (
					<Image
						src={event.coverImage}
						alt={event.title}
						width={56}
						height={56}
						className="rounded-md object-cover"
					/>
				) : null}
			</div>
			<div className="flex-1 min-w-0">
				<h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
				<p className="text-xs text-muted-foreground">{range.date}</p>
				<p className="text-xs text-muted-foreground line-clamp-1">
					{event.location}
				</p>
			</div>
		</Link>
	)
}
