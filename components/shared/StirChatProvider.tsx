'use client'

import type { AssistantRuntime } from '@assistant-ui/core'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import {
	AssistantChatTransport,
	useChatRuntime,
} from '@assistant-ui/react-ai-sdk'
import type { UIMessage } from 'ai'
import { createContext, use, useRef } from 'react'

const STORAGE_KEY = 'stir-messages'

const transport = new AssistantChatTransport({ api: '/api/ai/stir' })

interface StirChatContextValue {
	runtime: AssistantRuntime
	clearChat: () => void
}

const StirChatContext = createContext<StirChatContextValue | null>(null)

const loadMessages = (): UIMessage[] => {
	if (typeof window === 'undefined') return []
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		return stored ? (JSON.parse(stored) as UIMessage[]) : []
	} catch {
		return []
	}
}

const saveMessages = (messages: UIMessage[]) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
	} catch {
		// localStorage full or unavailable — silently fail
	}
}

export const StirChatProvider = ({
	children,
}: {
	children: React.ReactNode
}) => {
	const initialMessages = useRef(loadMessages())

	const runtime = useChatRuntime({
		transport,
		messages: initialMessages.current,
		onFinish: ({ messages }) => {
			saveMessages(messages)
		},
	})

	const clearChat = () => {
		localStorage.removeItem(STORAGE_KEY)
		// Reload the page to reset the runtime state cleanly
		window.location.reload()
	}

	return (
		<StirChatContext value={{ runtime, clearChat }}>
			<AssistantRuntimeProvider runtime={runtime}>
				{children}
			</AssistantRuntimeProvider>
		</StirChatContext>
	)
}

export const useStirChatContext = () => {
	const context = use(StirChatContext)
	if (!context) {
		throw new Error('useStirChatContext must be used within a StirChatProvider')
	}
	return context
}
