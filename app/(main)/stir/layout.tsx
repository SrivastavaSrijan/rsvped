interface StirLayoutProps {
	children: React.ReactNode
}

export default function StirLayout({ children }: StirLayoutProps) {
	return (
		<div className="mx-auto flex min-h-[80dvh] w-full max-w-wide-page flex-1 self-stretch flex-col px-3 pb-4 lg:px-8">
			{children}
		</div>
	)
}
