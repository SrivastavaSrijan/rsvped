import type { Metadata } from 'next'
import { Suspense } from 'react'
import { RedirectTimeout, type RedirectTimeoutProps } from '@/components/shared'
import { CookieNames } from '@/lib/config'
import { getEncryptedCookie } from '@/lib/cookies'

export const metadata: Metadata = {
	title: "Hold On · RSVP'd",
	description: 'Please wait while we redirect you to the next page.',
}
export default async function HoldOnPage() {
	const data = await getEncryptedCookie<RedirectTimeoutProps>(CookieNames.RedirectTimeoutProps)
	return (
		<div className="flex h-full flex-col items-center justify-center gap-4">
			<Suspense fallback={null}>{data && <RedirectTimeout {...data} />}</Suspense>
		</div>
	)
}
