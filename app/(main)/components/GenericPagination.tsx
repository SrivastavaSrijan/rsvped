'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui'
import type { PaginationMetadata } from '@/server/api'

interface GenericPaginationProps extends PaginationMetadata {
	className?: string
}

export function GenericPagination({
	page: currentPage,
	totalPages,
	hasMore,
	hasPrevious,
}: GenericPaginationProps) {
	const searchParams = useSearchParams()
	const pathname = usePathname()
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const navigate = (page: number) => {
		const params = new URLSearchParams(searchParams)
		params.set('page', page.toString())
		startTransition(() => {
			router.push(`${pathname}?${params.toString()}`)
		})
	}

	// Don't render if only one page
	if (totalPages <= 1) {
		return null
	}

	// Generate page numbers to show
	const getPageNumbers = () => {
		const pages: (number | 'ellipsis')[] = []

		if (totalPages <= 7) {
			// Show all pages if 7 or fewer
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i)
			}
		} else {
			// Always show first page
			pages.push(1)

			if (currentPage <= 4) {
				// Current page near start
				pages.push(2, 3, 4, 5, 'ellipsis', totalPages)
			} else if (currentPage >= totalPages - 3) {
				// Current page near end
				pages.push(
					'ellipsis',
					totalPages - 4,
					totalPages - 3,
					totalPages - 2,
					totalPages - 1,
					totalPages
				)
			} else {
				// Current page in middle
				pages.push(
					'ellipsis',
					currentPage - 1,
					currentPage,
					currentPage + 1,
					'ellipsis',
					totalPages
				)
			}
		}

		return pages
	}

	return (
		<Pagination className="sticky bottom-0 z-10 w-full bg-black/10 p-1.5 backdrop-blur-sm lg:p-2">
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						onClick={() => navigate(currentPage - 1)}
						className={
							!hasPrevious || isPending
								? 'pointer-events-none opacity-50'
								: 'cursor-pointer'
						}
					/>
				</PaginationItem>

				{getPageNumbers().map((page, index) => (
					<PaginationItem
						key={page === 'ellipsis' ? `ellipsis-${index}` : page}
					>
						{page === 'ellipsis' ? (
							<PaginationEllipsis />
						) : (
							<PaginationLink
								onClick={() => navigate(page)}
								isActive={page === currentPage}
								className={
									isPending
										? 'pointer-events-none opacity-50'
										: 'cursor-pointer'
								}
							>
								{page}
							</PaginationLink>
						)}
					</PaginationItem>
				))}

				<PaginationItem>
					<PaginationNext
						onClick={() => navigate(currentPage + 1)}
						className={
							!hasMore || isPending
								? 'pointer-events-none opacity-50'
								: 'cursor-pointer'
						}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	)
}
