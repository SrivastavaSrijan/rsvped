import Link from 'next/link'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config/routes'
import { copy } from '../copy'

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-136px)] w-full overflow-hidden px-4 py-8 lg:px-4 lg:py-20">
      {/* SVG Background */}

      <div className="container relative mx-auto flex h-full max-w-extra-wide-page items-center">
        <div className="grid w-full grid-cols-1 items-center gap-8 py-8 lg:grid-cols-3 lg:gap-16 lg:py-12">
          {/* Text Column */}
          <div className="space-y-6 lg:col-span-1 lg:space-y-8 lg:pr-8">
            <h1 className="font-bold text-4xl leading-tight lg:text-6xl">{copy.hero.headline}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed lg:text-xl">
              {copy.hero.description}
            </p>
            <Button size="lg" className="w-full sm:w-auto lg:py-4 lg:text-xl" asChild>
              <Link href={Routes.CreateEvent}>{copy.hero.cta}</Link>
            </Button>
          </div>

          {/* Image Column */}
          <div className="flex justify-center lg:col-span-2 lg:justify-end">
            <div className="flex aspect-square w-full max-w-sm items-center justify-center rounded-3xl border border-border/50 bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 lg:max-w-lg">
              <div className="space-y-4 p-6 text-center lg:p-8">
                <span className="text-6xl lg:text-9xl">🎟</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
