import { ArrowUpRight, Calendar, Compass, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ProfileDropdown } from '@/components/shared'
import { Button } from '@/components/ui'
import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config'
import { copy } from '../copy'

const MainLink = ({
  href,
  icon,
  children,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) => {
  return (
    <Link href={href} passHref>
      <Button variant="link" size="sm">
        {icon}
        <span className="hidden lg:block">{children}</span>
      </Button>
    </Link>
  )
}
export async function Navbar() {
  const session = await auth()
  return (
    <nav>
      <div className="px-4 py-3 lg:px-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            passHref
            className="object-cover opacity-50 transition-opacity hover:opacity-100"
          >
            {/* Logo placeholder */}
            <Image src="/logo.svg" alt="Background pattern" width={24} height={24} priority />
          </Link>
          <div className="flex-1" />
          <div className="flex w-fullmax-w-extra-wide-page items-center justify-between">
            <div className="flex items-center space-x-1 lg:space-x-2">
              <MainLink href={Routes.Main.Events.Root} icon={<Calendar className="size-3" />}>
                {copy.nav.events}
              </MainLink>
              <MainLink href={Routes.Main.Events.Communities} icon={<Users className="size-3" />}>
                {copy.nav.communities}
              </MainLink>
              <MainLink href={Routes.Main.Events.Discover} icon={<Compass className="size-3" />}>
                {copy.nav.discover}
              </MainLink>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Link href={Routes.Main.Events.Create} passHref>
                <Button variant="link" size="sm">
                  {copy.nav.createEvent}
                  <ArrowUpRight className="size-3" />
                </Button>
              </Link>
              {session ? (
                <ProfileDropdown session={session} />
              ) : (
                <Link href={Routes.Auth.SignIn} passHref>
                  <Button size="sm" variant="outline">
                    {copy.nav.signIn}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
