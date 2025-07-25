import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ProfileDropdown } from '@/components/shared'
import { Button } from '@/components/ui'
import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config'
import { copy } from '../copy'

export default async function Navbar() {
	const session = await auth()
	return (
		<nav className="sticky top-0 z-10 bg-black/10 px-3 py-2 backdrop-blur-sm lg:px-4 lg:py-3">
			<div className="flex items-center justify-between">
				<Link
					href="/"
					passHref
					className="object-cover opacity-50 transition-opacity hover:opacity-100"
				>
					{/* Logo placeholder */}
					<Image src="/logo.svg" alt="Background pattern" width={24} height={24} priority />
				</Link>

				<div className="flex items-center space-x-2 lg:space-x-4">
					<Link href={Routes.Main.Events.Discover} passHref>
						<Button variant="link" size="sm">
							{copy.nav.exploreEvents}
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
		</nav>
	)
}
