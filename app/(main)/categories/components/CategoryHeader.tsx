import { copy } from '@/app/(main)/copy'
import { AnimatedSection } from '@/components/shared'
import { Badge } from '@/components/ui'
import type { RouterOutput } from '@/server/api'

type CategoryData = RouterOutput['category']['get']['core']
type CategoryHeaderProps = CategoryData

export const CategoryHeader = ({
	name,
	subcategories,
}: CategoryHeaderProps) => (
	<AnimatedSection className="flex flex-col px-3 pt-6 lg:gap-4 lg:px-8 gap-3 lg:pt-8">
		<div className="flex flex-col gap-2">
			<h1 className="text-2xl font-bold lg:text-4xl">{name}</h1>
			<p className="text-muted-foreground text-sm lg:text-base">
				{copy.category.view.subtitle}
			</p>
		</div>
		{subcategories.length > 0 ? (
			<div className="flex flex-row flex-wrap gap-2">
				{subcategories.map((sub) => (
					<Badge key={sub} variant="secondary">
						{sub}
					</Badge>
				))}
			</div>
		) : null}
	</AnimatedSection>
)
