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

interface EventsPaginationProps {
	currentPage: number
	totalPages?: number
	hasMore?: boolean
}

export function EventsPagination({
	currentPage,
	totalPages,
	hasMore = true,
}: EventsPaginationProps) {
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()
	const [isPending, startTransition] = useTransition()

	const handlePageChange = (page: number) => {
		startTransition(() => {
			const params = new URLSearchParams(searchParams)
			params.set('page', page.toString())
			router.push(`${pathname}?${params.toString()}`)
		})
	}

	const showPrevious = currentPage > 1
	const showNext = hasMore || (totalPages && currentPage < totalPages)

	return (
		<Pagination className="sticky bottom-0 z-10 w-full bg-black/10 p-1.5 backdrop-blur-sm lg:p-2">
			<PaginationContent className="gap-2 lg:gap-3">
				<PaginationItem>
					<PaginationPrevious
						size="sm"
						onClick={
							showPrevious ? () => handlePageChange(currentPage - 1) : undefined
						}
						className={
							!showPrevious || isPending
								? 'pointer-events-none opacity-50'
								: 'cursor-pointer'
						}
					/>
				</PaginationItem>

				<PaginationItem>
					<PaginationLink
						onClick={() => handlePageChange(1)}
						isActive={currentPage === 1}
						className={
							isPending ? 'pointer-events-none opacity-50' : 'cursor-pointer'
						}
					>
						1
					</PaginationLink>
				</PaginationItem>

				{currentPage > 3 && (
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
				)}

				{currentPage > 2 && (
					<PaginationItem>
						<PaginationLink
							onClick={() => handlePageChange(currentPage - 1)}
							className={
								isPending ? 'pointer-events-none opacity-50' : 'cursor-pointer'
							}
						>
							{currentPage - 1}
						</PaginationLink>
					</PaginationItem>
				)}

				{currentPage > 1 && (
					<PaginationItem>
						<PaginationLink isActive>{currentPage}</PaginationLink>
					</PaginationItem>
				)}

				<PaginationItem>
					<PaginationNext
						size="sm"
						onClick={
							showNext ? () => handlePageChange(currentPage + 1) : undefined
						}
						className={
							!showNext || isPending
								? 'pointer-events-none opacity-50'
								: 'cursor-pointer'
						}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	)
}
