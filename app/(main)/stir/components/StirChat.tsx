'use client'

import { AssistantRuntimeProvider } from '@assistant-ui/react'
import {
	AssistantChatTransport,
	useChatRuntime,
} from '@assistant-ui/react-ai-sdk'
import { Thread } from '@/components/assistant-ui/thread'
import { StirToolUIs } from './tool-ui'

const transport = new AssistantChatTransport({ api: '/api/ai/stir' })

export const StirChat = () => {
	const runtime = useChatRuntime({ transport })

	return (
		<AssistantRuntimeProvider runtime={runtime}>
			<StirToolUIs />
			<Thread />
		</AssistantRuntimeProvider>
	)
}
