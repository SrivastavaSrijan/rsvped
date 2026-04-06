#!/usr/bin/env tsx
/**
 * Seed Workflow
 *
 * Single entry point for the seed pipeline:
 * 1. generate - Generate data using LLM (or faker fallback)
 * 2. process - Process and distribute data for seeding
 * 3. seed - Write data to database with checkpoint/resume
 * 4. all - Run the full pipeline (generate → process → seed)
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

const commands = {
	generate: {
		description: 'Generate data using LLM (or faker)',
		script: 'npx tsx prisma/seed/generator.ts',
		check: () => existsSync('./prisma/.local/seed-data/batches'),
	},
	process: {
		description: 'Process and distribute data for seeding',
		script: 'npx tsx prisma/seed/process.ts',
		check: () =>
			existsSync('./prisma/.local/seed-data/batches/communities-batch-1.json'),
	},
	seed: {
		description: 'Write data to database (supports resume)',
		script: 'npx tsx prisma/seed/seed.ts',
		check: () => existsSync('./prisma/.local/seed-data/static/locations.json'),
	},
	all: {
		description: 'Run full pipeline: generate → process → seed',
		script: '',
		check: () => true,
	},
}

function runCommand(cmd: string): Promise<number> {
	return new Promise((resolve) => {
		console.log(`Running: ${cmd}`)
		const child = spawn('sh', ['-c', cmd], {
			stdio: 'inherit',
			cwd: process.cwd(),
		})

		child.on('close', (code) => {
			resolve(code ?? 0)
		})
	})
}

async function runAll(): Promise<number> {
	for (const step of ['generate', 'process', 'seed'] as const) {
		const cmd = commands[step]
		console.log(`\n--- ${step}: ${cmd.description} ---`)
		const code = await runCommand(cmd.script)
		if (code !== 0) {
			console.log(`\n${step} failed with exit code ${code}`)
			return code
		}
		console.log(`${step} completed successfully`)
	}
	return 0
}

async function main() {
	const args = process.argv.slice(2)
	const command = args[0]

	if (!command || !commands[command as keyof typeof commands]) {
		console.log('Available commands:')
		for (const [name, info] of Object.entries(commands)) {
			const status = info.check() ? '[ready]' : '[pending]'
			console.log(`  ${status} ${name} - ${info.description}`)
		}
		console.log('\nUsage: yarn workflow <command>')
		console.log('Example: yarn workflow all')
		process.exit(1)
	}

	if (command === 'all') {
		const exitCode = await runAll()
		if (exitCode === 0) {
			console.log('\nFull pipeline completed successfully!')
		}
		process.exit(exitCode)
	}

	const cmd = commands[command as keyof typeof commands]
	console.log(`\n${cmd.description}`)
	console.log('='.repeat(50))

	const exitCode = await runCommand(cmd.script)

	if (exitCode === 0) {
		console.log(`\n${command} completed successfully!`)

		if (command === 'generate') {
			console.log('Next: yarn workflow process')
		} else if (command === 'process') {
			console.log('Next: yarn workflow seed')
		} else if (command === 'seed') {
			console.log('Database seeded! Check your data.')
		}
	} else {
		console.log(`\n${command} failed with exit code ${exitCode}`)
		process.exit(exitCode)
	}
}

main().catch(console.error)
