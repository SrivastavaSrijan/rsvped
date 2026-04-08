'use client'

export default function GlobalError({
	_error,
	reset,
}: {
	_error: Error & { digest?: string }
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
						justifyContent: 'center',
						alignItems: 'center',
						fontFamily: 'system-ui, -apple-system, sans-serif',
					}}
				>
					<h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
						An unexpected error occurred.
					</h1>
					<button
						type="button"
						onClick={() => reset()}
						style={{
							padding: '0.5rem 1rem',
							marginTop: '1rem',
							backgroundColor: '#000',
							color: '#fff',
							border: 'none',
							borderRadius: '0.375rem',
							cursor: 'pointer',
							fontSize: '1rem',
						}}
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	)
}
