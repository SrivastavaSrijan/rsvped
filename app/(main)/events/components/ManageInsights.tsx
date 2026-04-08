import { CreditCard, Eye, LogIn, TrendingUp, Users } from 'lucide-react'

interface ManageInsightsProps {
	rsvpCount: number
	viewCount: number
	checkInCount: number
	paidRsvpCount: number
}

interface MetricCardProps {
	label: string
	value: number | string
	icon: React.ComponentType<{ className?: string }>
	accent?: string
}

const MetricCard = ({ label, value, icon: Icon, accent }: MetricCardProps) => (
	<div className="flex flex-col gap-3 rounded-xl bg-faint-white p-4 lg:p-5">
		<div
			className={`flex size-8 items-center justify-center rounded-lg ${accent ?? 'bg-pale-white'}`}
		>
			<Icon className="size-4" />
		</div>
		<div className="flex flex-col gap-0.5">
			<p className="font-bold text-2xl lg:text-3xl">{value}</p>
			<p className="text-muted-foreground text-xs">{label}</p>
		</div>
	</div>
)

export const ManageInsights = ({
	rsvpCount,
	viewCount,
	checkInCount,
	paidRsvpCount,
}: ManageInsightsProps) => {
	const conversionRate =
		viewCount > 0 ? ((rsvpCount / viewCount) * 100).toFixed(1) : '0'
	const checkInRate =
		rsvpCount > 0 ? ((checkInCount / rsvpCount) * 100).toFixed(1) : '0'

	const hasData = viewCount > 0 || rsvpCount > 0

	if (!hasData) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-faint-white p-12 text-center">
				<Eye className="size-8 text-muted-foreground" />
				<div className="flex flex-col gap-1">
					<p className="font-medium">No data yet</p>
					<p className="text-muted-foreground text-sm">
						Insights will appear once your event gets views
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
			<MetricCard
				label="Total Views"
				value={viewCount}
				icon={Eye}
				accent="bg-pale-blue"
			/>
			<MetricCard
				label="RSVPs"
				value={rsvpCount}
				icon={Users}
				accent="bg-pale-green"
			/>
			<MetricCard
				label="Paid RSVPs"
				value={paidRsvpCount}
				icon={CreditCard}
				accent="bg-pale-purple"
			/>
			<MetricCard
				label="Check-ins"
				value={checkInCount}
				icon={LogIn}
				accent="bg-pale-orange"
			/>
			<MetricCard
				label="Conversion Rate"
				value={`${conversionRate}%`}
				icon={TrendingUp}
				accent="bg-pale-cranberry"
			/>
			<MetricCard
				label="Check-in Rate"
				value={`${checkInRate}%`}
				icon={TrendingUp}
				accent="bg-pale-yellow"
			/>
		</div>
	)
}
