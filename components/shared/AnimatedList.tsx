'use client'

import { motion } from 'motion/react'
import { listItemEntrance, listStagger } from './motion'

interface AnimatedListProps {
	children: React.ReactNode
	className?: string
}

export const AnimatedList = ({ children, className }: AnimatedListProps) => (
	<motion.div
		variants={listStagger}
		initial="hidden"
		animate="visible"
		className={className}
	>
		{children}
	</motion.div>
)

export const AnimatedListItem = ({
	children,
	className,
}: AnimatedListProps) => (
	<motion.div variants={listItemEntrance} className={className}>
		{children}
	</motion.div>
)
