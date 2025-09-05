import { copy } from '@/app/(main)/copy'
import type { RouterOutput } from '@/server/api'
import { EmptyState } from './EmptyState'
import { GenericPagination } from './GenericPagination'
import { UserCommunityItem } from './UserCommunityItem'

type CommunityData = RouterOutput['community']['list']['core']

interface UserCommunitiesListProps extends CommunityData {}

export const UserCommunitiesList = ({
	data = [],
	pagination,
}: UserCommunitiesListProps) => {
	return (
		<div className="flex flex-col gap-4 lg:gap-6 w-full">
			<div className="flex w-full flex-row justify-between gap-4">
				<h2 className="text-xl font-semibold">{copy.community.home.member}</h2>
			</div>
			{pagination?.total === 0 ? (
				<EmptyState message={copy.community.home.empty} />
			) : (
				<div className="flex flex-col gap-4 lg:gap-6">
					{data.map((community) => (
						<UserCommunityItem key={community.id} {...community} />
					))}
					<GenericPagination {...pagination} />
				</div>
			)}
		</div>
	)
}
