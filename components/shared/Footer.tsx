import Image from 'next/image'
import Link from 'next/link'
import { Routes } from '@/lib/config'
import { copy } from '../../app/(static)/copy'

export const Footer = () => {
	return (
		<footer className="mx-auto mt-auto w-full max-w-page lg:py-16 py-4">
			<div className="container mx-auto px-2 py-2 lg:px-4 lg:py-2 ">
				<div className="border-border border-t px-2 py-2 lg:py-4 lg:px-4">
					<div className="flex lg:flex-row flex-col lg:items-center items-start justify-between lg:gap-2 gap-0 h-[72px] lg:h-[48px]">
						<div className="flex items-center space-x-2 h-full w-[72px] lg:w-[72px] relative">
							<Image
								src="/logo-full.png"
								alt="Logo"
								fill
								sizes="72px"
								className="opacity-75 object-contain"
							/>
						</div>

						<div className="flex items-center space-x-4 lg:space-x-6">
							<Link
								href={Routes.Static.WhatsNew}
								className="text-muted-foreground text-sm lg:text-sm"
							>
								{copy.footer.whatsNew}
							</Link>
							<Link
								href={Routes.Main.Events.Discover}
								className="text-muted-foreground text-sm lg:text-sm"
							>
								{copy.footer.discover}
							</Link>
							<Link
								href={Routes.Static.Pricing}
								className="text-muted-foreground text-sm lg:text-sm"
							>
								{copy.footer.pricing}
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}
