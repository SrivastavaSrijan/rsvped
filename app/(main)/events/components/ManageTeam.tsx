import { Crown, Shield, Users } from 'lucide-react'
import { AvatarWithFallback, Badge, Card } from '@/components/ui'

interface Collaborator {
	role: string
	user: { id: string; name: string | null; image: string | null }
}

interface ManageTeamProps {
	host: {
		id: string
		name: string | null
		image: string | null
		email: string | null
	}
	collaborators: Collaborator[]
}

const roleConfig: Record<
	string,
	{ label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
	CO_HOST: { label: 'Co-Host', variant: 'default' },
	MANAGER: { label: 'Manager', variant: 'secondary' },
	CHECKIN: { label: 'Check-in', variant: 'outline' },
}

export const ManageTeam = ({ host, collaborators }: ManageTeamProps) => {
	return (
		<div className="flex flex-col gap-3">
			{/* Host */}
			<Card className="flex items-center gap-3 p-4">
				<AvatarWithFallback
					src={host.image}
					name={host.name ?? 'Host'}
					className="size-10"
				/>
				<div className="flex flex-1 flex-col gap-0.5">
					<span className="font-medium text-sm">{host.name}</span>
					<span className="text-muted-foreground text-xs">{host.email}</span>
				</div>
				<Badge variant="default" className="gap-1">
					<Crown className="size-3" />
					Host
				</Badge>
			</Card>

			{/* Collaborators */}
			{collaborators.length > 0 ? (
				collaborators.map((collab) => {
					const cfg = roleConfig[collab.role] ?? {
						label: collab.role,
						variant: 'outline' as const,
					}
					return (
						<Card key={collab.user.id} className="flex items-center gap-3 p-4">
							<AvatarWithFallback
								src={collab.user.image}
								name={collab.user.name ?? 'Collaborator'}
								className="size-10"
							/>
							<div className="flex flex-1 flex-col gap-0.5">
								<span className="font-medium text-sm">{collab.user.name}</span>
							</div>
							<Badge variant={cfg.variant} className="gap-1">
								<Shield className="size-3" />
								{cfg.label}
							</Badge>
						</Card>
					)
				})
			) : (
				<Card className="flex flex-col items-center justify-center gap-3 p-8 text-center">
					<Users className="size-8 text-muted-foreground" />
					<div className="flex flex-col gap-1">
						<p className="font-medium text-sm">Solo host</p>
						<p className="text-muted-foreground text-xs">
							Only you are managing this event
						</p>
					</div>
				</Card>
			)}
		</div>
	)
}
