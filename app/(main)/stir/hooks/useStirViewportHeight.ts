'use client'

import { type RefObject, useEffect } from 'react'

export const useStirViewportHeight = (
	containerRef: RefObject<HTMLElement | null>,
	enabled: boolean
) => {
	useEffect(() => {
		const el = containerRef.current
		if (!el) return

		if (!enabled) {
			el.style.removeProperty('--dvh')
			return
		}

		const vv = window.visualViewport
		if (!vv) return

		let rafId = 0
		let stableHeight = vv.height
		const update = () => {
			cancelAnimationFrame(rafId)
			rafId = requestAnimationFrame(() => {
				const nextHeight = vv.height
				const isKeyboardResize = nextHeight < stableHeight * 0.82

				if (!isKeyboardResize) {
					stableHeight = Math.max(stableHeight, nextHeight)
					el.style.setProperty('--dvh', `${nextHeight}px`)
					return
				}

				// Keep the layout stable while the keyboard is open on iOS Safari.
				el.style.setProperty('--dvh', `${stableHeight}px`)
			})
		}

		update()
		vv.addEventListener('resize', update)
		return () => {
			cancelAnimationFrame(rafId)
			vv.removeEventListener('resize', update)
		}
	}, [containerRef, enabled])
}
