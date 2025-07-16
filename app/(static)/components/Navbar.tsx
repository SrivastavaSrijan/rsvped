import Link from 'next/link'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config/routes'
import { copy } from '../copy'

export default function Navbar() {
  return (
    <nav className="border-b border-border">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Logo placeholder */}
            <div className="w-8 h-8 bg-primary rounded-md" />
            <span className="font-semibold text-lg">{copy.nav.logo}</span>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href={Routes.Explore}>{copy.nav.exploreEvents}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={Routes.SignIn}>{copy.nav.signIn}</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
