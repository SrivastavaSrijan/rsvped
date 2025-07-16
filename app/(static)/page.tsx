import Image from 'next/image'
import { Hero } from './components'

export default function Home() {
  return (
    <div className="flex flex-1">
      <div className="absolute inset-0">
        <Image
          src="/background.svg"
          alt="Background pattern"
          fill
          className="object-cover"
          priority
        />
      </div>
      <Hero />
    </div>
  )
}
