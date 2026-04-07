'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Routes } from '@/lib/config/routes'
import { cn } from '@/lib/utils'
import { copy } from '../../copy'

export const StirSuggestionChips = () => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [isPending, startTransition] = useTransition()
	const hasQuery = !!searchParams.get('q')

	if (hasQuery) return null

	return (
		<div className="flex flex-wrap gap-2">
			{copy.stir.chipExamples.map((chip) => (
				<button
					key={chip}
					type="button"
					disabled={isPending}
					onClick={() => {
						startTransition(() => {
							router.push(Routes.Main.Stir.Search(chip))
						})
					}}
					className={cn(
						'cursor-pointer rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white/90',
						isPending && 'opacity-50'
					)}
				>
					{chip}
				</button>
			))}
		</div>
	)
}
