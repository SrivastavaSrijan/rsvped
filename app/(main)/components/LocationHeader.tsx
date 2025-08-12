import dayjs from 'dayjs'
import tz from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { Clock } from 'lucide-react'
import Link from 'next/link'
import { Button, Image } from '@/components/ui'
import { AssetMap, Routes } from '@/lib/config'
import type { RouterOutput } from '@/server/api'
import { copy } from '../copy'

dayjs.extend(tz)
dayjs.extend(utc)

type LocationData = RouterOutput['location']['get']['core']
type LocationHeaderProps = LocationData

export const LocationHeader = ({
	coverImage,
	name,
	continent,
	country,
	timezone,
	iconPath,
	slug,
}: LocationHeaderProps) => {
	return (
		<>
			{coverImage && (
				<div className="lg:h-[700px] w-full h-[500px] relative">
					<Image
						src={coverImage}
						alt={name}
						className="aspect-video object-cover"
						fill
						priority
						wrapperClassName="h-full w-full"
						sizes={{ lg: '60vw', sm: '100vw' }}
					/>
					<div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-br from-black/50 via-black/0 to-black/0 lg:from-black/40 lg:via-black/30 lg:to-black/20" />
					<div
						className="absolute inset-0 lg:hidden backdrop-blur-lg backdrop-brightness-85"
						style={{ maskImage: 'var(--mask-blur-mobile)' }}
					/>
					<div
						className="absolute inset-0 hidden lg:block backdrop-blur-lg backdrop-brightness-85"
						style={{ maskImage: 'var(--mask-blur-desktop)' }}
					/>
					{/* Test text overlay */}
					<div className="absolute inset-0 flex items-end justify-start lg:justify-start lg:items-center lg:px-40 lg:py-20 px-4 py-10">
						<div className="flex flex-col lg:gap-6 w-full gap-3">
							<div className="flex flex-col w-full lg:gap-3 gap-2">
								<Image
									unoptimized
									fill
									sizes="48px"
									src={`${AssetMap.Locations}/${iconPath}`}
									alt={name}
									className="rounded-full "
									wrapperClassName="rounded-full flex items-center aspect-square lg:size-14 size-12 lg:p-3 p-2 justify-center relative bg-white/8"
								/>
								<h2 className="text-muted-foreground lg:text-2xl text-lg">
									What's happening in
								</h2>
								<h1 className="text-3xl lg:text-6xl font-bold">{name}</h1>
								<div className="flex flex-col lg:gap-2 gap-2">
									<p className="text-lg">
										{continent}, {country}
									</p>
									<p className="lg:text-base items-center text-sm flex flex-row gap-1.5 text-muted-foreground">
										<Clock className="size-2.75" />
										GMT {dayjs().tz(timezone).format('Z')}
									</p>
								</div>
							</div>
							<hr className="border-white/25 lg:w-2/5 w-full" />
							<div className="flex flex-col lg:gap-3 gap-3">
								<p className="text-sm lg:text-base lg:w-2/5 w-full">
									{copy.location.view.description(name, country, continent)}
								</p>
								<Link href={Routes.Main.Locations.ViewBySlug(slug)} passHref>
									<Button variant="default">Subscribe</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}
			<div className="flex flex-col px-3 pt-6 lg:gap-8 lg:px-8 gap-4 lg:pt-8">
				<div className="flex flex-col gap-2 lg:gap-2">
					<div className="flex lg:flex-row flex-col items-start justify-between lg:gap-2 gap-2"></div>
					<div></div>
				</div>
			</div>
		</>
	)
}
