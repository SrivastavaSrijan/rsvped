'use server'

import { TRPCError } from '@trpc/server'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { CacheTags } from '@/lib/config'
import { getAPI } from '@/server/api'
import { MembershipErrorCodes, type ServerActionResponse } from './types'

const membershipSchema = z.object({
	communityId: z.string(),
	membershipTierId: z.string().optional().nullable(),
})

export type MembershipFormData = z.infer<typeof membershipSchema>
export type MembershipActionResponse = ServerActionResponse<
	never,
	MembershipErrorCodes,
	MembershipFormData
>

export async function subscribeToCommunityAction(
	_prevState: MembershipActionResponse,
	formData: FormData
): Promise<MembershipActionResponse> {
	const rawData = Object.fromEntries(formData)

	const validation = membershipSchema.safeParse(rawData)

	if (!validation.success) {
		return {
			success: false,
			error: MembershipErrorCodes.VALIDATION_ERROR,
			fieldErrors: validation.error.flatten().fieldErrors,
		}
	}

	try {
		const api = await getAPI()
		await api.community.subscribe(validation.data)
		revalidateTag(CacheTags.Community.Get(validation.data.communityId))
		revalidateTag(CacheTags.Community.List)
		return { success: true }
	} catch (error) {
		if (error instanceof TRPCError && error.message === 'ALREADY_MEMBER') {
			return {
				success: false,
				error: MembershipErrorCodes.ALREADY_MEMBER,
			}
		}
		return {
			success: false,
			error: MembershipErrorCodes.UNEXPECTED_ERROR,
		}
	}
}
