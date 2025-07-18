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
import { Routes } from '@/lib/config'
import { signOutAction } from '@/server/actions'
import { copy } from '../copy'

interface ProfileDropdownProps {
  session: Session
}
export const ProfileDropdown = ({ session }: ProfileDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          {`${copy.nav.dashboard}, ${session.user.name || '!'}`}
        </Button>
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
