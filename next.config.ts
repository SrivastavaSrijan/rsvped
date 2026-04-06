import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	experimental: {
		authInterrupts: true,
		useCache: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'api.dicebear.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'source.unsplash.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'picsum.photos',
				port: '',
				pathname: '/**',
			},
		],
	},
}

export default withSentryConfig(nextConfig, {
	// Suppresses source map upload logs during build
	silent: true,

	// Upload source maps for better stack traces
	org: process.env.SENTRY_ORG,
	project: process.env.SENTRY_PROJECT,

	// Disable source map upload when no DSN is set
	sourcemaps: {
		disable: !process.env.NEXT_PUBLIC_SENTRY_DSN,
	},

	// Tree-shake Sentry logger statements to reduce bundle size
	webpack: {
		treeshake: {
			removeDebugLogging: true,
		},
	},
})
