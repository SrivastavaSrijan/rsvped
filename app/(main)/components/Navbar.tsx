import { ArrowUpRight, Calendar, Compass, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ProfileDropdown } from '@/components/shared'
import { Button } from '@/components/ui'
import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config'
import { copy } from '../copy'
import { ActiveLink } from './ActiveLink'

export const Navbar = async () => {
	const session = await auth()
	return (
		<nav className="sticky top-0 z-10 bg-black/10 px-3 py-2 backdrop-blur-sm lg:px-4 lg:py-3">
			<div className="flex items-center gap-2">
				<Link
					href="/"
					passHref
					className="object-cover opacity-50 transition-opacity hover:opacity-100"
				>
					{/* Logo placeholder */}
					<Image
						src="/logo.svg"
						alt="Background pattern"
						width={24}
						height={24}
						priority
					/>
				</Link>
				<div className="flex-1" />
				<div className="flex w-full max-w-extra-wide-page items-center justify-between">
					<div className="flex items-center space-x-1 lg:space-x-2">
						<ActiveLink
							href={Routes.Main.Events.Home}
							icon={<Calendar className="size-3" />}
						>
							{copy.nav.events}
						</ActiveLink>
						<ActiveLink
							href={Routes.Main.Communities.Root}
							icon={<Users className="size-3" />}
						>
							{copy.nav.communities}
						</ActiveLink>
						<ActiveLink
							href={Routes.Main.Events.Discover}
							icon={<Compass className="size-3" />}
						>
							{copy.nav.discover}
						</ActiveLink>
					</div>
					<div className="flex-1" />
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
								<Button variant="link" size="sm">
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
