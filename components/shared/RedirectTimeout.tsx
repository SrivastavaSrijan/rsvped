'use client'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Routes } from '@/lib/config'

export interface RedirectTimeoutProps {
	title: string
	description: string
	illustration?: string
}

export const RedirectTimeout = ({ title, description, illustration }: RedirectTimeoutProps) => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const nextUrl = searchParams.get('next') || Routes.Home

	useEffect(() => {
		const timer = setTimeout(() => {
			router.replace(nextUrl)
		}, 2000) // 2-second delay
		return () => clearTimeout(timer)
	}, [nextUrl, router])

	return (
		<div className="flex h-screen w-screen flex-col items-center justify-center gap-5 text-center">
			{illustration && (
				// biome-ignore lint/performance/noImgElement: Workaround for illustration
				<img src={illustration} alt="Illustration" className="h-60 w-60 rounded-full" />
			)}
			<div className="flex flex-col items-center gap-2">
				<h1 className="font-bold text-2xl">{title}</h1>
				<p className="text-sm">{description}</p>
			</div>
			<Loader2 className="h-6 w-6 animate-spin text-gray-500" />
		</div>
	)
}
