import { EventRole } from '@prisma/client'
import * as z from 'zod'
import {
	type CompleteEvent,
	type CompleteUser,
	RelatedEventModel,
	RelatedUserModel,
} from './index'

export const EventCollaboratorModel = z.object({
	id: z.string(),
	eventId: z.string(),
	userId: z.string(),
	role: z.nativeEnum(EventRole),
})

export interface CompleteEventCollaborator
	extends z.infer<typeof EventCollaboratorModel> {
	event: CompleteEvent
	user: CompleteUser
}

/**
 * RelatedEventCollaboratorModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEventCollaboratorModel: z.ZodSchema<CompleteEventCollaborator> =
	z.lazy(() =>
		EventCollaboratorModel.extend({
			event: RelatedEventModel,
			user: RelatedUserModel,
		})
	)
