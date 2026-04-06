import {
	Briefcase,
	Calendar,
	Edit,
	LogOut,
	MapPin,
	Shield,
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
	Separator,
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
		api.user.activity.rsvps({ page: 1, size: 10 }),
	])

	if (!profile) {
		redirect(Routes.Auth.SignIn)
	}

	const upcomingRsvps = rsvps.filter(
		(r) => new Date(r.event.startDate) >= new Date()
	)

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-8 px-4 py-12">
			{/* Header */}
			<div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-6">
				<AvatarWithFallback
					src={profile.image}
					name={profile.name ?? undefined}
					className="size-20 text-2xl"
				/>
				<div className="flex flex-1 flex-col items-center gap-2 lg:items-start">
					<div className="flex items-center gap-3">
						<h1 className="font-bold text-2xl text-text-primary">
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
						<p className="text-sm text-text-secondary">@{profile.username}</p>
					) : null}
					<p className="text-sm text-text-secondary">{profile.email}</p>
					{profile.bio ? (
						<p className="max-w-lg text-sm text-text-secondary">
							{profile.bio}
						</p>
					) : null}
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary" className="gap-1">
							<Shield className="size-3" />
							{profile.role}
						</Badge>
						{profile.isDemo ? (
							<Badge variant="outline" className="text-yellow-400">
								Demo User
							</Badge>
						) : null}
						{profile.profession ? (
							<Badge variant="outline" className="gap-1">
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
							className="text-xs text-brand hover:underline"
						>
							View Public Profile
						</Link>
					) : null}
				</div>
			</div>

			<Separator />

			{/* Stats */}
			<div className="flex justify-center gap-8 lg:justify-start">
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
					icon={<Zap className="size-4" />}
					value={profile._count.rsvps}
					label="RSVPs"
				/>
			</div>

			<Separator />

			{/* Communities */}
			<section className="flex flex-col gap-3">
				<div className="flex items-center gap-2">
					<Users className="size-5 text-text-secondary" />
					<h2 className="font-semibold text-lg text-text-primary">
						Communities ({communities.length})
					</h2>
				</div>
				{communities.length > 0 ? (
					<ul className="flex flex-col gap-2">
						{communities.map((m) => (
							<li
								key={m.community.id}
								className="rounded-lg bg-bg-secondary px-4 py-3 text-sm text-text-primary"
							>
								{m.community.name}
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-text-tertiary">
						You haven&apos;t joined any communities yet.
					</p>
				)}
			</section>

			<Separator />

			{/* Upcoming RSVPs */}
			<section className="flex flex-col gap-3">
				<h2 className="font-semibold text-lg text-text-primary">
					Upcoming RSVPs ({upcomingRsvps.length})
				</h2>
				{upcomingRsvps.length > 0 ? (
					<ul className="flex flex-col gap-2">
						{upcomingRsvps.map((r) => (
							<li
								key={r.id}
								className="flex items-center justify-between rounded-lg bg-bg-secondary px-4 py-3"
							>
								<span className="text-sm text-text-primary">
									{r.event.title}
								</span>
								<span className="text-xs text-text-tertiary">
									{new Date(r.event.startDate).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
										year: 'numeric',
									})}
								</span>
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-text-tertiary">No upcoming RSVPs.</p>
				)}
			</section>

			<Separator />

			{/* Hosted Events */}
			<section className="flex flex-col gap-3">
				<h2 className="font-semibold text-lg text-text-primary">
					Hosted Events ({profile._count.hostedEvents})
				</h2>
				{profile.hostedEvents.length > 0 ? (
					<ul className="flex flex-col gap-2">
						{profile.hostedEvents.map((event) => (
							<li
								key={event.id}
								className="flex items-center justify-between rounded-lg bg-bg-secondary px-4 py-3"
							>
								<span className="text-sm text-text-primary">{event.title}</span>
								<span className="text-xs text-text-tertiary">
									{new Date(event.startDate).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
										year: 'numeric',
									})}
								</span>
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-text-tertiary">
						You haven&apos;t hosted any events yet.
					</p>
				)}
			</section>

			<Separator />

			{/* Sign Out */}
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
