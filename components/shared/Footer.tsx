import Link from 'next/link'
import { Routes } from '@/lib/config'
import { copy } from '../../app/(static)/copy'

export const Footer = () => {
	return (
		<footer className="mx-auto mt-auto w-full max-w-page lg:py-16 py-4">
			<div className="border-border border-t flex items-end px-2 py-4 lg:py-4 lg:px-4">
				<div className="flex items-end space-x-2 justify-end lg:space-x-6 w-full">
					<Link
						href={Routes.Main.Events.Discover}
						className="text-muted-foreground text-xs lg:text-sm"
					>
						{copy.footer.discover}
					</Link>
					<Link
						href={Routes.Static.Terms}
						className="text-muted-foreground text-xs lg:text-sm"
					>
						{copy.footer.terms}
					</Link>
					<Link
						href={Routes.Static.Privacy}
						className="text-muted-foreground text-xs lg:text-sm"
					>
						{copy.footer.privacy}
					</Link>
				</div>
			</div>
		</footer>
	)
}
