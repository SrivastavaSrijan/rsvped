import {
	Briefcase,
	Calendar,
	Edit,
	ExternalLink,
	LogOut,
	MapPin,
	Sparkles,
	Users,
	Zap,
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
	AvatarWithFallback,
	Badge,
	Button,
	buttonVariants,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui'
import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config'
import { cn } from '@/lib/utils'
import { signOutAction } from '@/server/actions'
import { getAPI } from '@/server/api'

export default async function ProfilePage() {
	const session = await auth()

	if (!session?.user) {
		redirect(Routes.Auth.SignIn)
	}

	const api = await getAPI()

	const [profile, communities, rsvps] = await Promise.all([
		api.user.profile.enhanced(),
		api.user.activity.communities({ page: 1, size: 10 }),
		api.user.activity.rsvps({ page: 1, size: 20 }),
	])

	if (!profile) {
		redirect(Routes.Auth.SignIn)
	}

	const friendCount =
		profile._count.sentFriendRequests + profile._count.receivedFriendRequests
	const upcomingRsvps = rsvps.filter(
		(r) => new Date(r.event.startDate) >= new Date()
	)

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-6 px-4 py-12">
			{/* Header */}
			<div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-6">
				<AvatarWithFallback
					src={profile.image}
					name={profile.name ?? undefined}
					className="size-24 text-3xl"
				/>
				<div className="flex flex-1 flex-col items-center gap-2 lg:items-start">
					<div className="flex items-center gap-3">
						<h1 className="font-bold text-2xl text-foreground">
							{profile.name ?? 'Anonymous'}
						</h1>
						<Link
							href={Routes.Auth.EditProfile}
							className={cn(
								buttonVariants({ variant: 'outline', size: 'sm' }),
								'cursor-pointer gap-1'
							)}
						>
							<Edit className="size-3" />
							Edit Profile
						</Link>
					</div>

					{profile.username ? (
						<p className="text-sm text-muted-foreground">@{profile.username}</p>
					) : null}

					{profile.bio ? (
						<p className="max-w-lg text-sm text-muted-foreground">
							{profile.bio}
						</p>
					) : null}

					<div className="flex flex-wrap items-center gap-2">
						{profile.profession ? (
							<Badge variant="secondary" className="gap-1">
								<Briefcase className="size-3" />
								{profile.profession}
							</Badge>
						) : null}
						{profile.experienceLevel ? (
							<Badge variant="outline" className="gap-1">
								<Zap className="size-3" />
								{profile.experienceLevel}
							</Badge>
						) : null}
						{profile.networkingStyle ? (
							<Badge variant="outline" className="gap-1">
								<Sparkles className="size-3" />
								{profile.networkingStyle}
							</Badge>
						) : null}
						{profile.location ? (
							<Badge variant="outline" className="gap-1">
								<MapPin className="size-3" />
								{profile.location.name}
							</Badge>
						) : null}
					</div>

					{profile.username ? (
						<Link
							href={Routes.Main.Users.ViewByUsername(profile.username)}
							className="flex items-center gap-1 text-xs text-brand hover:underline"
						>
							<ExternalLink className="size-3" />
							View Public Profile
						</Link>
					) : null}
				</div>
			</div>

			{/* Stats */}
			<div className="flex justify-center gap-8 border-y border-border py-4 lg:justify-start">
				<StatItem
					icon={<Calendar className="size-4" />}
					value={profile._count.hostedEvents}
					label="Events"
				/>
				<StatItem
					icon={<Users className="size-4" />}
					value={communities.length}
					label="Communities"
				/>
				<StatItem
					icon={<Users className="size-4" />}
					value={friendCount}
					label="Friends"
				/>
				<StatItem
					icon={<Zap className="size-4" />}
					value={profile._count.rsvps}
					label="RSVPs"
				/>
			</div>

			{/* Interests */}
			{profile.categoryInterests.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					{profile.categoryInterests.map((ci) => (
						<Badge key={ci.category.id} variant="secondary">
							{ci.category.name}
						</Badge>
					))}
				</div>
			) : null}

			{/* Tabs */}
			<Tabs defaultValue="events">
				<TabsList className="w-full justify-start">
					<TabsTrigger value="events" className="cursor-pointer gap-1">
						<Calendar className="size-4" />
						Events
					</TabsTrigger>
					<TabsTrigger value="communities" className="cursor-pointer gap-1">
						<Users className="size-4" />
						Communities
					</TabsTrigger>
					<TabsTrigger value="rsvps" className="cursor-pointer gap-1">
						<Zap className="size-4" />
						Upcoming
					</TabsTrigger>
				</TabsList>

				<TabsContent value="events">
					{profile.hostedEvents.length > 0 ? (
						<div className="flex flex-col gap-2 py-4">
							{profile.hostedEvents.map((event) => (
								<Link
									key={event.id}
									href={Routes.Main.Events.ViewBySlug(event.slug)}
									className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3 transition-colors hover:bg-muted"
								>
									<div className="flex flex-col gap-0.5">
										<span className="text-sm font-medium text-foreground">
											{event.title}
										</span>
										{event.location ? (
											<span className="text-xs text-muted-foreground">
												{event.location.name}
											</span>
										) : null}
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="secondary">
											{event._count.rsvps} RSVPs
										</Badge>
										<span className="text-xs text-muted-foreground">
											{new Date(event.startDate).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
											})}
										</span>
									</div>
								</Link>
							))}
						</div>
					) : (
						<EmptyTab message="You haven't hosted any events yet." />
					)}
				</TabsContent>

				<TabsContent value="communities">
					{communities.length > 0 ? (
						<div className="flex flex-col gap-2 py-4">
							{communities.map((m) => (
								<Link
									key={m.community.id}
									href={Routes.Main.Communities.ViewBySlug(m.community.slug)}
									className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3 transition-colors hover:bg-muted"
								>
									<span className="text-sm font-medium text-foreground">
										{m.community.name}
									</span>
									<Badge variant="outline">{m.role}</Badge>
								</Link>
							))}
						</div>
					) : (
						<EmptyTab message="You haven't joined any communities yet." />
					)}
				</TabsContent>

				<TabsContent value="rsvps">
					{upcomingRsvps.length > 0 ? (
						<div className="flex flex-col gap-2 py-4">
							{upcomingRsvps.map((r) => (
								<Link
									key={r.id}
									href={Routes.Main.Events.ViewBySlug(r.event.slug)}
									className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3 transition-colors hover:bg-muted"
								>
									<div className="flex flex-col gap-0.5">
										<span className="text-sm font-medium text-foreground">
											{r.event.title}
										</span>
										{r.ticketTier ? (
											<span className="text-xs text-muted-foreground">
												{r.ticketTier.name}
											</span>
										) : null}
									</div>
									<span className="text-xs text-muted-foreground">
										{new Date(r.event.startDate).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											year: 'numeric',
										})}
									</span>
								</Link>
							))}
						</div>
					) : (
						<EmptyTab message="No upcoming RSVPs." />
					)}
				</TabsContent>
			</Tabs>

			{/* Sign Out */}
			<div className="border-t border-border pt-6">
				<form action={signOutAction}>
					<Button
						type="submit"
						variant="outline"
						className="cursor-pointer gap-2"
					>
						<LogOut className="size-4" />
						Sign Out
					</Button>
				</form>
			</div>
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
			<div className="flex items-center gap-1 text-foreground">
				{icon}
				<span className="font-semibold text-lg">{value}</span>
			</div>
			<span className="text-xs text-muted-foreground">{label}</span>
		</div>
	)
}

function EmptyTab({ message }: { message: string }) {
	return (
		<div className="flex items-center justify-center py-12">
			<p className="text-sm text-muted-foreground">{message}</p>
		</div>
	)
}
