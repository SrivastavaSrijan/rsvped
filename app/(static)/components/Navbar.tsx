import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config/routes'
import { copy } from '../copy'

export default async function Navbar() {
  const session = await auth()
  return (
    <nav>
      <div className="px-4 py-3 lg:px-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            passHref
            className="flex cursor-pointer items-center space-x-2 object-cover opacity-50 transition-opacity hover:opacity-100"
          >
            {/* Logo placeholder */}
            <Image src="/logo.svg" alt="Background pattern" width={32} height={32} priority />
          </Link>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <Link href={Routes.Explore} passHref>
              <Button variant="link" size="sm">
                {copy.nav.exploreEvents}
                <ArrowUpRight className="size-3" />
              </Button>
            </Link>
            {session ? (
              <Link href={Routes.Dashboard} passHref>
                <Button size="sm" variant="outline">
                  {`${copy.nav.dashboard}, ${session.user.name || '!'}`}
                </Button>
              </Link>
            ) : (
              <Link href={Routes.SignIn} passHref>
                <Button size="sm" variant="outline">
                  {copy.nav.signIn}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
