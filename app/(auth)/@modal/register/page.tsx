'use server'
import { CookieNames } from '@/lib/config'
import { getEncryptedCookie } from '@/lib/cookies'

import { AuthFormData } from '@/server/actions'
import { AuthModal } from '../../components/AuthModal'

export default async function RegisterModal() {
  const prefill = await getEncryptedCookie<Partial<AuthFormData>>(CookieNames.PrefillForm)
  return <AuthModal mode="register" prefill={prefill ?? undefined} />
}
