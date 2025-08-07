import Link from 'next/link'
import { Badge, Card, CardHeader, CardTitle, Image } from '@/components/ui'
import { AssetMap, Routes } from '@/lib/config'
import { MembershipBadgeVariants, MembershipLabels } from '@/lib/constants'
import type { RouterOutput } from '@/server/api'

type CommunityData =
	| RouterOutput['community']['list']['core'][number]
	| RouterOutput['community']['list']['enhanced'][number]
type ManagedCommunityCardProps = CommunityData

export const ManagedCommunityCard = ({
	id,
	slug,
	name,
	coverImage,
	metadata,
	_count,
}: ManagedCommunityCardProps) => {
	const { role } = metadata
	const membershipBadgeVariant = role
		? MembershipBadgeVariants[role]
		: undefined
	const label = role ? MembershipLabels[role] : undefined

	return (
		<Card key={id}>
			<CardHeader>
				<Link href={Routes.Main.Communities.ViewBySlug(slug)} passHref>
					<CardTitle className="flex lg:items-start items-center lg:flex-col flex-row lg:gap-2 gap-3">
						<div className="lg:w-full w-fit flex lg:flex-row flex-col-reverse gap-3 lg:gap-0 items-start justify-between">
							<Image
								src={coverImage || AssetMap.NoEvents}
								alt={name}
								className="aspect-video rounded-lg object-cover"
								fill
								wrapperClassName="relative aspect-square h-[75px] w-[75px] rounded-lg"
								sizes={{ lg: '30vw', sm: '50vw' }}
							/>
							{role && membershipBadgeVariant && (
								<Badge
									variant={membershipBadgeVariant}
									className="hidden lg:block"
								>
									{label}
								</Badge>
							)}
						</div>
						<div className="flex flex-col justify-center">
							<h3 className="lg:text-lg text-base font-semibold mt-2">
								{name}
							</h3>
							<p className="text-sm text-muted-foreground">
								{_count.members} members
							</p>
							{role && membershipBadgeVariant && (
								<Badge
									variant={membershipBadgeVariant}
									className="lg:hidden mt-2 flex"
								>
									{label}
								</Badge>
							)}
						</div>
					</CardTitle>
				</Link>
			</CardHeader>
		</Card>
	)
}
