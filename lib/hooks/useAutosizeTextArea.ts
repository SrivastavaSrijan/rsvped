'use client'
import { type RefObject, useCallback, useEffect } from 'react'
import { useEventListener } from './useEventListener'

interface AutosizeTextAreaProps {
	padding?: number
}
/**
 * A hook that automatically adjusts the height of a textarea based on its content
 *
 * @param el - Reference to the textarea element
 * @param value - The current value of the textarea
 */
export const useAutosizeTextArea = (
	ref: RefObject<HTMLTextAreaElement | null>,
	{ padding = 0 }: AutosizeTextAreaProps = {
		padding: 0,
	}
) => {
	const adjustHeight = useCallback(() => {
		const el = ref.current
		if (!el) {
			return
		}

		// Reset height to get the correct scrollHeight
		el.style.height = '0px'

		// Always set the height to match the content
		el.style.height = `${el.scrollHeight + padding}px`
	}, [ref, padding])

	// Listen for window resize events
	useEventListener('resize', adjustHeight)

	// Adjust height when the component mounts or dependencies change
	useEffect(() => {
		adjustHeight()
	}, [adjustHeight])

	// Return the adjustHeight function so it can be called when the textarea content changes
	return { adjustHeight }
}
