import { QuestionType } from '@prisma/client'
import * as z from 'zod'
import {
	type CompleteEvent,
	type CompleteRegistrationAnswer,
	RelatedEventModel,
	RelatedRegistrationAnswerModel,
} from './index'

export const RegistrationQuestionModel = z.object({
	id: z.string(),
	eventId: z.string(),
	type: z.nativeEnum(QuestionType),
	label: z.string(),
	required: z.boolean(),
	position: z.number().int(),
	options: z.string().array(),
})

export interface CompleteRegistrationQuestion extends z.infer<typeof RegistrationQuestionModel> {
	event: CompleteEvent
	answers: CompleteRegistrationAnswer[]
}

/**
 * RelatedRegistrationQuestionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRegistrationQuestionModel: z.ZodSchema<CompleteRegistrationQuestion> = z.lazy(
	() =>
		RegistrationQuestionModel.extend({
			event: RelatedEventModel,
			answers: RelatedRegistrationAnswerModel.array(),
		})
)
