import { Background, Footer } from '@/components/shared'
import { Navbar } from './components'

export default function StaticLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col">
			<div className="relative">
				<Background />
				<div className="relative z-10 flex min-h-screen w-full flex-col overflow-hidden bg-gradient-to-b from-black/0 to-black">
					<Navbar />
					<main className="flex flex-1 items-center justify-center">{children}</main>
					<Footer />
				</div>
			</div>
		</div>
	)
}
