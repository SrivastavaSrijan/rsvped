'use client'
import Image from 'next/image'
import Link from 'next/link'
import {
	Badge,
	Button,
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
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
		<Card className="lg:bg-card bg-transparent items-center w-full lg:flex-col flex-row lg:gap-6 gap-2 lg:py-6 py-2">
			<CardHeader className="w-full lg:px-6 px-0">
				<CardAction className="w-full justify-between lg:flex flex-row hidden">
					<Link href={Routes.Main.Communities.SubscribeTo(slug)} passHref>
						<Button size="sm" variant="secondary">
							Subscribe
						</Button>
					</Link>
				</CardAction>
				<Link href={Routes.Main.Communities.ViewBySlug(slug)} passHref>
					<CardTitle className="relative lg:w-[50px] lg:h-[50px]  h-full w-full aspect-square">
						{coverImage && (
							<Image
								src={coverImage}
								alt={`Cover image for ${name}`}
								fill
								sizes="100px"
								className="rounded-lg aspect-square"
							/>
						)}
					</CardTitle>
				</Link>
			</CardHeader>
			<Link href={Routes.Main.Communities.ViewBySlug(slug)} passHref>
				<CardContent className="lg:px-6 px-0 lg:gap-1 gap-2 items-start">
					{role && <Badge variant={membershipBadgeVariant}>{role}</Badge>}
					<p className="text-sm lg:text-base line-clamp-1">{name}</p>
					<p className="line-clamp-2 lg:text-sm text-xs">{description}</p>
				</CardContent>
			</Link>
		</Card>
	)
}
