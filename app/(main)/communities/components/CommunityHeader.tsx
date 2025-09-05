import { Mailbox } from 'lucide-react'
import Link from 'next/link'
import {
	AvatarWithFallback,
	Badge,
	Button,
	Image,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui'
import { Routes } from '@/lib/config'
import { MembershipBadgeVariants, MembershipLabels } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { RouterOutput } from '@/server/api'

const AVATAR_CLASSES = {
	lg: 'lg:size-24 -bottom-12',
	sm: 'size-18 -bottom-9',
}
type CommunityData = RouterOutput['community']['get']['core']
type CommunityHeaderProps = CommunityData

export const CommunityHeader = ({
	coverImage,
	name,
	description,
	metadata,
	owner,
	slug,
}: CommunityHeaderProps) => {
	const role = metadata?.role ? MembershipLabels[metadata.role] : null
	const membershipBadgeVariant = metadata?.role
		? MembershipBadgeVariants[metadata.role]
		: 'default'

	return (
		<>
			{coverImage && owner && (
				<div className="lg:h-[240px] lg:w-full w-full h-[120px] relative">
					<Image
						src={coverImage}
						alt={name}
						className="aspect-video lg:rounded-xl object-cover"
						fill
						priority
						wrapperClassName="h-full w-full"
						sizes={{ lg: '60vw', sm: '50vw' }}
					/>
					{owner?.name && owner?.image && (
						<AvatarWithFallback
							src={owner.image}
							alt={owner.name}
							name={owner.name}
							className={cn(
								'absolute left-4',
								AVATAR_CLASSES.lg,
								AVATAR_CLASSES.sm
							)}
						/>
					)}
				</div>
			)}
			<div className="flex flex-col px-3 pt-6 lg:gap-8 lg:px-8 gap-4 lg:pt-8">
				<div className="flex flex-col gap-2 lg:gap-2">
					<div className="flex lg:flex-row flex-col items-start justify-between lg:gap-2 gap-2">
						<div className="flex flex-col gap-1">
							<div className="flex flex-row items-center gap-2">
								<h2 className="text-sm text-muted-foreground">
									Curated by {owner?.name}
								</h2>
								<Tooltip>
									<TooltipTrigger asChild>
										<a href={`mailto:${owner?.email}`} className="contents">
											<Button
												variant="link"
												size="icon"
												className="text-muted-foreground size-3"
											>
												<Mailbox className="size-3" />
											</Button>
										</a>
									</TooltipTrigger>
									<TooltipContent>Email {owner?.email}</TooltipContent>
								</Tooltip>
							</div>
							<div className="flex flex-row items-center gap-2">
								<h1 className="text-2xl font-semibold">{name}</h1>
								{role && <Badge variant={membershipBadgeVariant}>{role}</Badge>}
							</div>
						</div>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link
									href={role ? '' : Routes.Main.Communities.SubscribeTo(slug)}
									passHref
								>
									<Button variant="secondary" disabled={!!role}>
										Subscribe
									</Button>
								</Link>
							</TooltipTrigger>
							<TooltipContent>
								{role
									? `You are already subscribed as ${role}`
									: 'Subscribe to this community'}
							</TooltipContent>
						</Tooltip>
					</div>
					<p className="text-muted-foreground text-sm">{description}</p>
				</div>
			</div>
		</>
	)
}
