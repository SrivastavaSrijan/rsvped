import type { RouterOutput } from '@/server/api'
import { EmptyState } from './EmptyState'
import { UserCommunityItem } from './UserCommunityItem'

interface UserCommunitiesListProps {
	communities: RouterOutput['community']['list']
	title: string
	emptyMessage: string
}

export const UserCommunitiesList = ({
	communities,
	title,
	emptyMessage,
}: UserCommunitiesListProps) => {
	return (
		<div className="flex flex-col gap-4 lg:gap-6 w-full">
			<div className="flex w-full flex-row justify-between gap-4">
				<h2 className="text-xl font-semibold">{title}</h2>
			</div>
			{communities.length === 0 ? (
				<EmptyState message={emptyMessage} />
			) : (
				<div className="flex flex-col gap-4 lg:gap-6">
					{communities.map((community) => (
						<UserCommunityItem key={community.id} {...community} />
					))}
				</div>
			)}
		</div>
	)
}
