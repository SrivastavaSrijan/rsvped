'use client'

import { ProgressProvider } from '@bprogress/next/app'
import { TRPCProvider } from '@/lib/trpc'

const Providers = ({ children }: { children: React.ReactNode }) => {
	return (
		<TRPCProvider>
			<ProgressProvider height="4px" color="#fef4f9" delay={1000}>
				{children}
			</ProgressProvider>
		</TRPCProvider>
	)
}

export default Providers
