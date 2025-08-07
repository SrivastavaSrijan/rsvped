import { z } from 'zod'

export const PaginationSchema = z.object({
	page: z.number().int().min(1).default(1),
	size: z.number().int().min(1).max(100).default(5),
})
