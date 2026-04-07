import { Averia_Serif_Libre, Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { DemoBannerServer } from '@/components/shared'
import { baseMetadata, siteSchema } from '@/lib/config'
import Providers from './providers'

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	display: 'swap',
})

const averia = Averia_Serif_Libre({
	subsets: ['latin'],
	weight: ['400', '700'],
	variable: '--font-averia',
	display: 'swap',
})

export const metadata = baseMetadata

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className="dark">
			<body
				className={`${inter.variable} ${averia.variable} font-sans antialiased`}
			>
				<Providers>
					<DemoBannerServer />
					{children}
					<Toaster />
				</Providers>
				<script
					type="application/ld+json"
					suppressHydrationWarning
					// biome-ignore lint/security/noDangerouslySetInnerHtml: adding structured data for SEO
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(siteSchema),
					}}
				/>
			</body>
		</html>
	)
}
