'use client'

import { motion } from 'motion/react'
import { sectionEntrance } from './motion'

interface AnimatedSectionProps {
	children: React.ReactNode
	className?: string
}

export const AnimatedSection = ({
	children,
	className,
}: AnimatedSectionProps) => (
	<motion.div
		variants={sectionEntrance}
		initial="hidden"
		animate="visible"
		className={className}
	>
		{children}
	</motion.div>
)
