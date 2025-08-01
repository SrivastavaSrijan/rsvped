'use client'
import Link from 'next/link'
import type { Session } from 'next-auth'
import { useState } from 'react'
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui'
import { Routes } from '@/lib/config'
import { signOutAction } from '@/server/actions'
import { AvatarWithFallback } from '../ui'

const copy = {
	dashboard: 'Hey there',
	profile: 'Profile',
	events: 'My Events',
	signOut: 'Sign Out',
}
interface ProfileDropdownProps {
	session: Session
}
export const ProfileDropdown = ({ session }: ProfileDropdownProps) => {
	const { image, name } = session.user
	const [src, _setSrc] = useState<string | null>(image ?? null)
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{image && name ? (
					<AvatarWithFallback name={name} src={src ?? ''} />
				) : (
					<Button size="sm" variant="outline">
						{`${copy.dashboard}, ${name || '!'}`}
					</Button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<Link href={Routes.Main.Events.Home} passHref>
					<DropdownMenuItem>{copy.events}</DropdownMenuItem>
				</Link>
				<Link href={Routes.Auth.Profile} passHref>
					<DropdownMenuItem>{copy.profile}</DropdownMenuItem>
				</Link>
				<DropdownMenuItem onClick={() => signOutAction()}>
					{copy.signOut}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
