import Link from 'next/link'
import { Button, Image } from '@/components/ui'
import { auth } from '@/lib/auth'
import { Routes } from '@/lib/config'
import { copy } from '../copy'
import { DemoButton } from './DemoButton'
import { HeroVideo } from './HeroVideo'

export const Hero = async () => {
	const session = await auth()
	const isLoggedIn = !!session?.user

	return (
		<section className="container mx-auto w-full max-w-extra-wide-page">
			<div className="grid grid-cols-1 items-center gap-8 py-4 lg:grid-cols-3 lg:gap-16 lg:py-12">
				{/* Text Column */}
				<div className="flex flex-col items-center gap-3 text-center lg:col-span-1 lg:items-start lg:gap-4 lg:text-left">
					<div className="flex flex-col items-center gap-3 lg:items-start lg:gap-2">
						<Image
							src="/logo-full.png"
							alt="Logo"
							fill
							className="object-cover opacity-50"
							wrapperClassName="relative h-[50px] w-[100px] lg:h-[75px] lg:w-[150px]"
							sizes={{ lg: '150px', sm: '100px' }}
						/>
						<div className="flex flex-col gap-1">
							<h1 className="font-bold font-serif text-4xl lg:text-6xl">
								{copy.hero.headline1}
							</h1>
							<h1 className="bg-clip-text font-bold font-serif text-4xl text-gradient-radial text-transparent lg:text-6xl">
								{copy.hero.headline2}
							</h1>
						</div>
					</div>
					<p className="px-2 text-lg text-muted-foreground leading-relaxed lg:text-xl">
						{copy.hero.description}
					</p>
					<div className="flex flex-col gap-2 sm:flex-row">
						<Link href={Routes.Main.Events.Discover}>
							<Button size="lg" className="lg:text-lg">
								{copy.hero.ctaExplore}
							</Button>
						</Link>
						{isLoggedIn ? (
							<Link href={Routes.Main.Events.Home}>
								<Button size="lg" variant="outline" className="lg:text-lg">
									Go to Events
								</Button>
							</Link>
						) : (
							<DemoButton label={copy.hero.ctaDemo} />
						)}
					</div>
				</div>

				{/* Image Column */}
				<div className="flex justify-center px-3 lg:col-span-2 lg:justify-end">
					<HeroVideo />
				</div>
			</div>
		</section>
	)
}
