import { headers } from 'next/headers'
import { Routes } from '@/lib/config'
import { getRandomColor } from '@/lib/utils'
import { Navbar } from './components'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get('x-pathname')
  const isCreateEventPage = pathname === Routes.Main.Events.Create
  const style = isCreateEventPage ? { backgroundColor: getRandomColor({ intensity: 90 }) } : {}

  return (
    <div className="min-h-screen w-full" style={style}>
      <Navbar />
      <main className="flex flex-1 items-center justify-center">{children}</main>
    </div>
  )
}
