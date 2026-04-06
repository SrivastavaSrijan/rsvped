import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button, Image } from '@/components/ui'
import { Routes } from '@/lib/config'
import { getEventDateTime } from '@/lib/hooks'
import { getAPI } from '@/server/api'
import { copy } from '../copy'

async function getFeaturedEvents() {
	try {
		const api = await getAPI()
		const defaultLocation = await api.location.get.default()
		return await api.event.nearby({
			locationId: defaultLocation.id,
			take: 8,
		})
	} catch {
		return []
	}
}

export const FeaturedEvents = async () => {
	const events = await getFeaturedEvents()

	if (events.length === 0) return null

	return (
		<section className="container mx-auto w-full max-w-extra-wide-page px-4">
			<div className="flex items-end justify-between">
				<div>
					<h2 className="font-semibold font-serif text-2xl lg:text-3xl">
						{copy.featured.events.title}
					</h2>
					<p className="mt-1 text-muted-foreground text-sm lg:text-base">
						{copy.featured.events.description}
					</p>
				</div>
				<Link href={Routes.Main.Events.Discover}>
					<Button variant="ghost" size="sm">
						{copy.featured.events.cta}
						<ArrowRight className="ml-1 size-4" />
					</Button>
				</Link>
			</div>
			<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{events.map((event) => (
					<FeaturedEventCard key={event.id} {...event} />
				))}
			</div>
		</section>
	)
}

function FeaturedEventCard({
	title,
	slug,
	coverImage,
	startDate,
	endDate,
}: {
	title: string
	slug: string
	coverImage: string | null
	startDate: Date
	endDate: Date
}) {
	const { range } = getEventDateTime({ start: startDate, end: endDate })
	return (
		<Link
			href={Routes.Main.Events.ViewBySlug(slug)}
			className="group flex items-center gap-3 rounded-lg border border-white/10 p-3 transition-colors hover:border-white/30"
		>
			{coverImage && (
				<Image
					src={coverImage}
					alt={title}
					width={64}
					height={64}
					className="rounded-md object-cover transition-transform group-hover:scale-105"
					wrapperClassName="shrink-0 size-16"
				/>
			)}
			<div className="min-w-0 flex-1">
				<h3 className="truncate font-medium text-sm">{title}</h3>
				<p className="text-muted-foreground text-sm">{range.date}</p>
				<p className="text-muted-foreground text-xs">{range.time}</p>
			</div>
		</Link>
	)
}
