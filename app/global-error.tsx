'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		Sentry.captureException(error)
	}, [error])

	return (
		<html lang="en">
			<body>
				{/* Inline styles are intentional — Tailwind may not be loaded in this error boundary */}
				<div style={{ padding: '2rem', textAlign: 'center' }}>
					<h2>Something went wrong</h2>
					<p style={{ color: '#888', marginTop: '0.5rem' }}>
						An unexpected error occurred. Our team has been notified.
					</p>
					<button
						type="button"
						onClick={reset}
						style={{
							marginTop: '1rem',
							padding: '0.5rem 1rem',
							cursor: 'pointer',
						}}
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	)
}
