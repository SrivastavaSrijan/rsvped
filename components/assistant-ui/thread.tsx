'use client'

import {
	ActionBarPrimitive,
	ComposerPrimitive,
	MessagePrimitive,
	ThreadPrimitive,
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
import type { FC } from 'react'
import { Button } from '@/components/ui'

export const Thread: FC = () => {
	return (
		<ThreadPrimitive.Root className="flex h-full flex-col">
			<ThreadPrimitive.Viewport className="flex flex-1 flex-col items-center gap-4 overflow-y-auto scroll-smooth px-2 py-4 lg:px-0">
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
		<div className="flex flex-1 flex-col items-center justify-center gap-5">
			<div className="flex flex-col items-center gap-2">
				<div className="flex size-10 items-center justify-center rounded-full bg-brand-pale-bg">
					<Sparkles className="size-5 text-brand" />
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
			</div>
			<div className="grid w-full max-w-md grid-cols-2 gap-2">
				{SUGGESTION_CARDS.map((card) => (
					<ThreadPrimitive.Suggestion
						key={card.prompt}
						prompt={card.prompt}
						method="replace"
						autoSend
						asChild
					>
						<button
							type="button"
							className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-left transition-colors hover:bg-secondary"
						>
							<card.icon className="size-4 shrink-0 text-muted-foreground" />
							<span className="text-sm">{card.label}</span>
						</button>
					</ThreadPrimitive.Suggestion>
				))}
			</div>
		</div>
	)
}

const ComposerArea: FC = () => {
	return (
		<div className="flex flex-col gap-2 pb-4 pt-2">
			<ThreadPrimitive.If empty={false} running={false}>
				<div className="flex flex-wrap gap-2">
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
								className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
							>
								{suggestion}
							</button>
						</ThreadPrimitive.Suggestion>
					))}
				</div>
			</ThreadPrimitive.If>
			<Composer />
			<p className="text-center text-xs text-muted-foreground">
				Stir searches your event database. Results may not be exhaustive.
			</p>
		</div>
	)
}

const Composer: FC = () => {
	return (
		<ComposerPrimitive.Root className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 shadow-sm">
			<ComposerPrimitive.Input
				autoFocus
				placeholder="Ask about events, communities, or what's trending..."
				className="h-10 flex-1 resize-none bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
				submitOnEnter
			/>
			<ThreadPrimitive.If running>
				<ComposerPrimitive.Cancel asChild>
					<Button
						size="icon"
						variant="outline"
						className="size-9 shrink-0 rounded-xl"
						aria-label="Stop generating"
					>
						<Square className="size-4" />
					</Button>
				</ComposerPrimitive.Cancel>
			</ThreadPrimitive.If>
			<ThreadPrimitive.If running={false}>
				<ComposerPrimitive.Send asChild>
					<Button
						size="icon"
						className="size-9 shrink-0 rounded-xl"
						aria-label="Send message"
					>
						<ArrowUp className="size-4" />
					</Button>
				</ComposerPrimitive.Send>
			</ThreadPrimitive.If>
		</ComposerPrimitive.Root>
	)
}

const UserMessage: FC = () => {
	return (
		<MessagePrimitive.Root className="flex w-full flex-col items-end gap-1">
			<div className="max-w-[85%] rounded-2xl bg-brand px-4 py-2.5 text-sm leading-relaxed text-white lg:max-w-[70%]">
				<MessagePrimitive.Content />
			</div>
			<UserActionBar />
		</MessagePrimitive.Root>
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
		<MessagePrimitive.Root className="flex w-full flex-col items-start gap-2">
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
		<div className="max-w-[85%] text-sm leading-relaxed text-foreground lg:max-w-[70%]">
			<MarkdownTextPrimitive
				className="aui-markdown prose prose-sm max-w-none text-foreground prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-headings:text-foreground prose-li:my-0"
				smooth
			/>
		</div>
	)
}

const ToolFallback: FC = () => {
	return (
		<div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
			<div className="size-3 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
			Thinking...
		</div>
	)
}
