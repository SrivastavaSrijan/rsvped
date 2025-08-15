/**
 * Seed Logger
 *
 * Production-ready logging system with levels, formatting, and file output.
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { config, paths } from './config'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
	timestamp: string
	level: LogLevel
	message: string
	data?: unknown
	operation?: string
}

class SeedLogger {
	private logLevels: Record<LogLevel, number> = {
		debug: 0,
		info: 1,
		warn: 2,
		error: 3,
	}

	private currentLevel: number
	private logFile?: string
	private startTime: number = Date.now()

	constructor() {
		this.currentLevel = this.logLevels[config.LOG_LEVEL]
		this.initializeLogFile()
	}

	private initializeLogFile() {
		if (!existsSync(paths.logsDir)) {
			mkdirSync(paths.logsDir, { recursive: true })
		}

		const timestamp =
			new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] +
			'_' +
			new Date().toISOString().split('T')[1].substring(0, 8).replace(/:/g, '-')
		this.logFile = path.join(paths.logsDir, `seed-${timestamp}.log`)
	}

	private shouldLog(level: LogLevel): boolean {
		return this.logLevels[level] >= this.currentLevel
	}

	private formatMessage(
		level: LogLevel,
		message: string,
		data?: unknown
	): string {
		const emoji = {
			debug: '🔍',
			info: 'ℹ️',
			warn: '⚠️',
			error: '❌',
		}

		const timestamp = new Date().toISOString()
		const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2)

		let formatted = `${emoji[level]} [${elapsed}s] ${message}`

		if (data) {
			if (typeof data === 'object') {
				formatted += ` ${JSON.stringify(data, null, 2)}`
			} else {
				formatted += ` ${data}`
			}
		}

		return formatted
	}

	private writeLog(entry: LogEntry) {
		if (this.logFile) {
			try {
				const logLine = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}\n`
				writeFileSync(this.logFile, logLine, { flag: 'a' })
			} catch (error) {
				// Fallback to console if file write fails
				console.error('Failed to write to log file:', error)
			}
		}
	}

	debug(message: string, data?: unknown, operation?: string) {
		if (!this.shouldLog('debug')) return

		const formatted = this.formatMessage('debug', message, data)
		console.log(formatted)

		this.writeLog({
			timestamp: new Date().toISOString(),
			level: 'debug',
			message,
			data,
			operation,
		})
	}

	info(message: string, data?: unknown, operation?: string) {
		if (!this.shouldLog('info')) return

		const formatted = this.formatMessage('info', message, data)
		console.log(formatted)

		this.writeLog({
			timestamp: new Date().toISOString(),
			level: 'info',
			message,
			data,
			operation,
		})
	}

	warn(message: string, data?: unknown, operation?: string) {
		if (!this.shouldLog('warn')) return

		const formatted = this.formatMessage('warn', message, data)
		console.warn(formatted)

		this.writeLog({
			timestamp: new Date().toISOString(),
			level: 'warn',
			message,
			data,
			operation,
		})
	}

	error(message: string, error?: unknown, operation?: string) {
		if (!this.shouldLog('error')) return

		const formatted = this.formatMessage('error', message, error)
		console.error(formatted)

		this.writeLog({
			timestamp: new Date().toISOString(),
			level: 'error',
			message,
			data:
				error instanceof Error
					? { message: error.message, stack: error.stack }
					: error,
			operation,
		})
	}

	// Operation tracking
	startOperation(operation: string, details?: unknown) {
		this.info(`Starting ${operation}`, details, operation)
		return {
			operation,
			startTime: Date.now(),
			complete: (result?: unknown) => {
				const duration = Date.now() - Date.now()
				this.info(`Completed ${operation} in ${duration}ms`, result, operation)
			},
			fail: (error: unknown) => {
				const duration = Date.now() - Date.now()
				this.error(`Failed ${operation} after ${duration}ms`, error, operation)
			},
		}
	}

	// Performance metrics
	metrics(operation: string, metrics: Record<string, number | string>) {
		this.info(`Metrics for ${operation}`, metrics, operation)
	}
}

// Export singleton instance
export const logger = new SeedLogger()

// Type exports
export type { LogLevel, LogEntry }
