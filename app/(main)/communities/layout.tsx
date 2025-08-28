import type { ReactNode } from 'react'
import { CommunityTabs } from '../components'
import { copy } from '../copy'

interface CommunitiesLayoutProps {
	children: ReactNode
	managed: ReactNode
	member: ReactNode
}

export default function CommunitiesLayout({
	children,
	managed,
	member,
}: CommunitiesLayoutProps) {
	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="flex w-full flex-row justify-between gap-4">
				<h1 className="font-bold text-2xl lg:px-0 lg:text-4xl">
					{copy.community.home.title}
				</h1>
			</div>
			<CommunityTabs managed={managed} member={member} />

			{children}
		</div>
	)
}
