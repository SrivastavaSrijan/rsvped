import type { Metadata } from 'next'
import { Averia_Serif_Libre, Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Providers from './providers'

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
})

const averia = Averia_Serif_Libre({
	subsets: ['latin'],
	weight: ['400', '700'],
	variable: '--font-averia',
})

export const metadata: Metadata = {
	title: "Delightful Events Start Here · RSVP'd",
	description:
		"RSVP'd is an event management platform that makes organizing and attending events a breeze.",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className="dark">
			<meta name="apple-mobile-web-app-title" content="RSVP'd" />
			<meta name="og:image" content="/preview.jpg" />
			<body
				className={`${inter.variable} ${averia.variable} font-sans antialiased`}
			>
				<Providers>
					{children}
					<Toaster />
				</Providers>
			</body>
		</html>
	)
}
