import { ActivityType } from '@prisma/client'
import * as z from 'zod'
import { type CompleteUser, RelatedUserModel } from './index'

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
	z.union([
		literalSchema,
		z.array(jsonSchema),
		z.record(z.string(), jsonSchema),
	])
)

export const UserActivityModel = z.object({
	id: z.string(),
	userId: z.string(),
	type: z.nativeEnum(ActivityType),
	targetId: z.string(),
	targetType: z.string(),
	metadata: jsonSchema,
	createdAt: z.date(),
})

export interface CompleteUserActivity
	extends z.infer<typeof UserActivityModel> {
	user: CompleteUser
}

/**
 * RelatedUserActivityModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserActivityModel: z.ZodSchema<CompleteUserActivity> =
	z.lazy(() =>
		UserActivityModel.extend({
			user: RelatedUserModel,
		})
	)
