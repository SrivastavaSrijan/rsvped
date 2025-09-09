'use client'

import { useSearchParams } from 'next/navigation'

export function StirSlotSwitch({
	events,
	communities,
}: {
	events: React.ReactNode
	communities: React.ReactNode
}) {
	const params = useSearchParams()
	const type = (params.get('type') as 'events' | 'communities') ?? 'events'
	return (
		<>
			{type === 'events' ? (
				<div className="contents">{events}</div>
			) : (
				<div className="contents">{communities}</div>
			)}
		</>
	)
}
