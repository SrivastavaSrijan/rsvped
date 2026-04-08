'use client'
import type { RsvpStatus } from '@prisma/client'
import { Check, Mail, Search, TicketCheck, User } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { GenericPagination } from '@/app/(main)/components'
import {
	AvatarWithFallback,
	Badge,
	Input,
	Tabs,
	TabsList,
	TabsTrigger,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import type { PaginationMetadata } from '@/server/api/shared/types'

interface RsvpItem {
	id: string
	name: string | null
	email: string
	status: RsvpStatus
	paymentState: string
	createdAt: Date
	waitlistPosition: number | null
	user: { id: string; name: string | null; image: string | null } | null
	ticketTier: { name: string; priceCents: number } | null
	checkIn: { scannedAt: Date } | null
}

interface ManageGuestsProps {
	guests: RsvpItem[]
	pagination: PaginationMetadata
	currentStatus?: string
	currentSearch?: string
}

const statusBadgeConfig: Record<
	RsvpStatus,
	{ label: string; variant: 'success' | 'destructive' | 'secondary' }
> = {
	CONFIRMED: { label: 'Confirmed', variant: 'success' },
	CANCELLED: { label: 'Cancelled', variant: 'destructive' },
	WAITLIST: { label: 'Waitlist', variant: 'secondary' },
}

export const ManageGuests = ({
	guests,
	pagination,
	currentStatus,
	currentSearch,
}: ManageGuestsProps) => {
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()
	const [isPending, startTransition] = useTransition()

	const updateParams = (updates: Record<string, string | null>) => {
		startTransition(() => {
			const params = new URLSearchParams(searchParams)
			for (const [key, value] of Object.entries(updates)) {
				if (value === null) {
					params.delete(key)
				} else {
					params.set(key, value)
				}
			}
			router.push(`${pathname}?${params.toString()}`)
		})
	}

	const handleStatusFilter = (status: string) => {
		updateParams({
			guestStatus: status === 'ALL' ? null : status,
			page: null,
		})
	}

	const handleSearch = (value: string) => {
		updateParams({
			guestSearch: value || null,
			page: null,
		})
	}

	if (guests.length === 0 && !currentStatus && !currentSearch) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-faint-white p-12 text-center">
				<User className="size-6 text-muted-foreground" />
				<div className="flex flex-col gap-1">
					<p className="font-medium text-sm">No guests yet</p>
					<p className="text-muted-foreground text-xs">
						Share your event to get RSVPs
					</p>
				</div>
			</div>
		)
	}

	return (
		<div
			className={cn(
				'flex flex-col gap-4',
				isPending && 'pointer-events-none opacity-60'
			)}
		>
			{/* Filters */}
			<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
				<Tabs value={currentStatus ?? 'ALL'} onValueChange={handleStatusFilter}>
					<TabsList>
						<TabsTrigger value="ALL">All</TabsTrigger>
						<TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
						<TabsTrigger value="WAITLIST">Waitlist</TabsTrigger>
						<TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
					</TabsList>
				</Tabs>
				<div className="relative">
					<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search by name or email..."
						defaultValue={currentSearch ?? ''}
						onChange={(e) => handleSearch(e.target.value)}
						className="pl-9 lg:w-64"
					/>
				</div>
			</div>

			{/* Guest count */}
			<p className="text-muted-foreground text-xs">
				{pagination.total} guest{pagination.total !== 1 ? 's' : ''}
			</p>

			{/* Guest List */}
			<div className="flex flex-col gap-2">
				{guests.length === 0 ? (
					<div className="rounded-xl bg-faint-white p-8 text-center text-muted-foreground text-sm">
						No guests match your filters
					</div>
				) : null}
				{guests.map((guest) => {
					const statusCfg = statusBadgeConfig[guest.status]
					return (
						<div
							key={guest.id}
							className="flex items-center gap-3 rounded-xl bg-faint-white p-3 lg:p-4"
						>
							<AvatarWithFallback
								src={guest.user?.image}
								name={guest.name ?? guest.email}
								className="size-9"
							/>
							<div className="flex min-w-0 flex-1 flex-col gap-0.5">
								<span className="truncate font-medium text-sm">
									{guest.name ?? 'Guest'}
								</span>
								<span className="flex items-center gap-1 truncate text-muted-foreground text-xs">
									<Mail className="size-3 shrink-0" />
									{guest.email}
								</span>
							</div>
							<div className="flex shrink-0 items-center gap-2">
								{guest.ticketTier ? (
									<span className="hidden items-center gap-1 text-muted-foreground text-xs lg:flex">
										<TicketCheck className="size-3" />
										{guest.ticketTier.name}
									</span>
								) : null}
								{guest.checkIn ? (
									<Badge
										variant="outline"
										className="hidden gap-1 text-success lg:flex"
									>
										<Check className="size-3" />
										Checked in
									</Badge>
								) : null}
								<Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
							</div>
						</div>
					)
				})}
			</div>

			{/* Pagination */}
			<GenericPagination {...pagination} />
		</div>
	)
}
