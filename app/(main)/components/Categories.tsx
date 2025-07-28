import { chunk } from 'lodash'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import {
	Button,
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui'
import { Routes } from '@/lib/config'
import type { RouterOutput } from '@/server/api/root'

type CategoriesData = RouterOutput['category']['list']
interface CategoriesProps {
	categories: CategoriesData
}

const DESKTOP_PAGE_SIZE = 6 // 3 columns * 2 rows
const MOBILE_PAGE_SIZE = 1 // 1 column * 3 rows

export const Categories = ({ categories }: CategoriesProps) => {
	const desktopPages = chunk(categories, DESKTOP_PAGE_SIZE)
	const mobilePages = chunk(categories, MOBILE_PAGE_SIZE)

	return (
		<div className="flex flex-col">
			{/* Mobile Carousel: Hidden on lg screens and up */}
			<Carousel opts={{ align: 'start' }} className="w-full lg:hidden">
				<CarouselContent className="-ml-1">
					{mobilePages.map((page, index) => (
						<CarouselItem
							key={`mobile-cat-page-${
								// biome-ignore lint/suspicious/noArrayIndexKey: reasonable use of index as key
								index
							}`}
							className="pl-1 basis-2/5 flex flex-col gap-1"
						>
							{page.map(({ slug, name, _count: count, id }) => (
								<Card key={id} className="h-full">
									<Link href={Routes.Main.Events.DiscoverByCategory(slug)} passHref>
										<CardHeader>
											<CardTitle>{name}</CardTitle>
											<CardDescription>{count.events} events</CardDescription>
											<CardAction></CardAction>
										</CardHeader>
									</Link>
								</Card>
							))}
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>

			{/* Desktop Carousel: Hidden below lg screens */}
			<Carousel opts={{ align: 'start' }} className="hidden w-full lg:block">
				<CarouselContent className="-ml-4">
					{desktopPages.map((page, index) => (
						<CarouselItem
							key={`desktop-cat-page-${
								// biome-ignore lint/suspicious/noArrayIndexKey: reasonable use of index as key
								index
							}`}
							className="pl-4 basis-full grid grid-cols-3 gap-2"
						>
							{page.map(({ slug, name, _count: count, id }) => (
								<Card key={id}>
									<CardHeader>
										<CardTitle>{name}</CardTitle>
										<CardDescription>{count.events} events</CardDescription>
										<CardAction>
											<Link href={Routes.Main.Events.DiscoverByCategory(slug)}>
												<Button size="icon" variant="ghost">
													<ArrowUpRight />
												</Button>
											</Link>
										</CardAction>
									</CardHeader>
								</Card>
							))}
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</div>
	)
}
