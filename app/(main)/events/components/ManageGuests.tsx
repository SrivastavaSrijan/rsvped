'use client'
import type { RsvpStatus } from '@prisma/client'
import {
	Check,
	ChevronLeft,
	ChevronRight,
	Mail,
	Search,
	TicketCheck,
	User,
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import {
	Badge,
	Button,
	Card,
	Input,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
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

	const handleStatusFilter = (status: string) => {
		startTransition(() => {
			const params = new URLSearchParams(searchParams)
			if (status === 'ALL') {
				params.delete('guestStatus')
			} else {
				params.set('guestStatus', status)
			}
			params.delete('guestPage')
			router.push(`${pathname}?${params.toString()}`)
		})
	}

	const handleSearch = (value: string) => {
		startTransition(() => {
			const params = new URLSearchParams(searchParams)
			if (value) {
				params.set('guestSearch', value)
			} else {
				params.delete('guestSearch')
			}
			params.delete('guestPage')
			router.push(`${pathname}?${params.toString()}`)
		})
	}

	const handlePageChange = (page: number) => {
		startTransition(() => {
			const params = new URLSearchParams(searchParams)
			params.set('guestPage', page.toString())
			router.push(`${pathname}?${params.toString()}`)
		})
	}

	if (guests.length === 0 && !currentStatus && !currentSearch) {
		return (
			<Card className="flex flex-col items-center justify-center gap-3 p-8 text-center">
				<User className="size-8 text-muted-foreground" />
				<div className="flex flex-col gap-1">
					<p className="font-medium text-sm">No guests yet</p>
					<p className="text-muted-foreground text-xs">
						Share your event to get RSVPs
					</p>
				</div>
			</Card>
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

			{/* Guest Table */}
			<Card className="overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Guest</TableHead>
							<TableHead className="hidden lg:table-cell">Ticket</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="hidden lg:table-cell">Payment</TableHead>
							<TableHead className="hidden lg:table-cell">Checked In</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{guests.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="py-8 text-center text-muted-foreground"
								>
									No guests match your filters
								</TableCell>
							</TableRow>
						) : null}
						{guests.map((guest) => {
							const statusCfg = statusBadgeConfig[guest.status]
							return (
								<TableRow key={guest.id}>
									<TableCell>
										<div className="flex flex-col gap-0.5">
											<span className="font-medium text-sm">{guest.name}</span>
											<span className="flex items-center gap-1 text-muted-foreground text-xs">
												<Mail className="size-3" />
												{guest.email}
											</span>
										</div>
									</TableCell>
									<TableCell className="hidden lg:table-cell">
										{guest.ticketTier ? (
											<div className="flex items-center gap-1 text-sm">
												<TicketCheck className="size-3" />
												{guest.ticketTier.name}
											</div>
										) : (
											<span className="text-muted-foreground text-xs">
												Free
											</span>
										)}
									</TableCell>
									<TableCell>
										<Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
									</TableCell>
									<TableCell className="hidden lg:table-cell">
										<span className="text-sm capitalize">
											{guest.paymentState.toLowerCase()}
										</span>
									</TableCell>
									<TableCell className="hidden lg:table-cell">
										{guest.checkIn ? (
											<div className="flex items-center gap-1 text-success text-sm">
												<Check className="size-3" />
												Yes
											</div>
										) : (
											<span className="text-muted-foreground text-xs">No</span>
										)}
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</Card>

			{/* Pagination */}
			{pagination.totalPages > 1 ? (
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground text-xs">
						Page {pagination.page} of {pagination.totalPages} (
						{pagination.total} guests)
					</span>
					<div className="flex gap-1">
						<Button
							variant="outline"
							size="sm"
							disabled={!pagination.hasPrevious}
							onClick={() => handlePageChange(pagination.page - 1)}
						>
							<ChevronLeft className="size-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={!pagination.hasMore}
							onClick={() => handlePageChange(pagination.page + 1)}
						>
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			) : null}
		</div>
	)
}
