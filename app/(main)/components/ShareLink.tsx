'use client'

import { Check, Copy } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui'

interface ShareLinkProps {
	display: string
	url: string
	className?: string
}

export function ShareLink({ display, url, className }: ShareLinkProps) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(url)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}

	return (
		<div
			className={`flex w-full items-center justify-between gap-2 px-2 py-2 lg:px-3 ${className}`}
		>
			<Link href={url}>
				<p className="max-w-[calc(100vw-8rem)] flex-1 truncate text-xs lg:max-w-[50ch] lg:text-sm underline underline-offset-2">
					{display}
				</p>
			</Link>
			<Button
				variant="ghost"
				size="icon"
				className="size-2.5"
				onClick={handleCopy}
			>
				{copied ? (
					<Check className="size-2.5" />
				) : (
					<Copy className="size-2.5" />
				)}
			</Button>
		</div>
	)
}
