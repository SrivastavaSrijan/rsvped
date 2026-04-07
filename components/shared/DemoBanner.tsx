'use client'
import { ArrowRight, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config'

export const DemoBanner = () => {
	const [dismissed, setDismissed] = useState(() => {
		if (typeof window === 'undefined') return false
		return sessionStorage.getItem('demo-banner-dismissed') === 'true'
	})

	if (dismissed) return null

	const handleDismiss = () => {
		sessionStorage.setItem('demo-banner-dismissed', 'true')
		setDismissed(true)
	}

	return (
		<div className="relative z-50 flex items-center justify-center gap-3 bg-cranberry-90/90 px-4 py-2 text-cranberry-10 text-sm backdrop-blur-sm">
			<span>
				You&apos;re exploring as <strong>Alex Demo</strong> &mdash;{' '}
				<Link
					href={Routes.Auth.SignUp}
					className="inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-white"
				>
					Sign up for real
					<ArrowRight className="size-3" />
				</Link>
			</span>
			<Button
				variant="ghost"
				size="icon"
				className="absolute right-2 size-6 cursor-pointer text-cranberry-20 hover:bg-cranberry-80 hover:text-white"
				onClick={handleDismiss}
				aria-label="Dismiss demo banner"
			>
				<X className="size-3.5" />
			</Button>
		</div>
	)
}
