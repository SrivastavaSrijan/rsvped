import { Suspense } from 'react'
import { RedirectTimeout, RedirectTimeoutProps } from '@/components/shared'
import { CookieNames } from '@/lib/config'
import { getEncryptedCookie } from '@/lib/cookies'

export default async function HoldOnPage() {
  const data = await getEncryptedCookie<RedirectTimeoutProps>(CookieNames.RedirectTimeoutProps)
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Suspense fallback={null}>{data && <RedirectTimeout {...data} />}</Suspense>
    </div>
  )
}
