import { Skeleton } from '@/components/ui'

/** Overview tab — matches ManageEventCard grid layout */
export const ManageOverviewSkeleton = () => (
	<div className="flex flex-col gap-4 lg:gap-5">
		<div className="grid grid-cols-12 gap-4 lg:gap-5">
			{/* Cover image placeholder */}
			<div className="col-span-full flex flex-col gap-3 lg:col-span-5">
				<Skeleton className="aspect-square w-full rounded-xl" />
				<div className="flex gap-1.5">
					<Skeleton className="h-5 w-16 rounded-full" />
					<Skeleton className="h-5 w-20 rounded-full" />
				</div>
			</div>

			{/* Info column */}
			<div className="col-span-full flex flex-col gap-3 lg:col-span-7 lg:gap-4">
				{/* Date section */}
				<div className="flex flex-col gap-2">
					<Skeleton className="h-4 w-24" />
					<hr className="border-muted-foreground/20" />
					<Skeleton className="h-5 w-48" />
				</div>
				{/* Location section */}
				<div className="flex flex-col gap-2">
					<Skeleton className="h-4 w-20" />
					<hr className="border-muted-foreground/20" />
					<Skeleton className="h-5 w-56" />
				</div>
				{/* Stats section */}
				<div className="flex flex-col gap-2">
					<Skeleton className="h-4 w-24" />
					<hr className="border-muted-foreground/20" />
					<div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
						{['rsvp', 'views', 'checkins', 'paid'].map((id) => (
							<Skeleton key={id} className="h-14 rounded-xl" />
						))}
					</div>
				</div>
			</div>
		</div>

		{/* Description */}
		<div className="flex flex-col gap-2">
			<Skeleton className="h-4 w-28" />
			<hr className="border-muted-foreground/20" />
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-2/3" />
		</div>

		{/* Action buttons */}
		<div className="flex gap-2">
			<Skeleton className="h-9 flex-1 rounded-md" />
			<Skeleton className="h-9 flex-1 rounded-md" />
			<Skeleton className="h-9 flex-1 rounded-md" />
		</div>
	</div>
)

/** Guests tab — matches ManageGuests filter bar + list */
export const ManageGuestsSkeleton = () => (
	<div className="flex flex-col gap-4">
		{/* Filters */}
		<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
			<Skeleton className="h-9 w-72 rounded-lg" />
			<Skeleton className="h-9 w-64 rounded-md" />
		</div>
		<Skeleton className="h-3 w-20" />
		{/* Guest list */}
		<div className="flex flex-col gap-2">
			{['g1', 'g2', 'g3', 'g4', 'g5'].map((id) => (
				<div
					key={id}
					className="flex items-center gap-3 rounded-xl bg-faint-white p-3 lg:p-4"
				>
					<Skeleton className="size-9 rounded-full" />
					<div className="flex flex-1 flex-col gap-1">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-44" />
					</div>
					<Skeleton className="h-5 w-20 rounded-full" />
				</div>
			))}
		</div>
	</div>
)

/** Insights tab — matches ManageInsights 3×2 metric grid + chart */
export const ManageInsightsSkeleton = () => (
	<div className="flex flex-col gap-4 lg:gap-5">
		<div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
			{['views', 'rsvps', 'paid', 'checkins', 'conversion', 'checkin-rate'].map(
				(id) => (
					<div
						key={id}
						className="flex flex-col gap-3 rounded-xl bg-faint-white p-4 lg:p-5"
					>
						<Skeleton className="size-8 rounded-lg" />
						<div className="flex flex-col gap-1">
							<Skeleton className="h-7 w-16" />
							<Skeleton className="h-3 w-24" />
						</div>
					</div>
				)
			)}
		</div>
		<div className="flex flex-col gap-3 rounded-xl bg-faint-white p-4 lg:p-5">
			<Skeleton className="h-4 w-28" />
			<Skeleton className="h-64 w-full rounded-lg" />
		</div>
	</div>
)

/** Team tab — matches ManageTeam host + collaborators layout */
export const ManageTeamSkeleton = () => (
	<div className="flex flex-col gap-3">
		{/* Host section */}
		<div className="flex flex-col gap-2">
			<Skeleton className="h-4 w-12" />
			<hr className="border-muted-foreground/20" />
			<div className="flex items-center gap-3 rounded-xl bg-faint-white p-3 lg:p-4">
				<Skeleton className="size-10 rounded-full" />
				<div className="flex flex-1 flex-col gap-1">
					<Skeleton className="h-4 w-28" />
					<Skeleton className="h-3 w-40" />
				</div>
				<Skeleton className="h-5 w-14 rounded-full" />
			</div>
		</div>
		{/* Collaborators section */}
		<div className="flex flex-col gap-2">
			<Skeleton className="h-4 w-32" />
			<hr className="border-muted-foreground/20" />
			{['c1', 'c2'].map((id) => (
				<div
					key={id}
					className="flex items-center gap-3 rounded-xl bg-faint-white p-3 lg:p-4"
				>
					<Skeleton className="size-10 rounded-full" />
					<div className="flex flex-1 flex-col gap-0.5">
						<Skeleton className="h-4 w-24" />
					</div>
					<Skeleton className="h-5 w-16 rounded-full" />
				</div>
			))}
		</div>
	</div>
)

/** Feedback tab — matches ManageFeedback summary + comments */
export const ManageFeedbackSkeleton = () => (
	<div className="flex flex-col gap-4 lg:gap-5">
		{/* Summary */}
		<div className="flex flex-col gap-4 rounded-xl bg-faint-white p-4 lg:flex-row lg:gap-8 lg:p-5">
			<div className="flex flex-col items-center gap-1">
				<Skeleton className="h-10 w-14" />
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-3 w-16" />
			</div>
			<div className="flex flex-1 flex-col gap-1.5">
				{['r5', 'r4', 'r3', 'r2', 'r1'].map((id) => (
					<div key={id} className="flex items-center gap-2">
						<Skeleton className="h-2 w-3" />
						<Skeleton className="h-2 flex-1 rounded-full" />
						<Skeleton className="h-2 w-6" />
					</div>
				))}
			</div>
		</div>
		{/* Comments */}
		<div className="flex flex-col gap-3">
			<Skeleton className="h-4 w-20" />
			<div className="flex flex-col gap-2">
				{['f1', 'f2', 'f3'].map((id) => (
					<div
						key={id}
						className="flex gap-3 rounded-xl bg-faint-white p-3 lg:p-4"
					>
						<Skeleton className="size-8 rounded-full" />
						<div className="flex flex-1 flex-col gap-1">
							<div className="flex items-center gap-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-3 w-16" />
							</div>
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-3 w-2/3" />
						</div>
					</div>
				))}
			</div>
		</div>
	</div>
)

/** Messages tab — matches ManageMessages threaded list */
export const ManageMessagesSkeleton = () => (
	<div className="flex flex-col gap-3">
		{['m1', 'm2', 'm3'].map((id) => (
			<div
				key={id}
				className="flex flex-col gap-3 rounded-xl bg-faint-white p-3 lg:p-4"
			>
				<div className="flex gap-3">
					<Skeleton className="size-8 rounded-full" />
					<div className="flex flex-1 flex-col gap-1">
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-3 w-16" />
						</div>
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-3/4" />
					</div>
				</div>
				{/* Reply skeleton */}
				<div className="ml-11 flex gap-3 border-l-2 border-border pl-2">
					<Skeleton className="size-6 rounded-full" />
					<div className="flex flex-1 flex-col gap-1">
						<Skeleton className="h-3 w-20" />
						<Skeleton className="h-3 w-2/3" />
					</div>
				</div>
			</div>
		))}
	</div>
)
