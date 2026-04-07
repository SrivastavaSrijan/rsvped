'use client'

import { makeAssistantToolUI } from '@assistant-ui/react'
import { CheckCircle2, Loader2, Tag, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui'
import type { ToolCategoryResult } from '@/lib/ai/agent'

type GetCategoriesArgs = Record<string, never>
type GetCategoriesResult = ToolCategoryResult[] | { error: string }

export const GetCategoriesToolUI = makeAssistantToolUI<
	GetCategoriesArgs,
	GetCategoriesResult
>({
	toolName: 'getCategories',
	render: ({ result, status }) => {
		if (status.type === 'running') {
			return (
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<Loader2 className="size-3 animate-spin" />
					Loading categories...
				</div>
			)
		}

		if (status.type === 'incomplete') {
			return (
				<div className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
					<XCircle className="size-3.5 shrink-0" />
					Failed to load categories
				</div>
			)
		}

		if (!result || 'error' in result) {
			return (
				<div className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
					<XCircle className="size-3.5 shrink-0" />
					{result && 'error' in result ? result.error : 'No categories found'}
				</div>
			)
		}

		return (
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<CheckCircle2 className="size-3 text-green-600" />
					{result.length} categor{result.length !== 1 ? 'ies' : 'y'} available
				</div>
				<div className="flex flex-wrap gap-1.5">
					{result.map((category) => (
						<Link
							key={category.slug}
							href={`/events/discover?category=${category.slug}`}
							className="group"
						>
							<Badge
								variant="outline"
								className="cursor-pointer gap-1 transition-colors group-hover:border-brand/30 group-hover:text-brand"
							>
								<Tag className="size-3" />
								{category.name}
								<span className="text-muted-foreground">
									({category.eventCount})
								</span>
							</Badge>
						</Link>
					))}
				</div>
			</div>
		)
	},
})
