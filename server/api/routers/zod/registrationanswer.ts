import * as z from 'zod'
import {
	type CompleteRegistrationQuestion,
	type CompleteRsvp,
	RelatedRegistrationQuestionModel,
	RelatedRsvpModel,
} from './index'

export const RegistrationAnswerModel = z.object({
	id: z.string(),
	rsvpId: z.string(),
	questionId: z.string(),
	value: z.string(),
})

export interface CompleteRegistrationAnswer extends z.infer<typeof RegistrationAnswerModel> {
	rsvp: CompleteRsvp
	question: CompleteRegistrationQuestion
}

/**
 * RelatedRegistrationAnswerModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRegistrationAnswerModel: z.ZodSchema<CompleteRegistrationAnswer> = z.lazy(() =>
	RegistrationAnswerModel.extend({
		rsvp: RelatedRsvpModel,
		question: RelatedRegistrationQuestionModel,
	})
)
