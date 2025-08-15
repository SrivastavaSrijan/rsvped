#!/usr/bin/env tsx
/**
 * Process Batch Data
 * 
 * Simple processor that takes batch files and ensures they're ready for seeding.
 * Creates event distribution to ensure 15+ events per city.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const DATA_DIR = './prisma/.local/seed-data'
const MIN_EVENTS_PER_CITY = 15

function getTimestamp(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
         now.toISOString().split('T')[1].substring(0, 8).replace(/:/g, '-')
}

function processData() {
  console.log('🔄 Processing batch data...')
  
  // Check if batch files exist
  const batchesDir = path.join(DATA_DIR, 'batches')
  const staticDir = path.join(DATA_DIR, 'static')
  
  if (!existsSync(batchesDir)) {
    console.error('❌ Batches directory not found. Run: yarn workflow generate')
    process.exit(1)
  }
  
  if (!existsSync(staticDir)) {
    console.error('❌ Static directory not found. Run: yarn workflow generate')
    process.exit(1)
  }
  
  try {
    // Load files
    const locations = JSON.parse(readFileSync(path.join(staticDir, 'locations.json'), 'utf8'))
    const venues = JSON.parse(readFileSync(path.join(staticDir, 'venues.json'), 'utf8'))
    
    const batchFiles = readdirSync(batchesDir).filter(f => f.endsWith('.json'))
    const communitiesFile = batchFiles.find(f => f.startsWith('communities-batch-'))
    const usersFile = batchFiles.find(f => f.startsWith('users-batch-'))
    
    if (!communitiesFile || !usersFile) {
      console.error('❌ Missing batch files. Expected communities-batch-*.json and users-batch-*.json')
      process.exit(1)
    }
    
    const communities = JSON.parse(readFileSync(path.join(batchesDir, communitiesFile), 'utf8'))
    const users = JSON.parse(readFileSync(path.join(batchesDir, usersFile), 'utf8'))
    
    console.log(`📊 Loaded:`)
    console.log(`  - Communities: ${communities.communities.length}`)
    console.log(`  - Users: ${users.users.length}`) 
    console.log(`  - Locations: ${locations.length}`)
    
    // Create event distribution
    const eventsByCity: Record<string, any[]> = {}
    locations.forEach((location: any) => {
      eventsByCity[location.name] = []
    })
    
    // Place community events in their cities
    communities.communities.forEach((community: any) => {
      const cityName = community.homeLocation
      if (eventsByCity[cityName]) {
        community.events?.forEach((event: any) => {
          eventsByCity[cityName].push({
            ...event,
            communityName: community.name,
            communityFocusArea: community.focusArea,
            homeLocation: cityName
          })
        })
      }
    })
    
    // Ensure minimum events per city
    const allEventTemplates = Object.values(eventsByCity).flat()
    Object.keys(eventsByCity).forEach(cityName => {
      const cityEvents = eventsByCity[cityName]
      while (cityEvents.length < MIN_EVENTS_PER_CITY && allEventTemplates.length > 0) {
        const template = allEventTemplates[cityEvents.length % allEventTemplates.length]
        cityEvents.push({
          ...template,
          title: `${template.title} - ${cityName} Edition`,
          homeLocation: cityName
        })
      }
    })
    
    const totalEvents = Object.values(eventsByCity).reduce((sum, events) => sum + events.length, 0)
    const citiesWithEvents = Object.keys(eventsByCity).filter(city => eventsByCity[city].length > 0)
    
    console.log(`✅ Event distribution complete:`)
    console.log(`  - Total events: ${totalEvents}`)
    console.log(`  - Cities with events: ${citiesWithEvents.length}`)
    console.log(`  - Average events per city: ${Math.round(totalEvents / citiesWithEvents.length)}`)
    
    // Create processed directory if it doesn't exist
    const processedDir = path.join(DATA_DIR, 'processed')
    if (!existsSync(processedDir)) {
      mkdirSync(processedDir, { recursive: true })
    }
    
    // Save processed files with timestamps
    const timestamp = getTimestamp()
    
    // 1. Save communities
    const communitiesOutputFile = path.join(processedDir, `communities-final-${timestamp}.json`)
    writeFileSync(communitiesOutputFile, JSON.stringify({
      metadata: {
        generatedAt: new Date().toISOString(),
        totalCommunities: communities.communities.length,
        processor: 'batch-processor'
      },
      communities: communities.communities
    }, null, 2))
    console.log(`💾 Saved: ${path.basename(communitiesOutputFile)}`)
    
    // 2. Save users
    const usersOutputFile = path.join(processedDir, `users-final-${timestamp}.json`)
    writeFileSync(usersOutputFile, JSON.stringify({
      metadata: {
        generatedAt: new Date().toISOString(),
        totalUsers: users.users.length,
        processor: 'batch-processor'
      },
      users: users.users
    }, null, 2))
    console.log(`💾 Saved: ${path.basename(usersOutputFile)}`)
    
    // 3. Save distributed events
    const eventsFile = path.join(processedDir, `events-distributed-${timestamp}.json`)
    writeFileSync(eventsFile, JSON.stringify({
      metadata: {
        generatedAt: new Date().toISOString(),
        minEventsPerCity: MIN_EVENTS_PER_CITY,
        totalCities: Object.keys(eventsByCity).length,
        totalEvents,
        citiesWithEvents: citiesWithEvents.length,
        processor: 'batch-processor'
      },
      eventsByCity
    }, null, 2))
    console.log(`💾 Saved: ${path.basename(eventsFile)}`)
    
    console.log(`\n📂 Processed files saved to: ${processedDir}`)
    
    return {
      communities: communities.communities,
      users: users.users,
      locations,
      venues,
      eventsByCity,
      stats: {
        totalCommunities: communities.communities.length,
        totalUsers: users.users.length,
        totalEvents,
        citiesWithEvents: citiesWithEvents.length
      }
    }
  } catch (error) {
    console.error('❌ Processing failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  const result = processData()
  console.log('🎉 Processing completed successfully!')
  console.log('💡 Data is ready for seeding. Run: yarn workflow seed')
}

export { processData }
