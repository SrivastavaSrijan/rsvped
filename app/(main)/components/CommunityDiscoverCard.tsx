'use client'
import Link from 'next/link'
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	Image,
} from '@/components/ui'
import { Routes } from '@/lib/config'
import { MembershipBadgeVariants, MembershipLabels } from '@/lib/constants'
import type { RouterOutput } from '@/server/api'

type CommunityData = RouterOutput['community']['listNearby'][number]
interface CommunityDiscoverCardProps extends CommunityData {}

export const CommunityDiscoverCard = ({
	name,
	coverImage,
	description,
	metadata,
	slug,
}: CommunityDiscoverCardProps) => {
	const role = metadata?.role ? MembershipLabels[metadata.role] : null
	const membershipBadgeVariant = metadata?.role
		? MembershipBadgeVariants[metadata.role]
		: 'default'

	return (
		<Card className="w-full lg:gap-6 gap-3">
			<CardHeader>
				<div className="flex items-start gap-4">
					{/* Image */}
					<div className="relative lg:size-20 size-15 shrink-0">
						<Link href={Routes.Main.Communities.ViewBySlug(slug)}>
							{coverImage && (
								<Image
									fill
									src={coverImage}
									alt={`Cover image for ${name}`}
									className="rounded-lg object-cover"
								/>
							)}
						</Link>
					</div>

					{/* Action */}
					<div className="ml-auto">
						{role ? (
							<Badge variant={membershipBadgeVariant}>{role}</Badge>
						) : (
							<Link href={Routes.Main.Communities.SubscribeTo(slug)}>
								<Button size="sm" variant="secondary">
									Subscribe
								</Button>
							</Link>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<Link href={Routes.Main.Communities.ViewBySlug(slug)} className="group">
					<div className="flex flex-col lg:gap-2 gap-1">
						<h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
							{name}
						</h3>
						<p className="text-muted-foreground text-sm line-clamp-2">
							{description}
						</p>
					</div>
				</Link>
			</CardContent>
		</Card>
	)
}
