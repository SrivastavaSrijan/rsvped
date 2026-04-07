'use client'

import {
	ActionBarPrimitive,
	ComposerPrimitive,
	MessagePrimitive,
	ThreadPrimitive,
	useMessage,
} from '@assistant-ui/react'
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown'
import {
	ArrowUp,
	Calendar,
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
import type { FC } from 'react'
import { Button } from '@/components/ui'

const messageVariants = {
	hidden: { opacity: 0, y: 8 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.3, ease: 'easeOut' as const },
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
			<ThreadPrimitive.Viewport className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto scroll-smooth px-3 py-4 lg:px-6 lg:py-6">
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

const FOLLOW_UP_SUGGESTIONS = [
	'Tell me more about the first one',
	'Any free events?',
	'Show me something else',
]

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
	return (
		<div className="flex shrink-0 flex-col gap-2 border-t border-border/40 bg-background/60 px-3 pb-2 pt-2 backdrop-blur-sm lg:px-6 lg:pb-4 lg:pt-3">
			<AnimatePresence>
				<ThreadPrimitive.If empty={false} running={false}>
					<motion.div
						className="flex gap-2 overflow-x-auto"
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2 }}
					>
						{FOLLOW_UP_SUGGESTIONS.map((suggestion) => (
							<ThreadPrimitive.Suggestion
								key={suggestion}
								prompt={suggestion}
								method="replace"
								autoSend
								asChild
							>
								<button
									type="button"
									className="shrink-0 whitespace-nowrap rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm transition-all hover:border-border hover:bg-background/80 hover:text-foreground"
								>
									{suggestion}
								</button>
							</ThreadPrimitive.Suggestion>
						))}
					</motion.div>
				</ThreadPrimitive.If>
			</AnimatePresence>
			<Composer />
		</div>
	)
}

const Composer: FC = () => {
	return (
		<ComposerPrimitive.Root className="flex items-center gap-2 rounded-2xl border border-border/40 bg-background/80 px-3 py-2.5 shadow-sm backdrop-blur-sm transition-colors focus-within:border-border lg:px-4 lg:py-3">
			<ComposerPrimitive.Input
				autoFocus
				placeholder="Ask anything"
				className="min-h-6 flex-1 resize-none bg-transparent text-sm  outline-none placeholder:text-muted-foreground/60 leading-relaxed"
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
	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={messageVariants}
			className="w-full"
		>
			<MessagePrimitive.Root className="flex w-full min-w-0 flex-col items-end gap-1">
				<div className="max-w-[85%] rounded-2xl bg-brand px-3 py-2.5 text-sm leading-relaxed text-white lg:max-w-[70%] lg:px-4">
					<MessagePrimitive.Content />
				</div>
				<UserActionBar />
			</MessagePrimitive.Root>
		</motion.div>
	)
}

const UserActionBar: FC = () => {
	return (
		<ActionBarPrimitive.Root
			hideWhenRunning
			autohide="not-last"
			className="flex items-center gap-1"
		>
			<ActionBarPrimitive.Edit asChild>
				<Button variant="ghost" size="icon" className="size-6">
					<Pencil className="size-3" />
				</Button>
			</ActionBarPrimitive.Edit>
		</ActionBarPrimitive.Root>
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
	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={messageVariants}
			className="w-full max-w-full"
		>
			<MessagePrimitive.Root className="aui-assistant-message flex w-full max-w-full flex-col items-start gap-2 overflow-hidden">
				<ThinkingIndicator />
				<MessagePrimitive.Content
					components={{
						Text: MarkdownText,
						tools: {
							by_name: {},
							Fallback: ToolFallback,
						},
					}}
				/>
				<AssistantActionBar />
			</MessagePrimitive.Root>
		</motion.div>
	)
}

const ThinkingIndicator: FC = () => {
	const message = useMessage()
	const isRunning = message.status?.type === 'running'
	const hasContent = message.content && message.content.length > 0

	if (!isRunning || hasContent) return null

	return (
		<motion.div
			className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.2 }}
		>
			<div className="size-3 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
			Thinking...
		</motion.div>
	)
}

const AssistantActionBar: FC = () => {
	return (
		<ActionBarPrimitive.Root
			autohide="not-last"
			autohideFloat="single-branch"
			className="flex items-center gap-1"
		>
			<ActionBarPrimitive.Copy asChild>
				<Button variant="ghost" size="icon" className="size-6">
					<Copy className="size-3" />
				</Button>
			</ActionBarPrimitive.Copy>
			<ActionBarPrimitive.Reload asChild>
				<Button variant="ghost" size="icon" className="size-6">
					<RefreshCw className="size-3" />
				</Button>
			</ActionBarPrimitive.Reload>
		</ActionBarPrimitive.Root>
	)
}

const MarkdownText: FC = () => {
	return (
		<div className="order-first min-w-0 text-sm leading-relaxed text-foreground">
			<MarkdownTextPrimitive
				className="aui-markdown prose prose-sm max-w-none break-words text-foreground prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-headings:text-foreground prose-li:my-0"
				smooth
			/>
		</div>
	)
}

const ToolFallback: FC = () => {
	return (
		<motion.div
			className="flex items-center gap-2 py-1 text-xs text-muted-foreground"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.2 }}
		>
			<div className="size-3 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
			Thinking...
		</motion.div>
	)
}
