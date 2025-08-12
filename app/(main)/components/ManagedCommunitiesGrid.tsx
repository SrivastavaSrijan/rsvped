import Link from 'next/link'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config'
import type { RouterOutput } from '@/server/api'
import { copy } from '../copy'
import { EmptyState } from './EmptyState'
import { ManagedCommunityCard } from './ManagedCommunityCard'

type CommunityData = RouterOutput['community']['list']['core']
interface ManagedCommunitiesGridProps extends CommunityData {
	// Add any additional props here
}

export const ManagedCommunitiesGrid = ({
	data = [],
	pagination,
}: ManagedCommunitiesGridProps) => {
	return (
		<div className="flex flex-col gap-4 lg:gap-6 w-full">
			<div className="flex w-full flex-row justify-between gap-4">
				<h2 className="text-xl font-semibold">{copy.community.home.managed}</h2>
				<Link href={Routes.Main.Events.Create} passHref>
					<Button variant="outline">Create Community</Button>
				</Link>
			</div>
			{pagination?.total === 0 ? (
				<EmptyState
					message={copy.community.home.emptyManaged}
					label="Create Community"
					href={Routes.Main.Events.Create}
				/>
			) : (
				<div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
					{data.map((community) => (
						<ManagedCommunityCard key={community.id} {...community} />
					))}
				</div>
			)}
		</div>
	)
}
