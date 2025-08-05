import { getAPI } from '@/server/api'

interface DiscoverLocationProps {
	params: Promise<{ slug: string }>
}

export const revalidate = 3600

export async function generateStaticParams() {
	try {
		const api = await getAPI()
		const locations = await api.location.listSlugs()
		return locations.map((l) => ({ slug: l.slug }))
	} catch (error) {
		console.error('Error generating static params for locations', error)
		return []
	}
}
export default async function DiscoverLocation({
	params,
}: DiscoverLocationProps) {
	const { slug } = await params
	const api = await getAPI()
	const _location = await api.location.get({ slug })
}
