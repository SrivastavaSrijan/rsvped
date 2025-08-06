import { Suspense } from 'react'
import { Footer, ModalLoading } from '@/components/shared'
import { Navbar, PageWrapper } from './components'

export default async function MainLayout({
	children,
	form,
}: {
	children: React.ReactNode
	form: React.ReactNode
}) {
	return (
		<>
			<Suspense fallback={<ModalLoading />}>{form}</Suspense>
			<Navbar />
			<PageWrapper>
				<main className="flex flex-1 items-center justify-center">
					{children}
				</main>
				<Footer />
			</PageWrapper>
		</>
	)
}
