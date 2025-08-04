import { chunk } from 'es-toolkit/array'
import Link from 'next/link'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	Image,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui'
import { AssetMap, Routes } from '@/lib/config'
import { getRandomColor } from '@/lib/utils'
import type { RouterOutput } from '@/server/api'

const MOBILE_PAGE_SIZE = 6 // 2 column * 3 rows

type LocationsData = RouterOutput['location']['list']['continents']
type LocationData = LocationsData[number]['locations'][number]
interface Location extends LocationData {
	link?: boolean
}

export const Location = ({
	id,
	name,
	slug,
	iconPath,
	_count: count,
	link = false,
}: Location) => {
	const renderContent = (
		<div className="flex flex-row  gap-2 lg:gap-2 items-center">
			<Image
				unoptimized
				fill
				sizes="48px"
				src={`${AssetMap.Locations}/${iconPath}`}
				alt={name}
				className="rounded-full "
				wrapperClassName="rounded-full flex items-center aspect-square lg:w-10 lg:h-10 w-9 h-9 justify-center relative"
				wrapperStyle={{
					backgroundColor: getRandomColor({
						seed: id,
						palette: 'extended',
						intensity: 60,
					}),
				}}
			/>
			<div className="flex flex-col">
				<p className="lg:text-base text-sm line-clamp-1 font-semibold">
					{name}
				</p>
				<p className="lg:text-sm text-sm text-muted-foreground">
					{count?.events} events
				</p>
			</div>
		</div>
	)

	return link ? (
		<Link
			key={id}
			href={Routes.Main.Locations.ViewBySlug(slug)}
			className="contents"
		>
			{renderContent}
		</Link>
	) : (
		renderContent
	)
}

interface LocationsProps {
	continents: LocationsData
	defaultValue?: string
}
export const Locations = ({ continents, defaultValue }: LocationsProps) => {
	return (
		<Tabs
			defaultValue={defaultValue || Object.keys(continents)[0]}
			className="w-full flex flex-col lg:gap-4 gap-3 px-1"
		>
			<TabsList className="flex flex-row lg:gap-3 gap-2 bg-transparent overflow-x-auto lg:w-fit w-full pb-1.5">
				{Object.keys(continents).map((continent) => (
					<TabsTrigger key={continent} value={continent}>
						{continent}
					</TabsTrigger>
				))}
			</TabsList>
			{Object.entries(continents).map(([continent, { locations }]) => (
				<TabsContent key={continent} value={continent}>
					<div className="lg:grid hidden lg:grid-cols-4 grid-cols-2 lg:gap-4 gap-2">
						{locations.map((location) => (
							<Location link key={location.id} {...location} />
						))}
					</div>
					<div className="lg:hidden flex flex-row">
						<Carousel opts={{ align: 'start' }} className="w-full">
							<CarouselContent className="-ml-3">
								{chunk(locations, MOBILE_PAGE_SIZE).map(
									(chunkedLocations, index) => (
										<CarouselItem
											// biome-ignore lint/suspicious/noArrayIndexKey: reasonable use of index as key
											key={`mobile-locations-${index}`}
											className="pl-3 basis-10/12 grid grid-cols-2 gap-3"
										>
											{chunkedLocations.map((location) => (
												<Location key={location.id} link {...location} />
											))}
										</CarouselItem>
									)
								)}
							</CarouselContent>
						</Carousel>
					</div>
				</TabsContent>
			))}
		</Tabs>
	)
}
