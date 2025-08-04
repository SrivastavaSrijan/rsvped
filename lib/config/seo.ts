import type { Metadata } from 'next'

const baseUrl =
	process.env.NEXT_PUBLIC_BASE_URL ||
	(process.env.NEXT_PUBLIC_VERCEL_URL
		? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
		: 'http://localhost:3000')

export const siteConfig = {
	name: "RSVP'd",
	description:
		"RSVP'd is an event management platform that makes organizing and attending events a breeze.",
	url: baseUrl,
	ogImage: '/preview.jpg',
}

export const baseMetadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: `Delightful Events Start Here · ${siteConfig.name}`,
		template: `%s · ${siteConfig.name}`,
	},
	description: siteConfig.description,
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: siteConfig.url,
		title: `Delightful Events Start Here · ${siteConfig.name}`,
		description: siteConfig.description,
		siteName: siteConfig.name,
		images: [
			{
				url: siteConfig.ogImage,
				width: 1200,
				height: 630,
				alt: siteConfig.name,
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
	},
	icons: {
		icon: '/favicon.ico',
		apple: '/apple-icon.png',
	},
	manifest: '/manifest.json',
	appleWebApp: {
		title: siteConfig.name,
	},
}

export const siteSchema = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: siteConfig.name,
	url: siteConfig.url,
	potentialAction: {
		'@type': 'SearchAction',
		target: `${siteConfig.url}/search?q={search_term_string}`,
		'query-input': 'required name=search_term_string',
	},
}
