import { GitGraph, LogIn, Users } from 'lucide-react'

interface StatsProps {
	rsvpCount: number
	viewCount: number
	checkInCount: number
}

export const Stats = ({ rsvpCount, viewCount, checkInCount }: StatsProps) => {
	return (
		<div className="flex w-fit gap-1 divide-x divide-white/20 rounded-full bg-white/10 px-2 py-1 text-sm lg:gap-2 lg:px-3 lg:py-2">
			<div className="flex items-center gap-1 pr-2">
				<Users className="size-3" />
				<span className="text-xs">{rsvpCount || '-'} RSVPs</span>
			</div>
			<div className="flex items-center gap-1 px-2">
				<GitGraph className="size-3" />
				<span className="text-xs">{viewCount || '-'} Views</span>
			</div>
			<div className="flex items-center gap-1 pl-2">
				<LogIn className="size-3" />
				<span className="text-xs">{checkInCount || '-'} Check-Ins</span>
			</div>
		</div>
	)
}
