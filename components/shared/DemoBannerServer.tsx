import { auth } from '@/lib/auth'
import { DemoBanner } from './DemoBanner'

export const DemoBannerServer = async () => {
	const session = await auth()
	if (!session?.user?.isDemo) return null
	return <DemoBanner />
}
