export const pageEntrance = {
	hidden: { opacity: 0, y: 12 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.35, ease: 'easeOut' as const },
	},
}

export const sectionStagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.08 } },
}

export const sectionEntrance = {
	hidden: { opacity: 0, y: 8 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.3, ease: 'easeOut' as const },
	},
}

export const listStagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.05 } },
}

export const listItemEntrance = {
	hidden: { opacity: 0, y: 6 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.25, ease: 'easeOut' as const },
	},
}
