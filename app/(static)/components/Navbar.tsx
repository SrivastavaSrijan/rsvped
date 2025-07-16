import Link from 'next/link'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config/routes'
import { copy } from '../copy'

export default function Navbar() {
  return (
    <nav>
      <div className="container mx-auto px-4 py-3 lg:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Logo placeholder */}
            <span className="font-semibold text-base">{copy.nav.logo}</span>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href={Routes.Explore}>{copy.nav.exploreEvents}</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={Routes.SignIn}>{copy.nav.signIn}</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
