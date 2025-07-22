import { Navbar, PageWrapper } from './components'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageWrapper>
      <Navbar />
      <main className="flex flex-1 items-center justify-center">{children}</main>
    </PageWrapper>
  )
}
