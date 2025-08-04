import { FallbackImage } from '@/components/ui'
import { AssetMap } from '@/lib/config/assets'

export const Background = () => {
	return (
		<div className="absolute inset-0">
			<FallbackImage
				src={AssetMap.Background}
				alt="Background pattern"
				fill
				className="object-cover"
				priority
			/>
		</div>
	)
}
