import { Briefcase, Calendar, MapPin, Sparkles, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import { AvatarWithFallback, Badge, buttonVariants } from '@/components/ui'
import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config'
import { cn } from '@/lib/utils'
import { FriendButton } from './FriendButton'
import type { PublicProfileUser } from './types'

interface ProfileHeaderProps {
	user: PublicProfileUser
}

export async function ProfileHeader({ user }: ProfileHeaderProps) {
	const session = await auth()
	const isOwnProfile = session?.user?.id === user.id
	const friendCount =
		user._count.sentFriendRequests + user._count.receivedFriendRequests

	return (
		<div className="flex flex-col gap-6">
			{/* Top section: Avatar + info */}
			<div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-6">
				<AvatarWithFallback
					src={user.image}
					name={user.name ?? undefined}
					className="size-24 text-3xl"
				/>
				<div className="flex flex-1 flex-col items-center gap-2 lg:items-start">
					<div className="flex items-center gap-3">
						<h1 className="font-bold text-2xl text-text-primary">
							{user.name ?? 'Anonymous'}
						</h1>
						{isOwnProfile ? (
							<Link
								href={Routes.Auth.EditProfile}
								className={cn(
									buttonVariants({ variant: 'outline', size: 'sm' }),
									'cursor-pointer'
								)}
							>
								Edit Profile
							</Link>
						) : (
							<FriendButton targetUserId={user.id} />
						)}
					</div>

					{user.username ? (
						<p className="text-sm text-text-secondary">@{user.username}</p>
					) : null}

					{user.bio ? (
						<p className="max-w-lg text-sm text-text-secondary">{user.bio}</p>
					) : null}

					<div className="flex flex-wrap items-center gap-2">
						{user.profession ? (
							<Badge variant="secondary" className="gap-1">
								<Briefcase className="size-3" />
								{user.profession}
							</Badge>
						) : null}
						{user.industry ? (
							<Badge variant="outline">{user.industry}</Badge>
						) : null}
						{user.experienceLevel ? (
							<Badge variant="outline" className="gap-1">
								<Zap className="size-3" />
								{user.experienceLevel}
							</Badge>
						) : null}
						{user.networkingStyle ? (
							<Badge variant="outline" className="gap-1">
								<Sparkles className="size-3" />
								{user.networkingStyle}
							</Badge>
						) : null}
						{user.location ? (
							<Badge variant="outline" className="gap-1">
								<MapPin className="size-3" />
								{user.location.name}
							</Badge>
						) : null}
					</div>
				</div>
			</div>

			{/* Stats row */}
			<div className="flex justify-center gap-8 border-y border-border-secondary py-4 lg:justify-start">
				<StatItem
					icon={<Calendar className="size-4" />}
					value={user._count.hostedEvents}
					label="Events"
				/>
				<StatItem
					icon={<Users className="size-4" />}
					value={user.communityMemberships.length}
					label="Communities"
				/>
				<StatItem
					icon={<Users className="size-4" />}
					value={friendCount}
					label="Friends"
				/>
				<StatItem
					icon={<Zap className="size-4" />}
					value={user._count.rsvps}
					label="RSVPs"
				/>
			</div>

			{/* Interests */}
			{user.categoryInterests.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					{user.categoryInterests.map((ci) => (
						<Badge key={ci.category.id} variant="secondary">
							{ci.category.name}
						</Badge>
					))}
				</div>
			) : null}
		</div>
	)
}

function StatItem({
	icon,
	value,
	label,
}: {
	icon: React.ReactNode
	value: number
	label: string
}) {
	return (
		<div className="flex flex-col items-center gap-1">
			<div className="flex items-center gap-1 text-text-primary">
				{icon}
				<span className="font-semibold text-lg">{value}</span>
			</div>
			<span className="text-xs text-text-tertiary">{label}</span>
		</div>
	)
}
