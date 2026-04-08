'use client'

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	return (
		<html lang="en">
			<body>
				{/* Inline styles are intentional — Tailwind may not be loaded in this error boundary */}
				<div
					style={{
						padding: '2rem',
						textAlign: 'center',
						minHeight: '100vh',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<h2 style={{ color: '#131517', fontSize: '1.5rem', fontWeight: 600 }}>
						Something went wrong
					</h2>
					<p style={{ color: '#737577', marginTop: '0.5rem' }}>
						An unexpected error occurred.
					</p>
					<button
						type="button"
						onClick={reset}
						style={{
							marginTop: '1.5rem',
							padding: '0.5rem 1.5rem',
							cursor: 'pointer',
							backgroundColor: '#f31a7c',
							color: '#ffffff',
							border: 'none',
							borderRadius: '0.5rem',
							fontSize: '0.875rem',
							fontWeight: 500,
						}}
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	)
}
