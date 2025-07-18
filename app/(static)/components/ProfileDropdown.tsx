'use client'
import Link from 'next/link'
import { Session } from 'next-auth'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import { getAvatarURL, Routes } from '@/lib/config'
import { signOutAction } from '@/server/actions'
import { copy } from '../copy'

interface ProfileDropdownProps {
  session: Session
}
export const ProfileDropdown = ({ session }: ProfileDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {session.user.image ? (
          // biome-ignore lint/performance/noImgElement: SVG
          <img
            alt={session.user.name || 'User'}
            src={
              session.user.image ? session.user.image : getAvatarURL(session.user.name || 'User')
            }
            className="size-8 rounded-full object-cover"
          />
        ) : (
          <Button size="sm" variant="outline">
            {`${copy.nav.dashboard}, ${session.user.name || '!'}`}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Link href={Routes.Profile} passHref>
          <DropdownMenuItem>{copy.nav.profile}</DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={() => signOutAction()}>{copy.nav.signOut}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
