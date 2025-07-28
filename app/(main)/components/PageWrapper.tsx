'use client'

import { useParams, usePathname } from 'next/navigation'
import { type CSSProperties, useEffect, useState } from 'react'
import { getStylesForRoute } from '@/lib/config'

export function PageWrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const params = useParams()
	const [styles, setStyles] = useState<{
		background?: CSSProperties
		pseudoElement?: CSSProperties
	}>({})
	const [isLoaded, setIsLoaded] = useState(false)

	useEffect(() => {
		const { pseudoElement, background, key = '' } = getStylesForRoute(pathname, params)
		const seed = key && typeof params[key] === 'string' ? params[key] : undefined
		setStyles({
			background: background ? background(seed) : {},
			pseudoElement: pseudoElement ? pseudoElement(seed) : {},
		})

		setIsLoaded(true)
	}, [pathname, params])

	return (
		<div
			className={`min-h-screen w-full transition-colors duration-500 ease-in-out  lg:pb-16 pb-4 ${
				isLoaded ? 'opacity-100' : 'opacity-0'
			}`}
			style={styles.background}
		>
			<div
				className={`fixed top-0 left-0 z-[-1] h-[200px] w-full transition-all duration-500 ease-in-out ${
					isLoaded ? 'opacity-100' : 'opacity-0'
				}`}
				style={styles.pseudoElement}
			/>
			{children}
		</div>
	)
}
