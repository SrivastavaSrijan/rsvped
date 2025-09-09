import { Suspense } from 'react'
import { StirSearch } from '@/app/(main)/stir/components'
import { StirSlotSwitch } from '@/app/(main)/stir/components/StirSlotSwitch'
import { StirTabsHeader } from '@/app/(main)/stir/components/StirTabsHeader'
import { copy } from '../copy'

interface StirLayoutProps {
	children: React.ReactNode
	events: React.ReactNode
	communities: React.ReactNode
}

export default async function StirLayout({
	events,
	communities,
}: StirLayoutProps) {
	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-4 px-3 py-6 lg:gap-8 lg:px-8 lg:py-8">
			<div className="flex flex-col gap-2 lg:gap-3">
				<h1 className="font-bold text-2xl lg:px-0 lg:text-4xl">
					{copy.stir.title}
				</h1>
				<p className="text-muted-foreground text-sm lg:text-base">
					{copy.stir.description}
				</p>
			</div>

			<StirSearch mode="live" />

			<StirTabsHeader />

			{/* Parallel slots, rendered in parallel and toggled via URL param */}
			<div className="mt-2">
				<StirSlotSwitch
					events={<Suspense>{events}</Suspense>}
					communities={<Suspense>{communities}</Suspense>}
				/>
			</div>
		</div>
	)
}
