import { notFound } from 'next/navigation'
import { LocationModal } from '@/app/(main)/components'
import { CookieNames } from '@/lib/config'
import { getEncryptedCookie } from '@/lib/cookies'
import type { LocationFormData } from '@/server/actions'
import { getAPI } from '@/server/api'

export const experimental_ppr = false
export default async function LocationForm() {
	const api = await getAPI()
	const locations = await api.location.list()
	const prefill = await getEncryptedCookie<Partial<LocationFormData>>(
		CookieNames.PrefillLocation
	)

	if (!locations || Object.keys(locations).length === 0) {
		return notFound()
	}

	return <LocationModal locations={locations} prefill={prefill} />
}
