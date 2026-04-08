'use client'

import { Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Thread } from '@/components/assistant-ui/thread'
import { useStirChatContext } from '@/components/shared/StirChatProvider'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config'

export const StirFAB = () => {
	const pathname = usePathname()
	const { clearChat } = useStirChatContext()
	const [isOpen, setIsOpen] = useState(false)

	// Hide on Stir page — full chat is already shown
	const isStirPage = pathname === Routes.Main.Stir.Root

	// Close on Escape
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				setIsOpen(false)
			}
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [isOpen])

	if (isStirPage) return null

	return (
		<>
			{/* Overlay panel */}
			{isOpen ? (
				<div className="fixed right-4 bottom-20 z-50 flex h-[60vh] w-96 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
						<div className="flex items-center gap-2">
							<Sparkles className="size-4 text-brand" />
							<span className="font-medium text-sm">Stir</span>
						</div>
						<div className="flex items-center gap-1">
							<Link href={Routes.Main.Stir.Root}>
								<Button
									variant="ghost"
									size="sm"
									className="text-xs text-muted-foreground"
									onClick={() => setIsOpen(false)}
								>
									Open full
								</Button>
							</Link>
							<Button
								variant="ghost"
								size="sm"
								className="text-xs text-muted-foreground"
								onClick={clearChat}
							>
								Clear
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="size-7"
								onClick={() => setIsOpen(false)}
								aria-label="Close chat"
							>
								<X className="size-3.5" />
							</Button>
						</div>
					</div>
					{/* Chat content */}
					<div className="flex min-h-0 flex-1 flex-col">
						<Thread />
					</div>
				</div>
			) : null}

			{/* FAB button */}
			<Button
				size="icon"
				className="fixed right-4 bottom-4 z-50 size-12 rounded-full shadow-lg"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-label={isOpen ? 'Close Stir chat' : 'Open Stir chat'}
			>
				<Sparkles className="size-5" />
			</Button>
		</>
	)
}
