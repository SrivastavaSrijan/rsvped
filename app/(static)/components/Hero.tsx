import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config/routes'
import { copy } from '../copy'

export default function Hero() {
  return (
    <section className="container mx-auto w-full max-w-extra-wide-page">
      <div className="grid grid-cols-1 items-center gap-8 py-4 lg:grid-cols-3 lg:gap-16 lg:py-12">
        {/* Text Column */}
        <div className="flex flex-col items-center gap-3 text-center lg:col-span-1 lg:items-start lg:gap-4 lg:text-left">
          <div className="flex flex-col items-center gap-3 lg:items-start lg:gap-2">
            <div className="relative h-[50px] w-[100px] lg:h-[75px] lg:w-[150px]">
              <Image src="/logo-full.png" alt="Logo" fill className="object-cover opacity-50" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="font-bold text-4xl lg:text-6xl">{copy.hero.headline1}</h1>
              <h1 className="bg-clip-text font-bold text-4xl text-gradient-radial text-transparent lg:text-6xl">
                {copy.hero.headline2}
              </h1>
            </div>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed lg:text-xl">
            {copy.hero.description}
          </p>
          <Link href={Routes.CreateEvent}>
            <Button size="lg" className="lg:text-lg">
              {copy.hero.cta}
            </Button>
          </Link>
        </div>

        {/* Image Column */}
        <div className="flex justify-center lg:col-span-2 lg:justify-end">
          <video autoPlay loop muted playsInline className="w-full max-w-lg rounded-lg shadow-lg">
            <source src="/phone-dark.webm" type="video/webm" />
          </video>
        </div>
      </div>
    </section>
  )
}
