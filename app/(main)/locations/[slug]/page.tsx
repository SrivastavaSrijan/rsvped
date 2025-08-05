import { prisma } from '@/lib/prisma'
import { getAPI } from '@/server/api'

interface DiscoverLocationProps {
	params: Promise<{ slug: string }>
}

export const revalidate = 3600

export async function generateStaticParams() {
	const locations = await prisma.location.findMany({
		where: {
			events: { some: { isPublished: true, deletedAt: null } },
		},
		select: { slug: true },
		take: 50,
	})
	await prisma.$disconnect()
	return locations.map((l) => ({ slug: l.slug }))
}
export default async function DiscoverLocation({
	params,
}: DiscoverLocationProps) {
	const { slug } = await params
	const api = await getAPI()
	const _location = await api.location.get({ slug })
}
