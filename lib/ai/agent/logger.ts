/** Structured logging for Stir AI agent — server-side JSON logs. */

interface ToolCallLog {
	event: 'tool_call'
	timestamp: string
	toolName: string
	args: Record<string, unknown>
	durationMs: number
	resultCount?: number
	error?: string
}

interface StepCompleteLog {
	event: 'step_complete'
	timestamp: string
	stepIndex: number
	inputTokens: number
	outputTokens: number
	totalTokens: number
}

interface ConversationCompleteLog {
	event: 'conversation_complete'
	timestamp: string
	totalSteps: number
	totalTokens: number
	durationMs: number
	userId?: string
}

function emit(data: ToolCallLog | StepCompleteLog | ConversationCompleteLog) {
	console.log(`[stir-agent] ${JSON.stringify(data)}`)
}

export function logToolCall(log: Omit<ToolCallLog, 'event' | 'timestamp'>) {
	emit({ event: 'tool_call', timestamp: new Date().toISOString(), ...log })
}

export function logStepComplete(
	log: Omit<StepCompleteLog, 'event' | 'timestamp'>
) {
	emit({
		event: 'step_complete',
		timestamp: new Date().toISOString(),
		...log,
	})
}

export function logConversationComplete(
	log: Omit<ConversationCompleteLog, 'event' | 'timestamp'>
) {
	emit({
		event: 'conversation_complete',
		timestamp: new Date().toISOString(),
		...log,
	})
}
