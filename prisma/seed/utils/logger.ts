/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
/**
 * Enhanced logging utilities for seed operations
 *
 * Provides debug-level control to reduce noise while maintaining useful feedback
 */

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
	SILENT = 4,
}

class SeedLogger {
	private level: LogLevel = LogLevel.INFO
	private debugEnabled = false

	constructor() {
		// Check environment variables for debug control
		const debugEnv = process.env.SEED_DEBUG?.toLowerCase()
		this.debugEnabled = debugEnv === 'true' || debugEnv === '1'

		// Set log level from environment
		const levelEnv = process.env.SEED_LOG_LEVEL?.toUpperCase()
		if (levelEnv && levelEnv in LogLevel) {
			this.level = LogLevel[levelEnv as keyof typeof LogLevel]
		}
	}

	/**
	 * Enable/disable debug logging
	 */
	setDebug(enabled: boolean) {
		this.debugEnabled = enabled
		return this
	}

	/**
	 * Set minimum log level
	 */
	setLevel(level: LogLevel) {
		this.level = level
		return this
	}

	/**
	 * Check if a log level should be output
	 */
	private shouldLog(level: LogLevel): boolean {
		return level >= this.level
	}

	/**
	 * Debug-level logs (only when debug enabled)
	 */
	debug(message: string, ...args: any[]) {
		if (this.debugEnabled && this.shouldLog(LogLevel.DEBUG)) {
			console.log(`🔍 ${message}`, ...(args.length ? args : []))
		}
	}

	/**
	 * Info-level logs (general progress)
	 */
	info(message: string, ...args: any[]) {
		if (this.shouldLog(LogLevel.INFO)) {
			console.log(`ℹ️  ${message}`, ...(args.length ? args : []))
		}
	}

	/**
	 * Success logs (important milestones)
	 */
	success(message: string, ...args: any[]) {
		if (this.shouldLog(LogLevel.INFO)) {
			console.log(`✅ ${message}`, ...(args.length ? args : []))
		}
	}

	/**
	 * Warning logs (recoverable issues)
	 */
	warn(message: string, ...args: any[]) {
		if (this.shouldLog(LogLevel.WARN)) {
			console.warn(`⚠️  ${message}`, ...(args.length ? args : []))
		}
	}

	/**
	 * Error logs (critical issues)
	 */
	error(message: string, ...args: any[]) {
		if (this.shouldLog(LogLevel.ERROR)) {
			console.error(`❌ ${message}`, ...(args.length ? args : []))
		}
	}

	/**
	 * Progress indicator for loops/batches
	 */
	progress(current: number, total: number, context: string) {
		if (this.shouldLog(LogLevel.INFO) && total > 1) {
			const percentage = Math.round((current / total) * 100)
			console.log(`📈 ${context}: ${current}/${total} (${percentage}%)`)
		}
	}

	/**
	 * Start a timed operation
	 */
	time(label: string) {
		if (this.shouldLog(LogLevel.INFO)) {
			console.time(`⏱️  ${label}`)
		}
	}

	/**
	 * End a timed operation
	 */
	timeEnd(label: string) {
		if (this.shouldLog(LogLevel.INFO)) {
			console.timeEnd(`⏱️  ${label}`)
		}
	}

	/**
	 * Log data statistics
	 */
	stats(stats: Record<string, number | string>, context?: string) {
		if (!this.shouldLog(LogLevel.INFO)) return

		const prefix = context ? `📊 ${context}:` : '📊 Stats:'
		console.log(prefix)

		for (const [key, value] of Object.entries(stats)) {
			console.log(`   ${key}: ${value}`)
		}
	}

	/**
	 * Conditional debug logging for specific operations
	 */
	debugIf(condition: boolean, message: string, ...args: any[]) {
		if (condition) {
			this.debug(message, ...(args.length ? args : []))
		}
	}

	/**
	 * Group related log messages
	 */
	group(title: string) {
		if (this.shouldLog(LogLevel.INFO)) {
			console.group(`📁 ${title}`)
		}
	}

	/**
	 * End grouped log messages
	 */
	groupEnd() {
		if (this.shouldLog(LogLevel.INFO)) {
			console.groupEnd()
		}
	}

	// Operation tracking
	startOperation(operation: string, details?: unknown) {
		const startTime = Date.now()
		this.info(`Starting ${operation}`, details, operation)
		return {
			operation,
			startTime,
			complete: (result?: unknown) => {
				const duration = Date.now() - startTime
				this.info(`Completed ${operation} in ${duration}ms`, result, operation)
			},
			fail: (error: unknown) => {
				const duration = Date.now() - startTime
				this.error(`Failed ${operation} after ${duration}ms`, error, operation)
			},
		}
	}
}

// Export singleton instance
export const logger = new SeedLogger()

export const timeOperation = async <T>(
	label: string,
	operation: () => Promise<T>
): Promise<T> => {
	logger.time(label)
	try {
		const result = await operation()
		logger.timeEnd(label)
		return result
	} catch (error) {
		logger.timeEnd(label)
		throw error
	}
}
