import { Footer } from '@/components/shared'
import { Navbar, PageWrapper } from './components'

export const experimental_ppr = true
export default async function MainLayout({
	children,
	form,
}: {
	children: React.ReactNode
	form: React.ReactNode
}) {
	return (
		<PageWrapper>
			<Navbar />
			{form}
			<main className="flex flex-1 items-center justify-center">
				{children}
			</main>
			<Footer />
		</PageWrapper>
	)
}
