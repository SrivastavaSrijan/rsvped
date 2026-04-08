import { CreditCard, Eye, LogIn, TrendingUp, Users } from 'lucide-react'
import { Card } from '@/components/ui'

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
}

const MetricCard = ({ label, value, icon: Icon }: MetricCardProps) => (
	<Card className="flex flex-col gap-2 p-4">
		<div className="flex items-center gap-2 text-muted-foreground">
			<Icon className="size-4" />
			<span className="text-xs">{label}</span>
		</div>
		<p className="font-bold text-2xl">{value}</p>
	</Card>
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
			<Card className="flex flex-col items-center justify-center gap-3 p-8 text-center">
				<Eye className="size-8 text-muted-foreground" />
				<div className="flex flex-col gap-1">
					<p className="font-medium text-sm">No data yet</p>
					<p className="text-muted-foreground text-xs">
						Insights will appear once your event gets views
					</p>
				</div>
			</Card>
		)
	}

	return (
		<div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
			<MetricCard label="Total Views" value={viewCount} icon={Eye} />
			<MetricCard label="RSVPs" value={rsvpCount} icon={Users} />
			<MetricCard label="Paid RSVPs" value={paidRsvpCount} icon={CreditCard} />
			<MetricCard label="Check-ins" value={checkInCount} icon={LogIn} />
			<MetricCard
				label="Conversion Rate"
				value={`${conversionRate}%`}
				icon={TrendingUp}
			/>
			<MetricCard
				label="Check-in Rate"
				value={`${checkInRate}%`}
				icon={TrendingUp}
			/>
		</div>
	)
}
