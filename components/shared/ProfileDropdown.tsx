'use client'
import Image from 'next/image'
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
import { getRandomColor } from '@/lib/utils'
import { signOutAction } from '@/server/actions'

const copy = {
  dashboard: 'Hey there',
  profile: 'Profile',
  signOut: 'Sign Out',
}
interface ProfileDropdownProps {
  session: Session
}
export const ProfileDropdown = ({ session }: ProfileDropdownProps) => {
  const { image, name } = session.user
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {image && name ? (
          <Image
            style={{ backgroundColor: getRandomColor({ seed: name }) }}
            unoptimized
            width={32}
            height={32}
            alt={name || 'User'}
            src={image ? image : getAvatarURL(name || 'User')}
            className="flex items-center rounded-full object-contain"
          />
        ) : (
          <Button size="sm" variant="outline">
            {`${copy.dashboard}, ${name || '!'}`}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Link href={Routes.Auth.Profile} passHref>
          <DropdownMenuItem>{copy.profile}</DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={() => signOutAction()}>{copy.signOut}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
