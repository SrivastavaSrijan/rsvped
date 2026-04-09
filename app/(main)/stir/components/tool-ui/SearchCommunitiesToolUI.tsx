'use client'

import { makeAssistantToolUI } from '@assistant-ui/react'
import {
	CalendarDays,
	CheckCircle2,
	Loader2,
	Users,
	XCircle,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { Card, CardContent, Skeleton } from '@/components/ui'
import type { ToolCommunityResult } from '@/lib/ai/agent'
import { toolCardVariants, toolListVariants } from './motion'

type SearchCommunitiesArgs = {
	query: string
	limit?: number
}

type SearchCommunitiesResult = ToolCommunityResult[] | { error: string }

export const SearchCommunitiesToolUI = makeAssistantToolUI<
	SearchCommunitiesArgs,
	SearchCommunitiesResult
>({
	toolName: 'searchCommunities',
	render: ({ args, result, status }) => {
		if (status.type === 'running') {
			return (
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Loader2 className="size-3 animate-spin" />
						Searching communities{args.query ? ` for "${args.query}"` : ''}...
					</div>
					<div className="grid gap-2">
						{['a', 'b'].map((id) => (
							<Card key={`skeleton-${id}`} className="gap-0 py-0">
								<CardContent className="flex items-start gap-2.5 p-2.5 lg:gap-3 lg:p-3">
									<Skeleton className="size-9 shrink-0 rounded-full" />
									<div className="flex flex-1 flex-col gap-1.5">
										<Skeleton className="h-4 w-2/3" />
										<Skeleton className="h-3 w-full" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)
		}

		if (status.type === 'incomplete') {
			return (
				<div className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
					<XCircle className="size-3.5 shrink-0" />
					Failed to search communities
				</div>
			)
		}

		if (!result || 'error' in result) {
			return (
				<div className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
					<XCircle className="size-3.5 shrink-0" />
					{result && 'error' in result ? result.error : 'No results returned'}
				</div>
			)
		}

		if (result.length === 0) {
			return (
				<div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
					No communities found for &ldquo;{args.query}&rdquo;
				</div>
			)
		}

		return (
			<div className="flex w-full min-w-0 flex-col gap-2 overflow-hidden">
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<CheckCircle2 className="size-3 text-brand" />
					Found {result.length} communit{result.length !== 1 ? 'ies' : 'y'}
				</div>
				<motion.div
					className="grid gap-2"
					variants={toolListVariants}
					initial="hidden"
					animate="visible"
				>
					<AnimatePresence initial={false}>
						{result.map((community, index) => (
							<motion.div
								key={community.id}
								custom={index}
								variants={toolCardVariants}
								initial="hidden"
								animate="visible"
								exit="exit"
								layout
							>
								<CommunityResultCard community={community} />
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>
			</div>
		)
	},
})

const CommunityResultCard = ({
	community,
}: {
	community: ToolCommunityResult
}) => {
	return (
		<Link href={`/communities/${community.slug}/view`} className="group block">
			<Card className="gap-0 overflow-hidden border-border/70 bg-background/65 py-0 shadow-xs backdrop-blur-sm transition-all group-hover:border-brand/30 group-hover:bg-muted/50 group-hover:shadow-sm">
				<CardContent className="flex items-start gap-2 p-2.5 lg:gap-3 lg:p-3">
					<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 font-bold text-brand text-sm">
						{community.name.charAt(0).toUpperCase()}
					</div>
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<p className="line-clamp-2 font-medium text-[11px] leading-snug group-hover:text-brand lg:text-sm">
							{community.name}
						</p>
						{community.description ? (
							<p className="line-clamp-2 text-[11px] text-muted-foreground lg:text-xs">
								{community.description}
							</p>
						) : null}
						<div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground lg:text-xs">
							<span className="flex min-w-0 items-center gap-1">
								<Users className="size-3" />
								{community.memberCount} member
								{community.memberCount !== 1 ? 's' : ''}
							</span>
							<span className="flex min-w-0 items-center gap-1">
								<CalendarDays className="size-3" />
								{community.eventCount} event
								{community.eventCount !== 1 ? 's' : ''}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	)
}
