# Seed System Documentation

Production-ready database seeding system for RSVP'd with LLM-generated realistic data.

## Overview

This seed system generates realistic event management data including:
- **Communities**: Tech meetups, professional organizations, and hobby groups
- **Users**: Detailed user personas with professional backgrounds
- **Events**: Distributed events across 69+ global cities
- **Locations & Venues**: Real-world venues and conference centers

## Quick Start

1. **Setup Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database URL and preferences
   ```

2. **Full Seeding Workflow**
   ```bash
   yarn seed:full
   ```

3. **Check Status**
   ```bash
   yarn seed:status
   ```

## Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `yarn seed:status` | Show current workflow status | Always safe to run |
| `yarn seed:generate` | Generate LLM data batches | Requires LLM API access |
| `yarn seed:process` | Process and validate data | Requires generated batches |
| `yarn seed:run` | Seed database | Requires processed data |
| `yarn seed:full` | Run complete workflow | Full end-to-end seeding |

## Configuration

### Environment Variables

```bash
# Data Volume
NUM_USERS=300                    # Number of user personas to generate
NUM_COMMUNITIES=50               # Number of communities to create
EXTRA_STANDALONE_EVENTS=100      # Additional events without communities
MIN_EVENTS_PER_CITY=15          # Minimum events per city

# Feature Flags
USE_LLM=true                    # Enable LLM data generation
USE_BATCH_LOADER=true           # Use processed batch data
SHOULD_WIPE=false               # Wipe database before seeding

# Performance
LOG_LEVEL=info                  # debug, info, warn, error
MAX_CONCURRENT_OPERATIONS=10     # Batch processing concurrency
BATCH_SIZE=100                  # Items per batch
```

### External APIs

```bash
# Unsplash (for event images)
UNSPLASH_ACCESS_KEY=your_key
UNSPLASH_COLLECTION_ID=j7hIPPKdCOU
```

## Data Structure

```
prisma/.local/seed-data/
├── static/           # Base data (committed to git)
│   ├── locations.json
│   └── venues.json
├── batches/          # LLM-generated data (gitignored)
│   ├── communities-batch-*.json
│   └── users-batch-*.json
├── processed/        # Final processed data (gitignored)
│   ├── communities-final-*.json
│   ├── users-final-*.json
│   └── events-distributed-*.json
└── logs/            # Execution logs (gitignored)
    └── seed-*.log
```

## Error Handling

The system includes comprehensive error handling:

- **Validation**: Zod schemas validate all data structures
- **Retry Logic**: Automatic retries for transient failures
- **Batch Processing**: Isolated error handling per batch
- **Logging**: Detailed logs with operation tracking
- **Recovery**: Graceful fallbacks for missing data

## Production Deployment

### Vercel/Serverless

```bash
# In your deployment script
DATABASE_URL=$DATABASE_URL yarn seed:full
```

### Docker

```dockerfile
RUN yarn seed:generate
RUN yarn seed:process
CMD ["yarn", "seed:run"]
```

### CI/CD

```yaml
- name: Seed Database
  run: |
    yarn seed:process  # Use existing batch data
    yarn seed:run
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    LOG_LEVEL: info
```

## Performance Characteristics

- **Generation**: ~2 minutes for 300 users, 50 communities
- **Processing**: ~10 seconds for data validation and distribution
- **Seeding**: ~30 seconds for 1000+ events with relationships
- **Memory**: Peak ~200MB during processing
- **Database**: ~50MB for full dataset

## Monitoring

### Logs

```bash
# View real-time logs
tail -f prisma/.local/logs/seed-*.log

# Filter by level
grep "ERROR" prisma/.local/logs/seed-*.log
```

### Status Checks

```bash
# Quick health check
yarn seed:status

# Detailed workflow state
LOG_LEVEL=debug yarn seed:status
```

## Troubleshooting

### Common Issues

1. **Missing batch files**
   ```bash
   yarn seed:generate  # Generate new batch data
   ```

2. **Database connection errors**
   ```bash
   # Check DATABASE_URL in .env.local
   npx prisma db push
   ```

3. **LLM API errors**
   ```bash
   USE_LLM=false yarn seed:process  # Use existing data
   ```

4. **Validation errors**
   ```bash
   LOG_LEVEL=debug yarn seed:process  # See detailed errors
   ```

### Reset Everything

```bash
# Clear all generated data
rm -rf prisma/.local/seed-data/batches
rm -rf prisma/.local/seed-data/processed
rm -rf prisma/.local/logs

# Start fresh
yarn seed:full
```

## Development

### Adding New Data Types

1. Create Zod schema in `validation.ts`
2. Add processing logic in `process.ts`
3. Update seeding logic in `seed.ts`
4. Add configuration in `config.ts`

### Custom Data Sources

```typescript
// In your processor
const customData = await loadCustomData()
const processedData = await processCustomData(customData)
safeWriteJSON(outputPath, processedData)
```

## Security

- **API Keys**: Never commit API keys, use environment variables
- **Database**: Use connection pooling for production
- **Validation**: All data is validated with Zod schemas
- **Sanitization**: User inputs are sanitized during processing

## License

Production-ready seed system for RSVP'd event management platform.
