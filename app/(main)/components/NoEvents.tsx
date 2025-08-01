import Image from 'next/image'
import Link from 'next/link'
import type { PropsWithChildren } from 'react'
import { Button } from '@/components/ui'
import { AssetMap, Routes } from '@/lib/config'

interface NoEventsProps extends PropsWithChildren {}
export const NoEvents = ({ children }: NoEventsProps) => {
	return (
		<div className="flex h-[90vw] w-full flex-col items-center justify-center gap-4 lg:h-[50vw]">
			<Image
				src={AssetMap.NoEvents}
				alt="No events"
				width={200}
				height={200}
				className="mb-4"
			/>
			<p className="text-muted-foreground text-sm">{children}</p>
			<Link href={Routes.Main.Events.Create} passHref>
				<Button variant="outline">Create Event</Button>
			</Link>
		</div>
	)
}
