'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ActiveLinkProps {
	href: string
	icon: React.ReactNode
	children: React.ReactNode
}
export const ActiveLink = ({ href, icon, children }: ActiveLinkProps) => {
	const pathname = usePathname()
	return (
		<Link href={href} passHref>
			<Button
				size="sm"
				variant="link"
				className={cn('opacity-50 transition-colors hover:opacity-100', {
					'underline underline-offset-2 opacity-100': pathname === href,
				})}
			>
				{icon}
				<span className="hidden lg:block">{children}</span>
			</Button>
		</Link>
	)
}
