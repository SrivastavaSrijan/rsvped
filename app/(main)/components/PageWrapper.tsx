'use client'

import { useParams, usePathname } from 'next/navigation'
import { type CSSProperties, useEffect, useState } from 'react'
import { getStylesForRoute } from '@/lib/config/pageStyles'

export function PageWrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const params = useParams()
	const [styles, setStyles] = useState<{
		background?: CSSProperties
		pseudoElement?: CSSProperties
	}>({})
	const [isLoaded, setIsLoaded] = useState(false)

	useEffect(() => {
		const matchingStyles = getStylesForRoute(pathname, params)

		setStyles({
			background: matchingStyles.background ? matchingStyles.background() : {},
			pseudoElement: matchingStyles.pseudoElement ? matchingStyles.pseudoElement() : {},
		})

		setIsLoaded(true)
	}, [pathname, params])

	return (
		<div
			className={`min-h-screen w-full transition-colors duration-500 ease-in-out ${
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
