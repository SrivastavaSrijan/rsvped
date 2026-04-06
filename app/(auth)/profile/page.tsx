import { LogOut, MapPin, Shield, Users } from 'lucide-react'
import { redirect } from 'next/navigation'
import { AvatarWithFallback, Badge, Button, Separator } from '@/components/ui'
import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config'
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
				<div className="flex flex-col items-center gap-2 lg:items-start">
					<h1 className="font-bold text-2xl text-white">
						{profile.name ?? 'Anonymous'}
					</h1>
					<p className="text-sm text-white/60">{profile.email}</p>
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
						{profile.location ? (
							<Badge variant="outline" className="gap-1 text-white/70">
								<MapPin className="size-3" />
								{profile.location.name}
							</Badge>
						) : null}
					</div>
				</div>
			</div>

			<Separator className="bg-white/10" />

			{/* Communities */}
			<section className="flex flex-col gap-3">
				<div className="flex items-center gap-2">
					<Users className="size-5 text-white/70" />
					<h2 className="font-semibold text-lg text-white">
						Communities ({communities.length})
					</h2>
				</div>
				{communities.length > 0 ? (
					<ul className="flex flex-col gap-2">
						{communities.map((m) => (
							<li
								key={m.community.id}
								className="rounded-lg bg-white/5 px-4 py-3 text-sm text-white/80"
							>
								{m.community.name}
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-white/40">
						You haven&apos;t joined any communities yet.
					</p>
				)}
			</section>

			<Separator className="bg-white/10" />

			{/* Upcoming RSVPs */}
			<section className="flex flex-col gap-3">
				<h2 className="font-semibold text-lg text-white">
					Upcoming RSVPs ({upcomingRsvps.length})
				</h2>
				{upcomingRsvps.length > 0 ? (
					<ul className="flex flex-col gap-2">
						{upcomingRsvps.map((r) => (
							<li
								key={r.id}
								className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3"
							>
								<span className="text-sm text-white/80">{r.event.title}</span>
								<span className="text-xs text-white/40">
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
					<p className="text-sm text-white/40">No upcoming RSVPs.</p>
				)}
			</section>

			<Separator className="bg-white/10" />

			{/* Hosted Events */}
			<section className="flex flex-col gap-3">
				<h2 className="font-semibold text-lg text-white">
					Hosted Events ({profile._count.hostedEvents})
				</h2>
				{profile.hostedEvents.length > 0 ? (
					<ul className="flex flex-col gap-2">
						{profile.hostedEvents.map((event) => (
							<li
								key={event.id}
								className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3"
							>
								<span className="text-sm text-white/80">{event.title}</span>
								<span className="text-xs text-white/40">
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
					<p className="text-sm text-white/40">
						You haven&apos;t hosted any events yet.
					</p>
				)}
			</section>

			<Separator className="bg-white/10" />

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
