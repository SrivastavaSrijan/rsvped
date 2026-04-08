'use client'

import { AssistantRuntimeProvider } from '@assistant-ui/react'
import {
	AssistantChatTransport,
	useChatRuntime,
} from '@assistant-ui/react-ai-sdk'
import { useEffect } from 'react'
import { Thread } from '@/components/assistant-ui/thread'
import { StirToolUIs } from './tool-ui'

const transport = new AssistantChatTransport({ api: '/api/ai/stir' })

export const StirChat = () => {
	const runtime = useChatRuntime({ transport })

	useEffect(() => {
		document.body.style.overflow = 'hidden'
		document.documentElement.style.overflow = 'hidden'

		const container = document.querySelector(
			'[data-stir-container]'
		) as HTMLElement | null
		const nav = document.querySelector('nav')
		const footer = document.querySelector('footer')

		const updateHeight = () => {
			if (!container) return
			const navH = nav?.offsetHeight ?? 0
			const footerH = footer?.offsetHeight ?? 0
			const viewportH = window.visualViewport?.height ?? window.innerHeight
			container.style.height = `${viewportH - navH - footerH}px`
		}

		updateHeight()

		const viewport = window.visualViewport
		if (viewport) {
			viewport.addEventListener('resize', updateHeight)
			viewport.addEventListener('scroll', updateHeight)
		}
		window.addEventListener('resize', updateHeight)

		return () => {
			document.body.style.overflow = ''
			document.documentElement.style.overflow = ''
			if (container) container.style.height = ''
			if (viewport) {
				viewport.removeEventListener('resize', updateHeight)
				viewport.removeEventListener('scroll', updateHeight)
			}
			window.removeEventListener('resize', updateHeight)
		}
	}, [])

	return (
		<AssistantRuntimeProvider runtime={runtime}>
			<StirToolUIs />
			<Thread />
		</AssistantRuntimeProvider>
	)
}
