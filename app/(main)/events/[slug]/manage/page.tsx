import { ArrowUpLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProgressiveManageEventCard } from '@/app/(main)/events/components'
import {
	Button,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui'
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

export default async function ViewEvent({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const api = await getAPI()
	try {
		const coreEvent = await api.event.get.core({ slug })
		if (!coreEvent) {
			return notFound()
		}
		return (
			<Tabs
				className="mx-auto flex w-full max-w-page flex-col gap-8 px-3 pb-6 lg:gap-12 lg:px-8 lg:pb-8"
				defaultValue="details"
			>
				<div className="flex flex-col gap-4 lg:gap-6">
					<div className="flex flex-col gap-1">
						<Link href={Routes.Main.Events.Home} passHref>
							<Button
								variant="link"
								size="sm"
								className=" text-muted-foreground opacity-50"
							>
								<ArrowUpLeft className=" text-muted-foreground" /> Back home
							</Button>
						</Link>
						<h1 className="font-bold text-2xl lg:text-3xl">
							{coreEvent.title}
						</h1>
					</div>
					<TabsList className="w-full">
						<TabsTrigger value="details">Details</TabsTrigger>
						<TabsTrigger value="stats">Community</TabsTrigger>
						<TabsTrigger value="invites">Invites</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent value="details">
					<ProgressiveManageEventCard coreEvent={coreEvent} />
				</TabsContent>
				<TabsContent value="stats"></TabsContent>
			</Tabs>
		)
	} catch (error) {
		console.error('Error fetching event:', error)
		return notFound()
	}
}
