'use client'

import { ProgressProvider } from '@bprogress/next/app'
import { StirChatProvider } from '@/components/shared/StirChatProvider'

const Providers = ({ children }: { children: React.ReactNode }) => {
	return (
		<ProgressProvider
			height="4px"
			color="#fef4f9"
			delay={1000}
			options={{ showSpinner: false }}
		>
			<StirChatProvider>{children}</StirChatProvider>
		</ProgressProvider>
	)
}

export default Providers
