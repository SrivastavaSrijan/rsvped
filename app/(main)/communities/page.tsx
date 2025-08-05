import { MembershipRole } from '@prisma/client'
import Link from 'next/link'
import {
	Badge,
	Button,
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
	Image,
} from '@/components/ui'
import { AssetMap, Routes } from '@/lib/config'
import { MembershipBadgeVariants, MembershipLabels } from '@/lib/constants'
import { getAPI } from '@/server/api'
import { copy } from '../copy'

const getCommunities = async (role: MembershipRole[], page?: string) => {
	const api = await getAPI()
	return api.community.list({
		roles: role,
		page: parseInt(page ?? '1', 10) || 1,
	})
}
export default async function ViewCommunities({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>
}) {
	const { page = '1' } = await searchParams
	const [managedCommunities, userCommunities] = await Promise.all([
		getCommunities([MembershipRole.ADMIN, MembershipRole.MODERATOR], page),
		getCommunities([MembershipRole.MEMBER], page),
	])

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="flex w-full flex-row justify-between gap-4">
				<h1 className="font-bold text-2xl lg:px-0 lg:text-4xl">
					{copy.community.home.title}
				</h1>
			</div>

			<div className="flex h-full w-full flex-col items-center justify-center">
				{managedCommunities.length === 0 && (
					<div className="flex h-[90vw] w-full flex-col items-center justify-center gap-4 lg:h-[50vw]">
						<Image
							src={AssetMap.NoEvents}
							alt="No events"
							width={200}
							height={200}
							className="mb-4"
						/>
						<p className="text-muted-foreground text-sm">
							{copy.community.home.empty}
						</p>
						<Link href={Routes.Main.Events.Create} passHref>
							<Button variant="outline">Create Community</Button>
						</Link>
					</div>
				)}

				<div className="flex flex-col gap-4 lg:gap-6 w-full">
					<div className="flex w-full flex-row justify-between gap-4">
						<h2 className="text-xl font-semibold">
							{copy.community.home.managed}
						</h2>
						<Link href={Routes.Main.Events.Create} passHref>
							<Button variant="outline">Create Community</Button>
						</Link>
					</div>
					<div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
						{managedCommunities.map(
							({ slug, name, coverImage, members, id, metadata }) => {
								const { role } = metadata
								const membershipBadgeVariant = role
									? MembershipBadgeVariants[role]
									: undefined
								const label = role ? MembershipLabels[role] : undefined
								return (
									<Card key={id}>
										<CardHeader>
											<Link
												href={Routes.Main.Communities.ViewBySlug(slug)}
												passHref
											>
												<CardTitle className="flex lg:items-start items-center lg:flex-col flex-row lg:gap-2 gap-3">
													<div className="lg:w-full w-fit flex lg:flex-row flex-col-reverse gap-3 lg:gap-0 items-start justify-between">
														<Image
															src={coverImage}
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
															{members.length} members
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
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
