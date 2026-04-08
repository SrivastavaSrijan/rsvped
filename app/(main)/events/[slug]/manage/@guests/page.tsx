import type { RsvpStatus } from '@prisma/client'
import { ManageGuests } from '@/app/(main)/events/components'
import { getAPI } from '@/server/api'

export default async function GuestsSlot({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const sp = await searchParams
	const tab = typeof sp.tab === 'string' ? sp.tab : 'overview'
	if (tab !== 'guests') return null

	const { slug } = await params
	const guestStatus =
		typeof sp.guestStatus === 'string' ? sp.guestStatus : undefined
	const guestSearch =
		typeof sp.guestSearch === 'string' ? sp.guestSearch : undefined
	const page = typeof sp.page === 'string' ? Number(sp.page) : 1

	const api = await getAPI()
	const result = await api.rsvp.byEvent.list({
		slug,
		status: guestStatus as RsvpStatus | undefined,
		search: guestSearch,
		page,
		size: 20,
	})

	return (
		<ManageGuests
			guests={result.data}
			pagination={result.pagination}
			currentStatus={guestStatus}
			currentSearch={guestSearch}
		/>
	)
}
