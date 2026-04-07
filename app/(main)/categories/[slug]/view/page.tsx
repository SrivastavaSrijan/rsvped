import { notFound } from 'next/navigation'
import { CategoryHeader } from '@/app/(main)/categories/components'
import { FilteredEventsList } from '@/app/(main)/events/components'
import { type EventListSearchParams, getAPI } from '@/server/api'

interface ViewCategoryProps {
	params: Promise<{ slug: string }>
	searchParams: Promise<EventListSearchParams>
}

export default async function ViewCategory({
	params,
	searchParams,
}: ViewCategoryProps) {
	const { slug } = await params
	const api = await getAPI()
	try {
		const category = await api.category.get.core({ slug })
		if (!category) {
			return notFound()
		}
		return (
			<div className="flex flex-col w-full">
				<CategoryHeader {...category} />
				<div className="mx-auto flex w-full max-w-wide-page flex-col gap-4">
					<div className="flex flex-col px-3 pb-6 lg:gap-8 lg:px-8 gap-4 lg:pb-8">
						<FilteredEventsList
							where={{ categoryId: category.id }}
							{...(await searchParams)}
						/>
					</div>
				</div>
			</div>
		)
	} catch (e) {
		console.error('Error fetching category:', e)
		return notFound()
	}
}
