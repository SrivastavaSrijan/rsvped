'use client'

import { Check, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { copy } from '@/app/(main)/copy'
import { Form } from '@/components/shared'
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Routes } from '@/lib/config'
import { useActionStateWithError } from '@/lib/hooks'
import {
	MembershipActionErrorCodeMap,
	type MembershipActionResponse,
	subscribeToCommunityAction,
} from '@/server/actions'
import type { RouterOutput } from '@/server/api'

const initialState: MembershipActionResponse = {
	success: false,
	fieldErrors: {},
}

type CommunitySubscribeData = RouterOutput['community']['get']['enhanced']

export const CommunitySubscribeModal = ({
	id,
	name,
	membershipTiers,
}: CommunitySubscribeData) => {
	const { replace } = useRouter()
	const { slug } = useParams()

	const { state, formAction, isPending, errorComponent } =
		useActionStateWithError({
			action: subscribeToCommunityAction,
			initialState,
			errorCodeMap: MembershipActionErrorCodeMap,
			displayMode: 'inline',
		})

	const handleClose = (open: boolean) => {
		if (!open && slug && typeof slug === 'string') {
			replace(Routes.Main.Communities.ViewBySlug(slug))
		}
	}

	if (state.success) {
		return (
			<Dialog open onOpenChange={handleClose}>
				<DialogContent>
					<DialogHeader className="items-center text-center">
						<div className="mb-3 flex aspect-square h-10 w-10 items-center justify-center rounded-full bg-green-500/20 p-2 text-green-500">
							<Check />
						</div>
						<DialogTitle>Subscribed!</DialogTitle>
						<DialogDescription>You have joined {name}.</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		)
	}

	return (
		<Dialog open onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader className="text-left">
					<DialogTitle>Subscribe to {name}</DialogTitle>
					<DialogDescription>{copy.subscribe.description}</DialogDescription>
					{errorComponent}
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<Form action={formAction} className="flex flex-col gap-3">
						<input type="hidden" name="communityId" value={id} />
						<div className="flex flex-col gap-3">
							{(membershipTiers ?? []).map(
								({
									id: tierId,
									name: tierName,
									description: tierDescription,
									priceCents,
									currency,
								}) => (
									<label key={tierId} className="cursor-pointer">
										<input
											type="radio"
											name="membershipTierId"
											value={tierId}
											className="peer sr-only"
										/>
										<Card className="peer-checked:border-primary peer-checked:border peer-checked:bg-primary/5 peer-checked:shadow-md transition-all duration-200">
											<CardHeader className="relative">
												<div className="absolute right-4 top-4 hidden peer-checked:block">
													<Check className="size-4 text-primary" />
												</div>
												<CardTitle className="text-base pr-8">
													{tierName}
												</CardTitle>
												<CardDescription>
													{priceCents
														? new Intl.NumberFormat('en-US', {
																style: 'currency',
																currency: currency ?? 'USD',
															}).format(priceCents / 100)
														: 'Free'}
												</CardDescription>
											</CardHeader>
											{tierDescription && (
												<CardContent>
													<p className="text-sm text-muted-foreground">
														{tierDescription}
													</p>
												</CardContent>
											)}
										</Card>
									</label>
								)
							)}
						</div>
						<Button
							type="submit"
							disabled={isPending}
							className="flex items-center justify-center gap-1.5"
						>
							{isPending && <Loader2 className="size-3 animate-spin" />}
							Subscribe
						</Button>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	)
}
