'use client'

import {
	ActionBarPrimitive,
	ComposerPrimitive,
	MessagePrimitive,
	ThreadPrimitive,
	useAuiState,
} from '@assistant-ui/react'
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown'
import {
	AlertTriangle,
	ArrowUp,
	Calendar,
	Check,
	Compass,
	Copy,
	Pencil,
	RefreshCw,
	Sparkles,
	Square,
	Tag,
	TrendingUp,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type FC, useEffect, useRef, useState } from 'react'
import { useStirChatContext } from '@/components/shared/StirChatProvider'
import { Button } from '@/components/ui'
import { TOOL_DISPLAY_NAMES } from '@/lib/ai/agent/constants'
import { getSuggestionsAction } from '@/server/actions/stir'

const userMessageVariants = {
	hidden: { opacity: 0, x: 12 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { type: 'spring' as const, stiffness: 400, damping: 30 },
	},
}

const assistantMessageVariants = {
	hidden: { opacity: 0, y: 6 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring' as const, stiffness: 400, damping: 30 },
	},
}

const staggerContainer = {
	visible: { transition: { staggerChildren: 0.06 } },
}

const fadeIn = {
	hidden: { opacity: 0, scale: 0.97 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.25, ease: 'easeOut' as const },
	},
}

export const Thread: FC = () => {
	return (
		<ThreadPrimitive.Root className="flex h-full flex-col overflow-hidden">
			<ThreadPrimitive.Viewport
				data-stir-scroll-viewport
				className="flex min-h-40 flex-1 flex-col items-center gap-4 overflow-y-auto scroll-smooth px-3 py-4 lg:min-h-0 lg:px-6 lg:py-6"
			>
				<ThreadPrimitive.Empty>
					<ThreadEmpty />
				</ThreadPrimitive.Empty>
				<ThreadPrimitive.Messages
					components={{
						UserMessage,
						EditComposer,
						AssistantMessage,
					}}
				/>
			</ThreadPrimitive.Viewport>
			<ComposerArea />
		</ThreadPrimitive.Root>
	)
}

const SUGGESTION_CARDS = [
	{
		icon: TrendingUp,
		label: 'Trending events',
		prompt: 'What events are trending right now?',
	},
	{
		icon: Compass,
		label: 'Recommend for me',
		prompt: 'Recommend something fun for me this month',
	},
	{
		icon: Calendar,
		label: 'This weekend',
		prompt: 'Find me events happening this weekend',
	},
	{
		icon: Tag,
		label: 'Browse categories',
		prompt: 'What categories of events are available?',
	},
]

const useDynamicSuggestions = () => {
	const isRunning = useAuiState((s) => s.thread.isRunning)
	const messages = useAuiState((s) => s.thread.messages)
	const { pageContext } = useStirChatContext()
	const [suggestions, setSuggestions] = useState<string[]>([])
	const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

	// Derive stable text from last assistant message — serves as both effect trigger and data
	const lastAssistantText =
		messages
			.findLast((m) => m.role === 'assistant')
			?.content.filter(
				(part): part is { type: 'text'; text: string } => part.type === 'text'
			)
			.map((part) => part.text)
			.join(' ')
			.trim() ?? ''

	// Stabilize pageContext — ref for async call-time reading, key for dep triggering
	const pageContextKey = `${pageContext.page}:${pageContext.eventSlug ?? ''}:${pageContext.communitySlug ?? ''}:${pageContext.username ?? ''}`
	const pageContextRef = useRef(pageContext)
	pageContextRef.current = pageContext

	// biome-ignore lint/correctness/useExhaustiveDependencies: pageContextKey triggers re-fetch when page context changes — ref provides the actual value at call-time
	useEffect(() => {
		if (isRunning || !lastAssistantText) {
			setSuggestions([])
			return
		}

		let cancelled = false
		const fetchSuggestions = async () => {
			setIsLoadingSuggestions(true)
			const result = await getSuggestionsAction(
				lastAssistantText,
				pageContextRef.current
			)
			if (!cancelled) {
				setSuggestions(result)
				setIsLoadingSuggestions(false)
			}
		}
		fetchSuggestions()
		return () => {
			cancelled = true
			setIsLoadingSuggestions(false)
		}
	}, [isRunning, lastAssistantText, pageContextKey])

	return {
		suggestions,
		isLoadingSuggestions,
		isRunning,
	}
}

const ThreadEmpty: FC = () => {
	return (
		<motion.div
			className="flex flex-1 flex-col items-center justify-center gap-5"
			initial="hidden"
			animate="visible"
			variants={staggerContainer}
		>
			<motion.div
				className="flex flex-col items-center gap-3"
				variants={fadeIn}
			>
				<div className="flex size-12 items-center justify-center rounded-full bg-brand-pale-bg">
					<Sparkles className="size-4 text-brand" />
				</div>
				<div className="flex flex-col items-center gap-1">
					<h2 className="font-semibold text-lg">
						What would you like to discover?
					</h2>
					<p className="text-center text-sm text-muted-foreground">
						Search events, explore communities, or get personalized
						recommendations
					</p>
				</div>
			</motion.div>
			<motion.div
				className="grid w-full max-w-md grid-cols-2 gap-2"
				variants={staggerContainer}
			>
				{SUGGESTION_CARDS.map((card) => (
					<motion.div key={card.prompt} variants={fadeIn}>
						<ThreadPrimitive.Suggestion
							prompt={card.prompt}
							method="replace"
							autoSend
							asChild
						>
							<button
								type="button"
								className="flex w-full items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-2.5 py-2 text-left backdrop-blur-sm transition-all hover:border-border hover:bg-background/80 cursor-pointer lg:gap-2.5 lg:px-3 lg:py-2.5"
							>
								<card.icon className="size-4 shrink-0 text-muted-foreground" />
								<span className="text-sm">{card.label}</span>
							</button>
						</ThreadPrimitive.Suggestion>
					</motion.div>
				))}
			</motion.div>
		</motion.div>
	)
}

const ComposerArea: FC = () => {
	const { suggestions, isLoadingSuggestions, isRunning } =
		useDynamicSuggestions()
	const showSuggestionSkeleton = !isRunning && isLoadingSuggestions

	return (
		<div
			data-stir-composer
			className="flex shrink-0 flex-col gap-2 border-t border-border/40 bg-background/60 px-3 pb-2 pt-2 backdrop-blur-sm lg:px-6 lg:pb-4 lg:pt-3"
		>
			<ThreadPrimitive.If empty={false}>
				<AnimatePresence mode="wait">
					{showSuggestionSkeleton ? (
						<motion.div
							key="skeleton"
							data-stir-suggestion-row
							className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3 -mb-2"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
						>
							<SuggestionSkeleton />
						</motion.div>
					) : suggestions.length > 0 ? (
						<motion.div
							key="chips"
							data-stir-suggestion-row
							className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3 -mb-2"
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							{suggestions.map((suggestion) => (
								<ThreadPrimitive.Suggestion
									key={suggestion}
									prompt={suggestion}
									method="replace"
									autoSend
									asChild
								>
									<button
										type="button"
										className="w-fit shrink-0 whitespace-nowrap rounded-full border border-border/60 bg-background/50 px-3.5 py-2 text-[13px] text-muted-foreground backdrop-blur-sm transition-all hover:border-border hover:bg-background/80 hover:text-foreground"
									>
										{suggestion}
									</button>
								</ThreadPrimitive.Suggestion>
							))}
						</motion.div>
					) : null}
				</AnimatePresence>
			</ThreadPrimitive.If>
			<Composer />
		</div>
	)
}

const SuggestionSkeleton: FC = () => {
	return (
		<>
			{[0, 1, 2].map((index) => (
				<motion.div
					key={index}
					className="relative h-8 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted/60"
					style={{ width: 112 + index * 26 }}
					animate={{ opacity: [0.45, 0.85, 0.45] }}
					transition={{
						duration: 1.1,
						repeat: Number.POSITIVE_INFINITY,
						delay: index * 0.12,
					}}
				>
					<motion.div
						className="absolute inset-y-0 w-10 bg-linear-to-r from-transparent via-background/70 to-transparent"
						animate={{ x: [-52, 190] }}
						transition={{
							duration: 1.2,
							repeat: Number.POSITIVE_INFINITY,
							delay: index * 0.08,
							ease: 'linear',
						}}
					/>
				</motion.div>
			))}
			<span className="sr-only">Loading follow-up suggestions</span>
		</>
	)
}

const Composer: FC = () => {
	return (
		<ComposerPrimitive.Root className="flex items-center gap-2 rounded-2xl border border-border/40 bg-background/80 px-3 py-2.5 shadow-sm backdrop-blur-sm transition-colors focus-within:border-border lg:px-4 lg:py-3">
			<ComposerPrimitive.Input
				placeholder="Ask anything"
				className="min-h-6 flex-1 resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground/60 leading-relaxed"
				submitOnEnter
			/>
			<ThreadPrimitive.If running>
				<ComposerPrimitive.Cancel asChild>
					<Button
						size="icon"
						variant="outline"
						className="size-8 shrink-0 rounded-xl border-border/60"
						aria-label="Stop generating"
					>
						<Square className="size-3.5" />
					</Button>
				</ComposerPrimitive.Cancel>
			</ThreadPrimitive.If>
			<ThreadPrimitive.If running={false}>
				<ComposerPrimitive.Send asChild>
					<Button
						size="icon"
						className="size-8 shrink-0 rounded-xl"
						aria-label="Send message"
					>
						<ArrowUp className="size-3.5" />
					</Button>
				</ComposerPrimitive.Send>
			</ThreadPrimitive.If>
		</ComposerPrimitive.Root>
	)
}

const UserMessage: FC = () => {
	const [hovered, setHovered] = useState(false)
	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={userMessageVariants}
			className="relative w-full"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<MessagePrimitive.Root className="flex w-full min-w-0 flex-col items-end">
				<div className="max-w-[85%] rounded-2xl bg-brand px-3 py-2.5 text-sm leading-relaxed text-white lg:max-w-[70%] lg:px-4">
					<MessagePrimitive.Content />
				</div>
				<motion.div
					animate={{ opacity: hovered ? 1 : 0 }}
					transition={{ duration: 0.15, ease: 'easeOut' }}
					className="mr-3 flex h-5 items-center gap-0.5"
				>
					<ActionBarPrimitive.Edit asChild>
						<button
							type="button"
							className="inline-flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
						>
							<Pencil className="size-3" />
						</button>
					</ActionBarPrimitive.Edit>
				</motion.div>
			</MessagePrimitive.Root>
		</motion.div>
	)
}

const EditComposer: FC = () => {
	return (
		<ComposerPrimitive.Root className="flex w-full flex-col gap-2 rounded-xl border border-border bg-muted p-3">
			<ComposerPrimitive.Input className="flex-1 resize-none bg-transparent text-sm outline-none" />
			<div className="flex justify-end gap-2">
				<ComposerPrimitive.Cancel asChild>
					<Button variant="ghost" size="sm">
						Cancel
					</Button>
				</ComposerPrimitive.Cancel>
				<ComposerPrimitive.Send asChild>
					<Button size="sm">Send</Button>
				</ComposerPrimitive.Send>
			</div>
		</ComposerPrimitive.Root>
	)
}

const AssistantMessage: FC = () => {
	const [hovered, setHovered] = useState(false)
	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={assistantMessageVariants}
			className="relative w-full max-w-full"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<MessagePrimitive.Root className="aui-assistant-message flex w-full max-w-full flex-col items-start gap-2">
				<ThinkingIndicator />
				<ErrorIndicator />
				<MessagePrimitive.Content
					components={{
						Text: MarkdownText,
						tools: {
							by_name: {},
							Fallback: ToolFallback,
						},
					}}
				/>
				<motion.div
					animate={{ opacity: hovered ? 1 : 0 }}
					transition={{ duration: 0.15, ease: 'easeOut' }}
					className="mt-0.5 flex h-5 items-center gap-3"
				>
					<ActionBarPrimitive.Copy asChild>
						<button
							type="button"
							className="inline-flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
						>
							<Copy className="size-3" />
						</button>
					</ActionBarPrimitive.Copy>
					<ActionBarPrimitive.Reload asChild>
						<button
							type="button"
							className="inline-flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
						>
							<RefreshCw className="size-3" />
						</button>
					</ActionBarPrimitive.Reload>
				</motion.div>
			</MessagePrimitive.Root>
		</motion.div>
	)
}

const ErrorIndicator: FC = () => {
	const status = useAuiState((s) => s.message.status)
	const isError = status?.type === 'incomplete' && status.reason === 'error'

	if (!isError) return null

	return (
		<motion.div
			className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
			initial={{ opacity: 0, y: 4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
		>
			<AlertTriangle className="size-4 shrink-0" />
			<span>Something went wrong. Try sending your message again.</span>
		</motion.div>
	)
}

/** Claude-style expanding skeleton lines */
const ThinkingIndicator: FC = () => {
	const status = useAuiState((s) => s.message.status)
	const content = useAuiState((s) => s.message.content)
	const isRunning = status?.type === 'running'
	const hasTextContent = content.some(
		(part) => part.type === 'text' && part.text.trim().length > 0
	)

	if (!isRunning || hasTextContent) return null

	return (
		<motion.div
			className="flex w-full flex-col gap-2.5 py-1"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.2 }}
		>
			{[0, 1, 2].map((i) => (
				<motion.div
					key={i}
					className="relative h-3 overflow-hidden rounded-md bg-muted/50"
					initial={{ width: 0, opacity: 0 }}
					animate={{
						width: i === 2 ? '45%' : i === 1 ? '70%' : '90%',
						opacity: 1,
					}}
					transition={{
						width: {
							type: 'spring',
							stiffness: 100,
							damping: 20,
							delay: i * 0.12,
						},
						opacity: { duration: 0.15, delay: i * 0.08 },
					}}
				>
					<motion.div
						className="absolute inset-0 bg-linear-to-r from-transparent via-muted-foreground/8 to-transparent"
						animate={{ x: ['-100%', '100%'] }}
						transition={{
							duration: 1.5,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
							delay: i * 0.2,
						}}
					/>
				</motion.div>
			))}
			<span className="sr-only">Thinking</span>
		</motion.div>
	)
}

const MarkdownText: FC = () => {
	return (
		<MarkdownTextPrimitive className="aui-markdown order-first min-w-0 max-w-none wrap-break-word text-sm leading-relaxed text-foreground" />
	)
}

const ToolFallback: FC<{
	toolName: string
	status: { readonly type: string }
}> = ({ toolName, status }) => {
	const isComplete = status.type === 'complete'
	const displayName = TOOL_DISPLAY_NAMES[toolName] ?? `Running ${toolName}`

	return (
		<motion.div
			className="flex items-center gap-2 py-1 text-xs text-muted-foreground"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.2 }}
		>
			{isComplete ? (
				<Check className="size-3 text-brand" />
			) : (
				<div className="size-3 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
			)}
			{displayName}
		</motion.div>
	)
}
