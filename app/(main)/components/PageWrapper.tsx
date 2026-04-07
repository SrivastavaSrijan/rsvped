'use client'

import { motion } from 'motion/react'
import { useParams, usePathname } from 'next/navigation'
import { type CSSProperties, useEffect, useState } from 'react'
import { pageEntrance } from '@/components/shared/motion'
import { getStylesForRoute } from '@/lib/config'

export function PageWrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const params = useParams()
	const [styles, setStyles] = useState<{
		background?: CSSProperties
		pseudoElement?: CSSProperties
	}>({})

	useEffect(() => {
		const {
			pseudoElement,
			background,
			key = '',
		} = getStylesForRoute(pathname, params)
		const seed =
			key && typeof params[key] === 'string' ? params[key] : undefined
		setStyles({
			background: background ? background(seed) : {},
			pseudoElement: pseudoElement ? pseudoElement(seed) : {},
		})
	}, [pathname, params])

	return (
		<motion.div
			key={pathname}
			variants={pageEntrance}
			initial="hidden"
			animate="visible"
			className="min-h-screen w-full transition-colors duration-500 ease-in-out lg:pb-16 pb-4"
			style={styles.background}
		>
			<div
				className="fixed top-0 left-0 z-[-1] h-[200px] w-full transition-all duration-500 ease-in-out"
				style={styles.pseudoElement}
			/>
			{children}
		</motion.div>
	)
}
