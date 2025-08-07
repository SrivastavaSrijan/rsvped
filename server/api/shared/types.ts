import type { z } from 'zod'
import type { PaginationSchema } from './schemas'

export type PaginationInput = z.infer<typeof PaginationSchema>
