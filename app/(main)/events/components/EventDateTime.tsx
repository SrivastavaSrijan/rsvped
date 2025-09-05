import { getEventDateTime } from '@/lib/hooks'

interface EventDateTimeProps {
	startDate: string | Date
	endDate?: string | Date | null
}
export const EventDateTime = (params: EventDateTimeProps) => {
	const { startDate, endDate } = params
	const { start, range } = getEventDateTime({ start: startDate, end: endDate })

	return (
		<div className="flex items-center gap-3 text-base">
			<div className="text-center">
				<p className="rounded-tl-xl rounded-tr-xl bg-white/20 px-2 py-1 text-sm">
					{start.month}
				</p>
				<p className="rounded-br-xl rounded-bl-xl bg-white/30 px-2 py-1 text-sm">
					{start.dayOfMonth}
				</p>
			</div>
			<div className="flex flex-col gap-1">
				<p className="font-medium text-sm lg:text-base">{range.date}</p>
				<p className="text-muted-foreground text-sm">{range.time}</p>
			</div>
		</div>
	)
}
