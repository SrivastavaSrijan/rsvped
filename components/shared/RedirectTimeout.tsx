'use client'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config'

export interface RedirectTimeoutProps {
	title: string
	description: string
	illustration?: string
}

export const RedirectTimeout = ({
	title,
	description,
	illustration,
}: RedirectTimeoutProps) => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const nextUrl = searchParams.get('next') || Routes.Home
	const dismissable = searchParams.get('dismissable') !== 'false'

	useEffect(() => {
		if (!dismissable) return
		const timer = setTimeout(() => {
			router.replace(nextUrl)
		}, 2000)
		return () => clearTimeout(timer)
	}, [nextUrl, router, dismissable])

	return (
		<div className="flex h-screen w-screen flex-col items-center justify-center gap-5 px-6 text-center">
			{illustration ? (
				// biome-ignore lint/performance/noImgElement: Workaround for illustration
				<img
					src={illustration}
					alt="Illustration"
					className="h-60 w-60 rounded-full"
				/>
			) : null}
			<div className="flex max-w-md flex-col items-center gap-2">
				<h1 className="font-bold text-2xl">{title}</h1>
				<p className="text-muted-foreground text-sm leading-relaxed">
					{description}
				</p>
			</div>
			{dismissable ? (
				<Loader2 className="h-6 w-6 animate-spin text-gray-500" />
			) : (
				<Button
					onClick={() => router.replace(nextUrl)}
					className="cursor-pointer gap-2"
				>
					Continue exploring
					<ArrowRight className="size-4" />
				</Button>
			)}
		</div>
	)
}
