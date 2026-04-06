import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		globals: true,
		environment: 'node',
		include: ['__tests__/**/*.test.ts'],
		setupFiles: ['./vitest.setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json-summary'],
			include: ['server/**', 'prisma/seed/**', 'lib/**'],
			exclude: ['**/*.d.ts', '**/node_modules/**'],
		},
	},
})
