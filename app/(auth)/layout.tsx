import type { Metadata } from 'next'
import { Navbar } from './components'
import { copy } from './copy'

export const metadata: Metadata = {
	title: copy.welcome,
	description: copy.description,
}

export default function LoginLayout({
	children,
	modal,
}: {
	children: React.ReactNode
	modal: React.ReactNode
}) {
	return (
		<>
			<Navbar />
			<div className="relative z-10 flex min-h-screen w-full flex-col overflow-hidden bg-gradient-to-b from-black/0 to-black">
				{children}
				{modal}
			</div>
		</>
	)
}
