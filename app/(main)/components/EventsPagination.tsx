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
  searchParams?: Record<string, string | undefined>
  basePath?: string
}

export function EventsPagination({
  currentPage,
  totalPages,
  hasMore = true,
  searchParams = {},
  basePath = '',
}: EventsPaginationProps) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams()

    // Add all search params except page
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value) {
        params.set(key, value)
      }
    })

    // Add the new page
    params.set('page', page.toString())

    return `${basePath}?${params.toString()}`
  }

  const showPrevious = currentPage > 1
  const showNext = hasMore || (totalPages && currentPage < totalPages)

  return (
    <Pagination className="sticky bottom-0 z-10 w-full bg-black/10 p-1.5 backdrop-blur-sm lg:p-2">
      <PaginationContent className="gap-2 lg:gap-3">
        <PaginationItem>
          <PaginationPrevious
            size="sm"
            href={showPrevious ? buildUrl(currentPage - 1) : undefined}
          />
        </PaginationItem>

        <PaginationItem>
          <PaginationLink href={buildUrl(1)} isActive={currentPage === 1}>
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
            <PaginationLink href={buildUrl(currentPage - 1)}>{currentPage - 1}</PaginationLink>
          </PaginationItem>
        )}

        {currentPage > 1 && (
          <PaginationItem>
            <PaginationLink href={buildUrl(currentPage)} isActive>
              {currentPage}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext size="sm" href={showNext ? buildUrl(currentPage + 1) : undefined} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
