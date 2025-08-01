'use client'

import { useSearchParams } from 'next/navigation'

export default function FormLayout({
	children,
}: {
	children?: React.ReactNode
}) {
	const searchParams = useSearchParams()
	const action = searchParams.get('action')

	return (
		<>
			{/* This layout is used for forms and modals */}
			{/* Renders children when an action query param is present */}
			{action && children}
		</>
	)
}
