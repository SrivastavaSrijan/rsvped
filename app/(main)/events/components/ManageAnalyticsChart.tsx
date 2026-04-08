'use client'

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

interface DailyStat {
	date: Date
	views: number
	rsvps: number
}

interface ManageAnalyticsChartProps {
	dailyStats: DailyStat[]
}

const formatDate = (date: string) => {
	const d = new Date(date)
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const CustomTooltip = ({
	active,
	payload,
	label,
}: {
	active?: boolean
	payload?: Array<{ value: number; name: string; color: string }>
	label?: string
}) => {
	if (!active || !payload?.length || !label) return null
	return (
		<div className="rounded-lg bg-popover p-3 shadow-md">
			<p className="mb-1 font-medium text-foreground text-xs">
				{formatDate(label)}
			</p>
			{payload.map((entry) => (
				<p key={entry.name} className="text-xs" style={{ color: entry.color }}>
					{entry.name}: {entry.value}
				</p>
			))}
		</div>
	)
}

export const ManageAnalyticsChart = ({
	dailyStats,
}: ManageAnalyticsChartProps) => {
	const data = dailyStats.map((stat) => ({
		date: new Date(stat.date).toISOString(),
		Views: stat.views,
		RSVPs: stat.rsvps,
	}))

	return (
		<div className="flex flex-col gap-3 rounded-xl bg-faint-white p-4 lg:p-5">
			<p className="font-medium text-sm">Daily Trends</p>
			<div className="h-64 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={data}
						margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
					>
						<defs>
							<linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-chart-1)"
									stopOpacity={0.3}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-chart-1)"
									stopOpacity={0}
								/>
							</linearGradient>
							<linearGradient id="rsvpsFill" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-chart-2)"
									stopOpacity={0.3}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-chart-2)"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
						<XAxis
							dataKey="date"
							tickFormatter={formatDate}
							tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
							tickLine={false}
							axisLine={false}
							interval="preserveStartEnd"
						/>
						<YAxis
							tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
							tickLine={false}
							axisLine={false}
							allowDecimals={false}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Area
							type="monotone"
							dataKey="Views"
							stroke="var(--color-chart-1)"
							strokeWidth={2}
							fill="url(#viewsFill)"
						/>
						<Area
							type="monotone"
							dataKey="RSVPs"
							stroke="var(--color-chart-2)"
							strokeWidth={2}
							fill="url(#rsvpsFill)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}
