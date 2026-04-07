import { MapPin } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
	AvatarWithFallback,
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui'
import { Routes } from '@/lib/config'

interface UserHoverCardData {
	name: string | null
	image: string | null
	username?: string | null
	bio?: string | null
	profession?: string | null
	location?: { name: string } | null
}

interface UserHoverCardProps {
	user: UserHoverCardData
	children: ReactNode
}

export const UserHoverCard = ({ user, children }: UserHoverCardProps) => {
	return (
		<HoverCard openDelay={300} closeDelay={100}>
			<HoverCardTrigger asChild>
				<span className="inline-flex cursor-pointer">{children}</span>
			</HoverCardTrigger>
			<HoverCardContent className="w-72" side="top" align="start">
				<div className="flex flex-col gap-3">
					<div className="flex items-start gap-3">
						<AvatarWithFallback
							src={user.image}
							name={user.name ?? undefined}
							className="size-12 text-lg"
						/>
						<div className="flex flex-col gap-0.5">
							<p className="text-sm font-semibold text-foreground">
								{user.name}
							</p>
							{user.username ? (
								<p className="text-xs text-muted-foreground">
									@{user.username}
								</p>
							) : null}
							{user.profession ? (
								<p className="text-xs text-muted-foreground">
									{user.profession}
								</p>
							) : null}
						</div>
					</div>

					{user.bio ? (
						<p className="text-xs text-muted-foreground line-clamp-2">
							{user.bio}
						</p>
					) : null}

					{user.location ? (
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<MapPin className="size-3" />
							{user.location.name}
						</div>
					) : null}

					{user.username ? (
						<Link
							href={Routes.Main.Users.ViewByUsername(user.username)}
							className="text-xs font-medium text-brand hover:underline"
						>
							View Profile
						</Link>
					) : null}
				</div>
			</HoverCardContent>
		</HoverCard>
	)
}
