import { Image } from '@/components/ui'
import { AssetMap } from '@/lib/config/assets'

export const Background = () => {
	return (
		<Image
			src={AssetMap.Background}
			alt="Background pattern"
			fill
			className="object-cover"
			priority
			wrapperClassName="absolute inset-0"
		/>
	)
}
