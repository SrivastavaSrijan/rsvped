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
		const footer = document.querySelector('footer')
		if (footer) footer.style.display = 'none'
		return () => {
			document.body.style.overflow = ''
			document.documentElement.style.overflow = ''
			if (footer) footer.style.display = ''
		}
	}, [])

	return (
		<AssistantRuntimeProvider runtime={runtime}>
			<StirToolUIs />
			<Thread />
		</AssistantRuntimeProvider>
	)
}
