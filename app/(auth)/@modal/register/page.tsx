'use server'
import { Suspense } from 'react'
import { CookieNames } from '@/lib/config'
import { getEncryptedCookie } from '@/lib/cookies'
import type { AuthFormData } from '@/server/actions'
import { AuthModal } from '../../components/AuthModal'

export default async function RegisterModal() {
	const prefill = await getEncryptedCookie<Partial<AuthFormData>>(
		CookieNames.PrefillForm
	)
	return (
		<Suspense fallback={null}>
			<AuthModal mode="register" prefill={prefill ?? undefined} />
		</Suspense>
	)
}
