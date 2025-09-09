# Search Implementation Documentation

## Overview

The RSVP'd search system provides intelligent, contextual search across Events and Communities with advanced matching algorithms, relevance scoring, and visual feedback.

## Architecture

### Core Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Search UI     │    │   tRPC Routers   │    │   Database      │
│                 │    │                  │    │                 │
│ - StirTabsHeader│ ──▶│ - stirSearchRouter│ ──▶│ - Events        │
│ - StirEventsTab │    │ - Event helpers  │    │ - Communities   │
│ - StirComTab    │    │ - Community helpers│   │ - Locations     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Search Results  │    │ Match Detection  │    │ Scoring Engine  │
│                 │    │                  │    │                 │
│ - EventCard     │    │ - Text matching  │    │ - Relevance     │
│ - CommunityItem │    │ - Field mapping  │    │ - Recency       │
│ - Highlighting  │    │ - Fuzzy search   │    │ - Location      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Search Fields

### Events
| Field | Weight | Type | Description |
|-------|--------|------|-------------|
| `title` | 2x | Text | Event title (primary match field) |
| `description` | 1x | Text | Event description |
| `location` | Bonus | Proximity | Geographic relevance |
| `startDate` | Bonus | Temporal | Recency/upcoming bonus |

### Communities  
| Field | Weight | Type | Description |
|-------|--------|------|-------------|
| `name` | 2x | Text | Community name (primary match field) |
| `description` | 1x | Text | Community description |
| `memberCount` | Bonus | Activity | Community size |
| `recentEvents` | Bonus | Activity | Recent activity level |

## Matching Algorithm

### 1. Word Boundary Detection
```typescript
// Prevents "tech" from matching "technique"
const isRelevantMatch = (text: string, query: string) => {
  const ratio = levenshteinRatio(queryWord, textWord)
  return ratio >= 0.6 // 60% similarity threshold
}
```

### 2. Match Types (Priority Order)
1. **Exact Match** (1000 points) - Complete phrase match
2. **Phrase Match** (500/100 points) - Substring match with word boundaries
3. **Word Match** (200-50 points) - Individual word matches
4. **Prefix Match** (150-30 points) - Word starts with query
5. **Fuzzy Match** (100-20 points) - Similar words (60%+ similarity)

### 3. Scoring Factors

#### Text Relevance
- **Title/Name matches**: 2x weight multiplier
- **Description matches**: 1x weight
- **Multiple matches**: Cumulative scoring
- **Match position**: Earlier matches score higher

#### Recency Bonus (Events)
```typescript
const daysDiff = (event.startDate - now) / (24 * 60 * 60 * 1000)
const recencyScore = daysDiff <= 30 ? Math.max(50 - daysDiff, 0) : 0
```

#### Location Proximity (Events)
- Same city/region gets location bonus
- Distance-based scoring for geographic relevance

#### Activity Score (Communities)
- Member count: `log(memberCount + 1) * 2`
- Recent events: `recentEventCount * 3`

## Search Flow

### 1. Query Processing
```typescript
// /server/api/routers/stir/search.ts
const where = createEventSearchWhere(query) // Basic DB filters
const searchLimit = Math.min(take * 10, 500) // Fetch buffer for filtering
```

### 2. Intelligent Filtering
```typescript
const relevantEvents = events.filter(event =>
  isRelevantMatch(event.title, query) ||
  (event.description && isRelevantMatch(event.description, query))
)
```

### 3. Scoring & Ranking
```typescript
const scoredEvents = relevantEvents.map(event => {
  const searchResult = calculateEventScoreWithMatches(event, searchParams)
  return {
    ...event,
    _searchMetadata: {
      matches: searchResult.matches,
      score: searchResult.total,
      query: query
    }
  }
}).sort((a, b) => b._searchMetadata.score - a._searchMetadata.score)
```

### 4. Enhancement & Display
```typescript
// Search results → Enhancement → UI Components
const enhancedEvents = await api.event.list.enhanceByIds({
  ids: coreEvents.map(e => e.id)
})
// Preserve search metadata during enhancement
```

## UI Components

### Search Results Display

#### EventCard
- Shows event details with RSVP status, collaborators
- Displays match context for non-title fields
- Highlights search terms in title and description
- Color: Blue theme for match indicators

#### UserCommunityItem  
- Shows community details with member count, recent events
- Displays match context for non-name fields
- Highlights search terms in name and description
- Color: Green theme for match indicators

### Match Context Display
```typescript
// Only show match context if NOT in primary field
const shouldShowMatch = matchReason && 
  searchQuery && 
  !['title', 'name'].includes(matchReason.field)

// Format: "Matched in description: 'Join us, you <highlighted>tech</highlighted>ies...'"
```

### Text Highlighting
```typescript
// Single regex approach prevents duplicate highlighting
const combinedPattern = new RegExp(`(${patterns.join('|')})`, 'gi')
// Wraps matches in <mark className="rsvped-search-highlight">
```

## Pagination Strategy

### Tab Counts (Headers)
```typescript
// StirTabsHeader makes size=1 queries for accurate totals
const { data: eventsResult } = trpc.stir.search.events.useQuery(
  { query: q, page: 1, size: 1 }
)
const eventsCount = eventsResult?.pagination.total ?? 0
```

### Result Pagination
```typescript
// Simple slice-based pagination on filtered results
const paginatedEvents = relevantEvents.slice(skip, skip + take)
const total = relevantEvents.length
```

## Performance Optimizations

### Database Queries
- **Search Limit**: Fetch 10x page size (max 500) for better filtering
- **Targeted WHERE**: Use database text search as pre-filter
- **Selective Includes**: Only fetch needed relations

### Client-Side
- **Debounced Search**: Prevent excessive API calls
- **Skeleton Loading**: Show placeholders during enhancement
- **Optimistic Updates**: Immediate UI feedback

## Error Handling

### Graceful Degradation
- Invalid queries return empty results
- Database errors show user-friendly messages
- Missing enhancement data falls back to core data

### Type Safety
```typescript
// All search metadata is properly typed
interface SearchMatchInfo {
  field: string
  matchType: 'exact' | 'phrase' | 'word' | 'prefix' | 'fuzzy'
  matchedText: string
  reason: string
  score: number
}
```

## Configuration

### Search Limits
- **Max Results per Page**: 20
- **Search Buffer**: 10x page size (max 500)
- **Tab Count Queries**: size=1 for efficiency
- **Fuzzy Match Threshold**: 60% similarity

### Scoring Weights
- **Title/Name**: 2x multiplier
- **Description**: 1x base weight
- **Location Bonus**: Up to 200 points
- **Recency Bonus**: Up to 50 points (events)
- **Activity Bonus**: Log-scaled (communities)

## File Structure

```
server/api/routers/stir/
├── search.ts           # Main search router
├── helpers.ts          # Scoring algorithms
├── types.ts           # Search type definitions
└── autocomplete.ts    # Search suggestions

app/(main)/stir/
├── components/
│   ├── StirTabsHeader.tsx    # Tab counts
│   ├── StirEventsTab.tsx     # Events results
│   └── StirCommunitiesTab.tsx # Communities results
└── page.tsx           # Search page

lib/hooks/
└── useHighlighter.tsx # Text highlighting & match display

components/
├── EventCard.tsx      # Event search result display
└── UserCommunityItem.tsx # Community search result display
```

## Key Design Decisions

1. **Intelligent Filtering**: Pre-filter with database, post-filter with algorithms
2. **Separate Enhancement**: Keep search metadata through enhancement process  
3. **Visual Hierarchy**: Only show match context for non-primary fields
4. **Performance First**: Limit database queries, optimize for common cases
5. **Type Safety**: Full TypeScript coverage for search metadata

## Future Enhancements

- [ ] **Faceted Search**: Filter by date, location, category
- [ ] **Search Analytics**: Track popular queries and results
- [ ] **Personalization**: User history and preference weighting
- [ ] **Full-Text Search**: PostgreSQL text search integration
- [ ] **Search Suggestions**: Real-time autocomplete with fuzzy matching
