import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config/routes'
import { copy } from '../copy'

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-8 lg:px-8 lg:py-20">
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

      <div className="container relative mx-auto flex h-full items-center">
        <div className="grid w-full grid-cols-1 items-center gap-8 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
          {/* Text Column */}
          <div className="space-y-6 lg:space-y-8 lg:pr-8">
            <h1 className="font-bold text-4xl leading-tight lg:text-6xl">{copy.hero.headline}</h1>

            <p className="text-lg text-muted-foreground leading-relaxed lg:text-xl">
              {copy.hero.description}
            </p>

            <Button size="lg" className="w-full sm:w-auto lg:py-4 lg:text-xl" asChild>
              <Link href={Routes.CreateEvent}>{copy.hero.cta}</Link>
            </Button>
          </div>

          {/* Image Column */}
          <div className="flex justify-center lg:justify-end">
            <div className="flex aspect-square w-full max-w-sm items-center justify-center rounded-3xl border border-border/50 bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 lg:max-w-lg">
              <div className="space-y-4 p-6 text-center lg:p-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/30 lg:h-24 lg:w-24">
                  <svg
                    className="h-8 w-8 text-primary lg:h-12 lg:w-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Check mark icon"
                  >
                    <title>{copy.hero.imagePlaceholder}</title>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
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
