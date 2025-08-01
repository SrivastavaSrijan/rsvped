import { getAPI } from '@/server/api'

interface DiscoverLocationProps {
	params: Promise<{ slug: string }>
}
export default async function DiscoverLocation({
	params,
}: DiscoverLocationProps) {
	const { slug } = await params
	const api = await getAPI()
	const location = await api.location.get({ slug })
}
