import { ArrowUpLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { ManageTabs } from '@/app/(main)/events/components/ManageTabs'
import { Button } from '@/components/ui'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'

export const generateMetadata = async ({
	params,
}: {
	params: Promise<{ slug: string }>
}) => {
	const { slug } = await params
	const api = await getAPI()
	const event = await api.event.get.core({ slug })
	return {
		title: `${event.title} · RSVP'd`,
		description: `View details for the event: ${event.title}`,
	}
}

interface ManageLayoutProps {
	children: ReactNode
	overview: ReactNode
	guests: ReactNode
	insights: ReactNode
	team: ReactNode
	params: Promise<{ slug: string }>
}

export default async function ManageLayout({
	children,
	overview,
	guests,
	insights,
	team,
	params,
}: ManageLayoutProps) {
	const { slug } = await params

	const api = await getAPI()
	let eventTitle: string
	try {
		const coreEvent = await api.event.get.core({ slug })
		if (!coreEvent) return notFound()
		eventTitle = coreEvent.title
	} catch {
		return notFound()
	}

	return (
		<div className="mx-auto flex w-full max-w-page flex-col gap-8 px-3 pb-6 lg:gap-12 lg:px-8 lg:pb-8">
			<div className="flex flex-col gap-4 lg:gap-6">
				<div className="flex flex-col gap-1">
					<Link href={Routes.Main.Events.Home} passHref>
						<Button
							variant="link"
							size="sm"
							className="text-muted-foreground opacity-50"
						>
							<ArrowUpLeft className="text-muted-foreground" /> Back home
						</Button>
					</Link>
					<h1 className="font-bold text-2xl lg:text-3xl">{eventTitle}</h1>
				</div>
				<ManageTabs
					overview={overview}
					guests={guests}
					insights={insights}
					team={team}
					basePath={`/events/${slug}/manage`}
				/>
			</div>
			{children}
		</div>
	)
}
