'use client'
import { Check, Loader2, Ticket } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Form } from '@/components/shared'
import {
	Badge,
	InputWithError,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui'
import { Button } from '@/components/ui/button'
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
	createRsvpAction,
	RsvpActionErrorCodeMap,
	type RsvpActionResponse,
	type RsvpFormData,
} from '@/server/actions'
import type { RouterOutput } from '@/server/api'
import { copy } from '../copy'

const initalState: RsvpActionResponse = {
	success: false,
	fieldErrors: {},
}

type EventRegisterData = RouterOutput['event']['get']

interface EventRegisterModalProps extends EventRegisterData {
	prefill?: Partial<RsvpFormData>
}

export const EventRegisterModal = ({
	prefill: propPrefill,
	ticketTiers,
	id,
	metadata,
}: EventRegisterModalProps) => {
	const { replace } = useRouter()
	const { slug } = useParams()

	const prefill = propPrefill || {
		name: metadata?.user?.name || '',
		email: metadata?.user?.email || '',
	}

	const {
		state,
		formAction,
		isPending: isFormPending,
		errorComponent: rsvpError,
	} = useActionStateWithError({
		action: createRsvpAction,
		initialState: initalState,
		errorCodeMap: RsvpActionErrorCodeMap,
		displayMode: 'inline',
	})

	const handleClose = (open: boolean) => {
		if (!open && slug && typeof slug === 'string') {
			replace(Routes.Main.Events.ViewBySlug(slug))
		}
	}

	if (state.success || metadata?.user?.rsvp) {
		return (
			<Dialog open onOpenChange={handleClose}>
				<DialogContent>
					<DialogHeader className="text-center items-center">
						<div className="mb-3 flex aspect-square h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-500 p-2">
							<Check />
						</div>
						<DialogTitle>You're In!</DialogTitle>
						<DialogDescription>
							You have successfully registered for this event. A confirmation has been sent to your
							email.
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		)
	}

	return (
		<Dialog open onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader className="text-left">
					<DialogTitle>Register for Event</DialogTitle>
					<DialogDescription>{copy.register.description}</DialogDescription>
					{rsvpError}
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<Form action={formAction} className="flex flex-col gap-3 lg:gap-3">
						<input type="hidden" name="eventId" value={id} />
						<InputWithError
							error={state.fieldErrors?.name}
							name="name"
							type="text"
							placeholder="Your Name"
							defaultValue={prefill?.name}
							required
						/>
						<InputWithError
							error={state.fieldErrors?.email}
							name="email"
							type="email"
							placeholder="Your Email"
							defaultValue={prefill?.email}
							required
						/>
						<Select name="ticketTierId">
							<SelectTrigger className="w-full">
								<SelectValue placeholder={copy.placeholders.ticket} />
							</SelectTrigger>
							<SelectContent>
								{ticketTiers.map(
									({ name, id, priceCents, quantitySold = 0, quantityTotal = 1, currency }) => (
										<SelectItem key={id} value={id}>
											{name} -{' '}
											{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
												priceCents / 100
											)}
											<Badge
												className="ml-2"
												variant={
													(quantitySold / (quantityTotal ?? 1)) * 100 > 100 ? 'default' : 'outline'
												}
											>
												{(quantitySold / (quantityTotal ?? 1)) * 100}% Sold
											</Badge>
										</SelectItem>
									)
								)}
							</SelectContent>
						</Select>
						<Button
							type="submit"
							disabled={isFormPending}
							className="flex items-center justify-center gap-1.5"
						>
							{isFormPending ? (
								<Loader2 className="size-3 animate-spin" />
							) : (
								<Ticket className="size-3" />
							)}
							Register
						</Button>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	)
}
