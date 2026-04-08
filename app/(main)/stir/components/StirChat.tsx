'use client'

import { useEffect } from 'react'
import { Thread } from '@/components/assistant-ui/thread'
import { StirToolUIs } from './tool-ui'

export const StirChat = () => {
	useEffect(() => {
		document.body.style.overflow = 'hidden'
		document.documentElement.style.overflow = 'hidden'
		const footer = document.querySelector('footer')
		if (footer) footer.style.display = 'none'
		return () => {
			document.body.style.overflow = ''
			document.documentElement.style.overflow = ''
			if (footer) footer.style.display = ''
		}
	}, [])

	return (
		<>
			<StirToolUIs />
			<Thread />
		</>
	)
}
