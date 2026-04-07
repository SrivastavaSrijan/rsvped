'use client'

import { ProgressProvider } from '@bprogress/next/app'

const Providers = ({ children }: { children: React.ReactNode }) => {
	return (
		<ProgressProvider
			height="4px"
			color="#fef4f9"
			delay={1000}
			options={{ showSpinner: false }}
		>
			{children}
		</ProgressProvider>
	)
}

export default Providers
