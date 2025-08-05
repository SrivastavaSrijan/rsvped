import Link from 'next/link'
import { Button } from '@/components/ui'
import type { RouterOutput } from '@/server/api'
import { EmptyState } from './EmptyState'
import { ManagedCommunityCard } from './ManagedCommunityCard'

interface ManagedCommunitiesGridProps {
	communities: RouterOutput['community']['list']
	title: string
	emptyMessage: string
	createButtonLabel: string
	createButtonHref: string
}

export const ManagedCommunitiesGrid = ({
	communities,
	title,
	emptyMessage,
	createButtonLabel,
	createButtonHref,
}: ManagedCommunitiesGridProps) => {
	return (
		<div className="flex flex-col gap-4 lg:gap-6 w-full">
			<div className="flex w-full flex-row justify-between gap-4">
				<h2 className="text-xl font-semibold">{title}</h2>
				<Link href={createButtonHref} passHref>
					<Button variant="outline">{createButtonLabel}</Button>
				</Link>
			</div>
			{communities.length === 0 ? (
				<EmptyState
					message={emptyMessage}
					actionLabel={createButtonLabel}
					actionHref={createButtonHref}
				/>
			) : (
				<div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
					{communities.map((community) => (
						<ManagedCommunityCard key={community.id} {...community} />
					))}
				</div>
			)}
		</div>
	)
}
