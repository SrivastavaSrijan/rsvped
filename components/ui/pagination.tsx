import {
	ChevronLeftIcon,
	ChevronRightIcon,
	MoreHorizontalIcon,
} from 'lucide-react'
import Link from 'next/link'
import type * as React from 'react'
import { type Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
	return (
		<nav
			aria-label="pagination"
			data-slot="pagination"
			className={cn('mx-auto flex w-full justify-center', className)}
			{...props}
		/>
	)
}

function PaginationContent({
	className,
	...props
}: React.ComponentProps<'ul'>) {
	return (
		<ul
			data-slot="pagination-content"
			className={cn('flex flex-row items-center gap-1', className)}
			{...props}
		/>
	)
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
	return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
	isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
	React.ComponentProps<'a'>

function PaginationLink({
	className,
	isActive,
	children,
	href,
	size = 'icon',
	...props
}: PaginationLinkProps) {
	return (
		<Link
			aria-current={isActive ? 'page' : undefined}
			data-slot="pagination-link"
			data-active={isActive}
			className={cn(
				buttonVariants({
					variant: isActive ? 'outline' : 'ghost',
					size,
				}),
				className
			)}
			href={href ?? '#'}
			{...props}
		>
			{children ?? '-'}
		</Link>
	)
}

function PaginationPrevious({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Go to previous page"
			size="default"
			className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
			{...props}
		>
			<ChevronLeftIcon />
			<span className="hidden sm:block">Previous</span>
		</PaginationLink>
	)
}

function PaginationNext({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Go to next page"
			size="default"
			className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
			{...props}
		>
			<span className="hidden sm:block">Next</span>
			<ChevronRightIcon />
		</PaginationLink>
	)
}

function PaginationEllipsis({
	className,
	...props
}: React.ComponentProps<'span'>) {
	return (
		<span
			aria-hidden
			data-slot="pagination-ellipsis"
			className={cn('flex size-9 items-center justify-center', className)}
			{...props}
		>
			<MoreHorizontalIcon className="size-4" />
			<span className="sr-only">More pages</span>
		</span>
	)
}

export {
	Pagination,
	PaginationContent,
	PaginationLink,
	PaginationItem,
	PaginationPrevious,
	PaginationNext,
	PaginationEllipsis,
}
