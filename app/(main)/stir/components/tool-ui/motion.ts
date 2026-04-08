export const toolCardVariants = {
	hidden: { opacity: 0, y: 8, scale: 0.985 },
	visible: (index: number) => ({
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.24,
			ease: 'easeOut' as const,
			delay: Math.min(index * 0.04, 0.2),
		},
	}),
	exit: {
		opacity: 0,
		y: -4,
		scale: 0.985,
		transition: { duration: 0.16, ease: 'easeInOut' as const },
	},
}

export const toolListVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.05 },
	},
}
