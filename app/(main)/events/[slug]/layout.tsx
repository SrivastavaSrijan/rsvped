'use client'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { Routes } from '@/lib/config'

export default function EventSlugLayout({
	children,
	form,
	// To handle more modals, add them as props here (e.g., `login`, `share`)
	// and create corresponding parallel routes (`@login`, `@share`).
}: {
	children: React.ReactNode
	form: React.ReactNode
}) {
	const pathname = usePathname()
	const { slug } = useParams()
	const searchParams = useSearchParams()

	// An early return if the slug isn't available prevents errors.
	if (typeof slug !== 'string') {
		return <>{children}</>
	}

	const fullPath = pathname + (searchParams.size > 0 ? `?${searchParams.toString()}` : '')

	// 1. Map full routes to their corresponding modal slots.
	const modalRoutes: { [key: string]: React.ReactNode } = {
		[Routes.Main.Events.ViewBySlugWithRegister(slug)]: form,
	}

	// 3. Find the modal that matches the current full path.
	const activeModal = modalRoutes[fullPath]

	return (
		<>
			{activeModal}
			{children}
		</>
	)
}
