import Image from 'next/image'
import Link from 'next/link'
import { Routes } from '@/lib/config'
import { copy } from '../copy'

export default function Footer() {
  return (
    <footer className="mx-auto mt-auto w-full max-w-extra-wide-page border-border border-t">
      <div className="container mx-auto px-4 py-2 lg:px-4 lg:py-4">
        <div className="flex flex-row items-center justify-between gap-4 ">
          <div className="flex items-center space-x-2">
            <Image src="/logo-full.png" alt="Logo" width={64} height={32} className="opacity-75" />
          </div>

          <div className="flex items-center space-x-4 lg:space-x-6">
            <Link
              href={Routes.Static.WhatsNew}
              className="text-muted-foreground text-sm transition-colors hover:text-foreground lg:text-base"
            >
              {copy.footer.whatsNew}
            </Link>
            <Link
              href={Routes.Main.Events.Discover}
              className="text-muted-foreground text-sm transition-colors hover:text-foreground lg:text-base"
            >
              {copy.footer.discover}
            </Link>
            <Link
              href={Routes.Static.Pricing}
              className="text-muted-foreground text-sm transition-colors hover:text-foreground lg:text-base"
            >
              {copy.footer.pricing}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
