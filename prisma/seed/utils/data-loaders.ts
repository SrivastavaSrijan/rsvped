/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { logger, processedDataSchema } from '../utils'
import { paths } from './config'
export function loadProcessedBatchData() {
	const operation = logger.startOperation('load_batch_data')

	try {
		// Load processed data (get latest by filename)
		const processedDir = `${paths.dataDir}/processed`

		if (!existsSync(processedDir)) {
			logger.warn('No processed directory found. Run: yarn workflow process')
			operation.complete({ loaded: false })
			return null
		}

		const processedFiles = readdirSync(processedDir)
			.filter((f) => f.endsWith('.json'))
			.sort()
			.reverse()

		const communitiesFile = processedFiles.find((f) =>
			f.startsWith('communities-final-')
		)
		const usersFile = processedFiles.find((f) => f.startsWith('users-final-'))
		const eventsFile = processedFiles.find((f) =>
			f.startsWith('events-distributed-')
		)

		if (!communitiesFile || !usersFile || !eventsFile) {
			logger.warn('Missing processed files. Run: yarn workflow process')
			operation.complete({ loaded: false })
			return null
		}

		logger.info('Loading processed batch files', {
			communities: communitiesFile,
			users: usersFile,
			events: eventsFile,
		})

		const venues = JSON.parse(
			readFileSync(`${paths.staticDir}/venues.json`, 'utf8')
		)
		const communitiesData = JSON.parse(
			readFileSync(`${processedDir}/${communitiesFile}`, 'utf8')
		)
		const usersData = JSON.parse(
			readFileSync(`${processedDir}/${usersFile}`, 'utf8')
		)
		const eventsData = JSON.parse(
			readFileSync(`${processedDir}/${eventsFile}`, 'utf8')
		)

		const result = {
			venues: processedDataSchema.pick({ venues: true }).parse({ venues }),
			communities: processedDataSchema
				.pick({ communities: true })
				.parse(communitiesData)?.communities,
			users: processedDataSchema.pick({ users: true }).parse(usersData)?.users,
			eventsByCity: processedDataSchema
				.pick({ eventsByCity: true })
				.parse(eventsData)?.eventsByCity,
			metadata: {
				communities: communitiesData.metadata,
				users: usersData.metadata,
				events: eventsData.metadata,
			},
		}

		operation.complete({
			loaded: true,
			communities: result.communities.length,
			users: result.users.length,
			totalEvents: Object.values(result.eventsByCity).reduce(
				(sum: any, events: any) => sum + events.length,
				0
			),
		})

		return result
	} catch (error) {
		operation.fail(error)
		logger.error('Failed to load batch data. Run: yarn workflow process')
		return null
	}
}
