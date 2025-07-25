'use client'
import { AlertCircle, Loader2, LogInIcon, Mail, Tickets } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Background, Form } from '@/components/shared'
import { Alert, AlertDescription, AlertTitle, InputWithError } from '@/components/ui'
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
	AuthActionErrorCodeMap,
	type AuthActionResponse,
	type AuthFormData,
	authAction,
	signInWithGoogle,
} from '@/server/actions'
import type { AuthErrorCodes } from '@/server/actions/types'
import { copy } from '../copy'

const initalState: AuthActionResponse = {
	success: false,
	fieldErrors: {},
}

interface AuthModalProps {
	prefill?: Partial<AuthFormData>
}

export const EventRegisterModal = ({ prefill }: AuthModalProps) => {
	const { push } = useRouter()
	const searchParams = useSearchParams()
	const { slug } = useParams()

	const {
		state,
		formAction,
		isPending: isFormPending,
		errorComponent: loginError,
	} = useActionStateWithError({
		action: authAction,
		initialState: initalState,
		errorCodeMap: AuthActionErrorCodeMap,
		displayMode: 'inline',
	})

	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open && slug && typeof slug === 'string') {
					push(Routes.Main.Events.ViewBySlug(slug))
				}
			}}
		>
			<DialogContent>
				<DialogHeader className="text-left">
					<div className="mb-3 flex aspect-square h-10 w-10 items-center justify-center rounded-full bg-white/50 p-2">
						<Tickets />
					</div>
					<DialogTitle>Your Info</DialogTitle>
					<DialogDescription>{copy.register.description}</DialogDescription>
					{loginError}
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<Form action={formAction} className="flex flex-col gap-3 lg:gap-3">
						<input type="hidden" name="next" value={searchParams.get('next') || ''} />
						<InputWithError
							error={state.fieldErrors?.password}
							name="password"
							type="password"
							placeholder={copy.placeholders.password}
							defaultValue={prefill?.password}
							required
						/>
						<InputWithError
							error={state.fieldErrors?.email}
							name="email"
							type="email"
							placeholder={copy.placeholders.email}
							defaultValue={prefill?.email}
							required
						/>

						<Button
							type="submit"
							disabled={isFormPending}
							className="flex items-center justify-center gap-1.5"
						>
							{isFormPending ? (
								<Loader2 className="size-3 animate-spin" />
							) : (
								<Mail className="size-3" />
							)}
							Register
						</Button>
					</Form>
					<hr />
				</div>
			</DialogContent>
		</Dialog>
	)
}
