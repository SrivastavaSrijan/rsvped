import { Button } from '@/components/ui'
import { Routes } from '@/lib/config/routes'
import { copy } from '../copy'
import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {



      let x;
      x=22;
      var xx=22;
  return (
    <section className="relative min-h-screen py-8 lg:py-20 px-4 lg:px-8 overflow-hidden">
      {/* SVG Background */}
      <div className="absolute inset-0">
        <Image
          src="/background.svg"
          alt="Background pattern"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      <div className="container mx-auto relative h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full py-8 lg:py-12">
          {/* Text Column */}
          <div className="space-y-6 lg:space-y-8 lg:pr-8">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              {copy.hero.headline}
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              {copy.hero.description}
            </p>
            
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href={Routes.CreateEvent}>
                {copy.hero.cta}
              </Link>
            </Button>
          </div>
          
          {/* Image Column */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm lg:max-w-lg aspect-square bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 rounded-3xl flex items-center justify-center border border-border/50">
              <div className="text-center space-y-4 p-6 lg:p-8">
                <div className="w-16 h-16 lg:w-24 lg:h-24 bg-primary/30 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 lg:w-12 lg:h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <p className="text-muted-foreground text-sm">{copy.hero.imagePlaceholder}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
