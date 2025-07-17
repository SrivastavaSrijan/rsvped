import Image from 'next/image'
import { Footer, Hero, Navbar } from './components'

export default function Home() {
  return (
    <div className="relative">
      <div className="absolute inset-0">
        <Image
          src="/background.svg"
          alt="Background pattern"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="relative z-10 flex min-h-screen w-full flex-col overflow-hidden bg-gradient-to-b from-black/0 to-black">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <Hero />
        </main>
        <Footer />
      </div>
    </div>
  )
}
