'use client'
import { chunk } from 'es-toolkit/array'
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui'
import { cn } from '@/lib/utils'

interface ResponsiveGridCarouselProps<T extends { id: string | number }> {
	config: {
		cols?: {
			lg?: number
			sm?: number
		}
		gap?: {
			lg?: number
			sm?: number
		}
		pageSize: {
			lg: number
			sm: number
		}
	}
	data: T[]
	/**
	 * !IMPORTANT: The item component must accept props of type T.
	 * It MUST be marked with 'use client' because this component (`ResponsiveGridCarousel`) is a client component and needs to render the item component on the client side.
	 */
	item: React.ComponentType<T>
}

export const ResponsiveGridCarousel = <T extends { id: string | number }>({
	config,
	data,
	item: ItemComponent,
}: ResponsiveGridCarouselProps<T>) => {
	const mobilePages = chunk(data, config.pageSize.sm)
	const desktopPages = chunk(data, config.pageSize.lg)

	const renderPage = (page: T[]) => page.map((item) => <ItemComponent key={item.id} {...item} />)

	return (
		<>
			{data?.length === 0 && (
				<Alert variant="default" className="w-full">
					<AlertTitle>Nothing here!</AlertTitle>
					<AlertDescription>
						There are no items to display in this section. Please check back later or explore other
						sections.
					</AlertDescription>
				</Alert>
			)}
			{/* Mobile Carousel: Hidden on sm screens and up. */}
			<Carousel opts={{ align: 'start' }} className="w-full sm:hidden">
				<CarouselContent className="-ml-2">
					{mobilePages.map((page, index) => (
						<CarouselItem
							key={`mobile-${
								// biome-ignore lint/suspicious/noArrayIndexKey: reasonable use of index as key
								index
							}`}
							className={cn(
								'pl-2 basis-10/12 flex flex-col',
								config.gap?.sm ? `gap-${config.gap.sm}` : '',
								config.gap?.lg ? `lg:gap-${config.gap.lg}` : '',
								!config.gap ? 'gap-4' : ''
							)}
						>
							{renderPage(page)}
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>

			{/* Desktop Carousel: Hidden below sm screens. */}
			<Carousel opts={{ align: 'start' }} className="hidden w-full sm:block">
				<CarouselContent>
					{desktopPages.map((page, index) => (
						<CarouselItem
							key={`desktop-${
								// biome-ignore lint/suspicious/noArrayIndexKey: reasonable use of index as key
								index
							}`}
							className={cn(
								'grid',
								`grid-cols-${config.cols?.lg ?? 2}`,
								config.gap?.sm ? `gap-${config.gap.sm}` : '',
								config.gap?.lg ? `lg:gap-${config.gap.lg}` : '',
								!config.gap ? 'gap-6' : ''
							)}
						>
							{renderPage(page)}
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</>
	)
}
