import Link from 'next/link'
import { Button, Image } from '@/components/ui'
import { AssetMap } from '@/lib/config'

interface EmptyStateProps {
	message: string
	label?: string
	href?: string
}

export function EmptyState({ message, label, href }: EmptyStateProps) {
	return (
		<div className="flex w-full flex-col items-center justify-center gap-4 mt-[3vh]">
			<Image
				src={AssetMap.NoEvents}
				alt={'No events'}
				width={200}
				height={200}
				className="mb-4"
			/>
			<p className="text-muted-foreground text-sm">{message}</p>
			{label && href && (
				<Link href={href} passHref>
					<Button variant="outline">{label}</Button>
				</Link>
			)}
		</div>
	)
}
