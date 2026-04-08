'use client'

import { Thread } from '@/components/assistant-ui/thread'
import { StirToolUIs } from './tool-ui'

export const StirChat = () => {
	return (
		<>
			<StirToolUIs />
			<Thread />
		</>
	)
}
