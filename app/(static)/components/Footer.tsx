import Link from 'next/link'
import { Routes } from '@/lib/config/routes'
import { copy } from '../copy'

export default function Footer() {
  return (
    <footer className="mt-auto border-border border-t">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-sm bg-primary" />
            <span className="font-medium">{copy.footer.logo}</span>
          </div>

          <div className="flex items-center space-x-4 lg:space-x-6">
            <Link
              href={Routes.WhatsNew}
              className="text-muted-foreground text-sm transition-colors hover:text-foreground lg:text-base"
            >
              {copy.footer.whatsNew}
            </Link>
            <Link
              href={Routes.Discover}
              className="text-muted-foreground text-sm transition-colors hover:text-foreground lg:text-base"
            >
              {copy.footer.discover}
            </Link>
            <Link
              href={Routes.Pricing}
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
