import { streamText } from 'ai'
import { z } from 'zod'
import { getModel, isAvailable } from '@/lib/ai'
import { auth } from '@/lib/auth'
import { Prompts } from '@/server/actions/ai/prompts'

const RequestSchema = z.object({
	text: z.string().min(1).max(10000),
	type: z.string().min(1).max(50),
	context: z
		.object({
			domain: z.string().optional(),
			page: z.string().optional(),
			field: z.string().optional(),
		})
		.optional(),
	customPrompt: z.string().max(500).optional(),
})

export async function POST(request: Request) {
	const contentType = request.headers.get('content-type')
	if (!contentType?.includes('application/json')) {
		return Response.json({ error: 'Invalid content type' }, { status: 415 })
	}

	if (!isAvailable()) {
		return Response.json({ error: 'AI not configured' }, { status: 503 })
	}

	const session = await auth()
	if (!session?.user) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 })
	}

	let body: z.infer<typeof RequestSchema>
	try {
		body = RequestSchema.parse(await request.json())
	} catch {
		return Response.json({ error: 'Invalid request body' }, { status: 400 })
	}

	const { text, type, context, customPrompt } = body

	const promptFn =
		Prompts.Enhancements[type as keyof typeof Prompts.Enhancements]
	if (!promptFn) {
		return Response.json({ error: 'Invalid enhancement type' }, { status: 400 })
	}

	const prompt =
		type === 'custom' && customPrompt
			? (promptFn as typeof Prompts.Enhancements.custom)(
					text,
					customPrompt,
					context
				)
			: (promptFn as typeof Prompts.Enhancements.concise)(text, context)

	const domain = context?.domain || 'content'
	const systemPrompt = Prompts.System.enhancement(domain)

	const result = streamText({
		model: getModel(),
		system: systemPrompt,
		prompt,
	})

	return result.toTextStreamResponse()
}
