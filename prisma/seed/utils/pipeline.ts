/**
 * Pipeline Runner — checkpoint/resume orchestration
 *
 * Tracks named stages with atomic state persistence.
 * Fresh run: wipeDb + reset state.
 * Resume: skip wipe + skip completed stages.
 */

import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { logger } from '../utils'
import { paths } from './config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StageStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface StageState {
	status: StageStatus
	startedAt?: string
	completedAt?: string
	error?: string
}

export interface PipelineState {
	version: 1
	mode: 'fresh' | 'resume'
	startedAt: string
	updatedAt: string
	stages: Record<string, StageState>
}

// ---------------------------------------------------------------------------
// Atomic state file I/O
// ---------------------------------------------------------------------------

function stateFilePath(): string {
	return paths.pipelineStateFile
}

function loadState(): PipelineState | null {
	const fp = stateFilePath()
	if (!existsSync(fp)) return null
	try {
		const raw = readFileSync(fp, 'utf8')
		return JSON.parse(raw) as PipelineState
	} catch {
		logger.warn('Corrupted pipeline state file, starting fresh')
		return null
	}
}

function saveState(state: PipelineState): void {
	const fp = stateFilePath()
	const dir = path.dirname(fp)
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true })
	}

	// Atomic write: temp file + rename
	const tmpPath = `${fp}.tmp.${Date.now()}`
	const content = JSON.stringify(state, null, 2)
	writeFileSync(tmpPath, content, 'utf8')
	renameSync(tmpPath, fp)
}

// ---------------------------------------------------------------------------
// Pipeline Runner
// ---------------------------------------------------------------------------

export type StageFn = () => Promise<void>

export class PipelineRunner {
	private state: PipelineState
	private isResume: boolean

	constructor() {
		const existing = loadState()

		if (existing && this.hasIncompleteWork(existing)) {
			logger.info('Resuming pipeline from previous state')
			this.state = {
				...existing,
				mode: 'resume',
				updatedAt: new Date().toISOString(),
			}
			this.isResume = true
		} else {
			logger.info('Starting fresh pipeline run')
			this.state = {
				version: 1,
				mode: 'fresh',
				startedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				stages: {},
			}
			this.isResume = false
		}
	}

	/**
	 * Whether this is a resume run (skip wipeDb).
	 */
	get shouldSkipWipe(): boolean {
		return this.isResume
	}

	/**
	 * Run a named stage. Skips if already completed on resume.
	 */
	async runStage(name: string, fn: StageFn): Promise<void> {
		const existing = this.state.stages[name]

		// Skip completed stages on resume
		if (existing?.status === 'completed') {
			logger.info(`Skipping completed stage: ${name}`)
			return
		}

		// Mark as running
		this.state.stages[name] = {
			status: 'running',
			startedAt: new Date().toISOString(),
		}
		this.persist()

		try {
			await fn()

			// Mark as completed
			this.state.stages[name] = {
				...this.state.stages[name],
				status: 'completed',
				completedAt: new Date().toISOString(),
			}
			this.persist()
			logger.success(`Stage completed: ${name}`)
		} catch (error) {
			// Mark as failed
			this.state.stages[name] = {
				...this.state.stages[name],
				status: 'failed',
				error: error instanceof Error ? error.message : String(error),
			}
			this.persist()
			throw error
		}
	}

	/**
	 * Reset pipeline state for a fresh run.
	 */
	reset(): void {
		this.state = {
			version: 1,
			mode: 'fresh',
			startedAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			stages: {},
		}
		this.isResume = false
		this.persist()
	}

	/**
	 * Get current state summary for logging.
	 */
	getSummary(): Record<string, StageStatus> {
		const summary: Record<string, StageStatus> = {}
		for (const [name, stage] of Object.entries(this.state.stages)) {
			summary[name] = stage.status
		}
		return summary
	}

	private hasIncompleteWork(state: PipelineState): boolean {
		const stages = Object.values(state.stages)
		// Resume if there are completed stages (meaning partial progress)
		// AND at least one stage is not completed
		const hasCompleted = stages.some((s) => s.status === 'completed')
		const hasIncomplete = stages.some(
			(s) =>
				s.status === 'running' ||
				s.status === 'failed' ||
				s.status === 'pending'
		)
		return hasCompleted && hasIncomplete
	}

	private persist(): void {
		this.state.updatedAt = new Date().toISOString()
		saveState(this.state)
	}
}
