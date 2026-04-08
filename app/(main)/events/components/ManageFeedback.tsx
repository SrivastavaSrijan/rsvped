import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { MessageSquare, Star } from 'lucide-react'
import { AvatarWithFallback } from '@/components/ui'
import type { RouterOutput } from '@/server/api/root'

dayjs.extend(relativeTime)

type FeedbackItem = RouterOutput['event']['get']['feedback'][number]

interface ManageFeedbackProps {
	feedback: FeedbackItem[]
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const

const StarRating = ({ rating }: { rating: number }) => (
	<div className="flex gap-0.5">
		{STAR_VALUES.map((star) => (
			<Star
				key={`star-${star}`}
				className={`size-3.5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
			/>
		))}
	</div>
)

const RatingBar = ({
	stars,
	count,
	total,
}: {
	stars: number
	count: number
	total: number
}) => {
	const percentage = total > 0 ? (count / total) * 100 : 0
	return (
		<div className="flex items-center gap-2">
			<span className="w-3 text-right text-muted-foreground text-xs">
				{stars}
			</span>
			<Star className="size-3 fill-amber-400 text-amber-400" />
			<div className="h-2 flex-1 overflow-hidden rounded-full bg-faint-white">
				<div
					className="h-full rounded-full bg-amber-400 transition-all"
					style={{ width: `${percentage}%` }}
				/>
			</div>
			<span className="w-6 text-right text-muted-foreground text-xs">
				{count}
			</span>
		</div>
	)
}

export const ManageFeedback = ({ feedback }: ManageFeedbackProps) => {
	if (feedback.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-faint-white p-12 text-center">
				<MessageSquare className="size-8 text-muted-foreground" />
				<div className="flex flex-col gap-1">
					<p className="font-medium">No feedback yet</p>
					<p className="text-muted-foreground text-sm">
						Feedback will appear once attendees rate your event
					</p>
				</div>
			</div>
		)
	}

	const ratedFeedback = feedback.filter((f) => f.rating !== null)
	const avgRating =
		ratedFeedback.length > 0
			? ratedFeedback.reduce((sum, f) => sum + (f.rating ?? 0), 0) /
				ratedFeedback.length
			: 0

	const distribution = [5, 4, 3, 2, 1].map((stars) => ({
		stars,
		count: ratedFeedback.filter((f) => f.rating === stars).length,
	}))

	return (
		<div className="flex flex-col gap-4 lg:gap-5">
			{/* Summary */}
			<div className="flex flex-col gap-4 rounded-xl bg-faint-white p-4 lg:flex-row lg:gap-8 lg:p-5">
				<div className="flex flex-col items-center gap-1">
					<p className="font-bold text-4xl">{avgRating.toFixed(1)}</p>
					<StarRating rating={Math.round(avgRating)} />
					<p className="text-muted-foreground text-xs">
						{ratedFeedback.length}{' '}
						{ratedFeedback.length === 1 ? 'rating' : 'ratings'}
					</p>
				</div>
				<div className="flex flex-1 flex-col gap-1.5">
					{distribution.map((d) => (
						<RatingBar
							key={d.stars}
							stars={d.stars}
							count={d.count}
							total={ratedFeedback.length}
						/>
					))}
				</div>
			</div>

			{/* Comments */}
			{feedback.some((f) => f.comment) ? (
				<div className="flex flex-col gap-3">
					<p className="font-medium text-sm">Comments</p>
					<div className="flex flex-col gap-2">
						{feedback
							.filter((f) => f.comment)
							.map((f) => (
								<div
									key={f.id}
									className="flex gap-3 rounded-xl bg-faint-white p-3 lg:p-4"
								>
									<AvatarWithFallback
										className="size-8"
										src={f.rsvp.user?.image}
										name={f.rsvp.user?.name ?? 'Anonymous'}
									/>
									<div className="flex flex-1 flex-col gap-1">
										<div className="flex items-center gap-2">
											<p className="font-medium text-sm">
												{f.rsvp.user?.name ?? 'Anonymous'}
											</p>
											{f.rating ? <StarRating rating={f.rating} /> : null}
											<span className="text-muted-foreground text-xs">
												{dayjs(f.createdAt).fromNow()}
											</span>
										</div>
										<p className="text-muted-foreground text-sm">{f.comment}</p>
									</div>
								</div>
							))}
					</div>
				</div>
			) : null}
		</div>
	)
}
