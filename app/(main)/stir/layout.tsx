interface StirLayoutProps {
	children: React.ReactNode
}

export default function StirLayout({ children }: StirLayoutProps) {
	return (
		<div className="relative mx-auto flex h-[80dvh] w-full max-w-wide-page flex-col px-3 py-4 lg:px-8">
			<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/40 bg-background/60 shadow-lg backdrop-blur-sm">
				<div className="pointer-events-none absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-brand/6 to-transparent" />
				{children}
			</div>
		</div>
	)
}
