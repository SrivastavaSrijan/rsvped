#!/usr/bin/env tsx
/**
 * Seed Workflow
 *
 * Simple workflow runner with three commands:
 * 1. generate - Generate data using LLM
 * 2. process - Process the data for seeding
 * 3. seed - Save the data to database
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

const commands = {
	generate: {
		description: 'Generate data using LLM',
		script: 'npx tsx prisma/seed/generator.ts',
		check: () => existsSync('./prisma/.local/seed-data/batches'),
	},
	process: {
		description: 'Process the data for seeding',
		script: 'npx tsx prisma/seed/process.ts',
		check: () =>
			existsSync('./prisma/.local/seed-data/batches/communities-batch-1.json'),
	},
	seed: {
		description: 'Save the data to database',
		script: 'npx tsx prisma/seed/seed.ts',
		check: () => existsSync('./prisma/.local/seed-data/static/locations.json'),
	},
}

function runCommand(cmd: string): Promise<number> {
	return new Promise((resolve) => {
		console.log(`🚀 Running: ${cmd}`)
		const child = spawn('sh', ['-c', cmd], {
			stdio: 'inherit',
			cwd: process.cwd(),
		})

		child.on('close', (code) => {
			resolve(code || 0)
		})
	})
}

async function main() {
	const args = process.argv.slice(2)
	const command = args[0]

	if (!command || !commands[command as keyof typeof commands]) {
		console.log('📋 Available commands:')
		Object.entries(commands).forEach(([name, info]) => {
			const status = info.check() ? '✅' : '⚠️'
			console.log(`  ${status} ${name} - ${info.description}`)
		})
		console.log('\nUsage: yarn workflow <command>')
		console.log('Example: yarn workflow generate')
		process.exit(1)
	}

	const cmd = commands[command as keyof typeof commands]

	console.log(`\n${cmd.description}`)
	console.log('='.repeat(50))

	const exitCode = await runCommand(cmd.script)

	if (exitCode === 0) {
		console.log(`\n✅ ${command} completed successfully!`)

		// Show next steps
		if (command === 'generate') {
			console.log('💡 Next: yarn workflow process')
		} else if (command === 'process') {
			console.log('💡 Next: yarn workflow seed')
		} else if (command === 'seed') {
			console.log('🎉 Database seeded! Check your data.')
		}
	} else {
		console.log(`\n❌ ${command} failed with exit code ${exitCode}`)
		process.exit(exitCode)
	}
}

main().catch(console.error)
