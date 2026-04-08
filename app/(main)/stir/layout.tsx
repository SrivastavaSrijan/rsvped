'use client'

import { useEffect, useRef } from 'react'
import { useIsMobileSafari } from './hooks/useIsMobileSafari'
import { useStirViewportHeight } from './hooks/useStirViewportHeight'

interface StirLayoutProps {
	children: React.ReactNode
}

export default function StirLayout({ children }: StirLayoutProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const isMobileSafari = useIsMobileSafari()

	useEffect(() => {
		document.body.dataset.stirActive = 'true'
		return () => {
			delete document.body.dataset.stirActive
		}
	}, [])

	useStirViewportHeight(containerRef, isMobileSafari)

	return (
		<div
			ref={containerRef}
			data-stir-container
			className="relative mx-auto flex h-[calc(var(--dvh,100dvh)-var(--navbar-height))] w-full max-w-wide-page flex-col overflow-hidden px-2 pb-2 lg:px-8 lg:pb-4"
		>
			<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/40 bg-background/60 shadow-lg backdrop-blur-sm">
				<div className="pointer-events-none absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-brand/6 to-transparent" />
				{children}
			</div>
		</div>
	)
}
