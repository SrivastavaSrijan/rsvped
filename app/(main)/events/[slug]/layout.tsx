'use client'
import { useSearchParams } from 'next/navigation'
export default function EventSlugLayout({
	children,
	form,
}: {
	children: React.ReactNode
	form: React.ReactNode
}) {
	const searchParams = useSearchParams()
	return (
		<>
			{searchParams.get('form') ? form : null}
			{children}
		</>
	)
}
