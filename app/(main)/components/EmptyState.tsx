import Link from 'next/link'
import { Button, Image } from '@/components/ui'
import { AssetMap } from '@/lib/config'

interface EmptyStateProps {
	image?: string
	imageAlt?: string
	message: string
	actionLabel?: string
	actionHref?: string
}

export function EmptyState({
	image = AssetMap.NoEvents,
	imageAlt = 'No events',
	message,
	actionLabel,
	actionHref,
}: EmptyStateProps) {
	return (
		<div className="flex w-full flex-col items-center justify-center gap-4 mt-[3vh]">
			<Image
				src={image}
				alt={imageAlt}
				width={200}
				height={200}
				className="mb-4"
			/>
			<p className="text-muted-foreground text-sm">{message}</p>
			{actionLabel && actionHref && (
				<Link href={actionHref} passHref>
					<Button variant="outline">{actionLabel}</Button>
				</Link>
			)}
		</div>
	)
}
