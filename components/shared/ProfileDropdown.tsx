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
	publicProfile: 'View Public Profile',
	events: 'My Events',
	feed: 'Activity Feed',
	signOut: 'Sign Out',
}
interface ProfileDropdownProps {
	session: Session
}
export const ProfileDropdown = ({ session }: ProfileDropdownProps) => {
	const { image, email, name, username } = session?.user ?? {}
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
				<div className="flex flex-col items-start gap-2 lg:p-2 p-2">
					Hi, {name || 'there'}!
					<p className="text-xs text-muted-foreground">
						{username ? `@${username}` : email}
					</p>
				</div>
				<Link href={Routes.Main.Events.Home} passHref>
					<DropdownMenuItem>{copy.events}</DropdownMenuItem>
				</Link>
				<Link href={Routes.Main.Feed as string} passHref>
					<DropdownMenuItem>{copy.feed}</DropdownMenuItem>
				</Link>
				<Link href={Routes.Auth.Profile} passHref>
					<DropdownMenuItem>{copy.profile}</DropdownMenuItem>
				</Link>
				{username ? (
					<Link href={Routes.Main.Users.ViewByUsername(username)} passHref>
						<DropdownMenuItem>{copy.publicProfile}</DropdownMenuItem>
					</Link>
				) : null}
				<DropdownMenuItem onClick={() => signOutAction()}>
					{copy.signOut}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
