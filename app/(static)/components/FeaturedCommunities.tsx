import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button, Image } from '@/components/ui'
import { Routes } from '@/lib/config'
import { getAPI } from '@/server/api'
import { copy } from '../copy'

async function getFeaturedCommunities() {
	try {
		const api = await getAPI()
		const defaultLocation = await api.location.get.default()
		return await api.community.nearby({
			locationId: defaultLocation.id,
			take: 6,
		})
	} catch {
		return []
	}
}

export const FeaturedCommunities = async () => {
	const communities = await getFeaturedCommunities()

	if (communities.length === 0) return null

	return (
		<section className="container mx-auto w-full max-w-extra-wide-page px-4">
			<div className="flex items-end justify-between">
				<div>
					<h2 className="font-semibold font-serif text-2xl lg:text-3xl">
						{copy.featured.communities.title}
					</h2>
					<p className="mt-1 text-muted-foreground text-sm lg:text-base">
						{copy.featured.communities.description}
					</p>
				</div>
				<Link href={Routes.Main.Communities.Discover}>
					<Button variant="ghost" size="sm">
						{copy.featured.communities.cta}
						<ArrowRight className="ml-1 size-4" />
					</Button>
				</Link>
			</div>
			<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{communities.map((community) => (
					<FeaturedCommunityCard key={community.id} {...community} />
				))}
			</div>
		</section>
	)
}

function FeaturedCommunityCard({
	name,
	slug,
	description,
	coverImage,
}: {
	name: string
	slug: string
	description: string | null
	coverImage: string | null
}) {
	return (
		<Link
			href={Routes.Main.Communities.ViewBySlug(slug)}
			className="group flex items-center gap-4 rounded-lg border border-white/10 p-4 transition-colors hover:border-white/30"
		>
			{coverImage && (
				<Image
					src={coverImage}
					alt={name}
					fill
					className="rounded-lg object-cover transition-transform group-hover:scale-105"
					wrapperClassName="relative shrink-0 size-16"
					sizes={{ sm: '64px' }}
				/>
			)}
			<div className="min-w-0 flex-1">
				<h3 className="truncate font-semibold text-base">{name}</h3>
				{description && (
					<p className="line-clamp-2 text-muted-foreground text-sm">
						{description}
					</p>
				)}
			</div>
		</Link>
	)
}
