# AI Actions Architecture

This document outlines the LLM actions architecture for RSVP'd, providing a robust and agnostic foundation for AI-powered features.

## Overview

The AI actions architecture follows RSVP'd's established patterns while providing specialized infrastructure for LLM-powered features. It maintains compatibility with the existing seed system and provides a scalable foundation for future AI enhancements.

## Architecture Components

### 1. LLM Service (`lib/ai/llm.ts`)

**Purpose**: Production-ready LLM client extracted from the seed system
**Key Features**:
- Singleton service pattern
- Error handling with retry logic
- Zod schema integration for structured responses
- Environment-based configuration
- Type-safe API interactions

```typescript
// Usage example
import { llm } from '@/lib/ai/llm'

const result = await llm.generate(
  prompt,
  systemPrompt,
  responseSchema,
  'operation-name'
)
```

### 2. AI Server Actions (`server/actions/ai/`)

**Structure**:
```
server/actions/ai/
├── types.ts              # Shared types, error codes, utilities
├── contentGeneration.ts  # Content generation actions
├── eventEnhancement.ts   # Event enhancement actions
└── index.ts              # Barrel export
```

**Key Features**:
- Follows established server action patterns
- Comprehensive error handling with user-friendly messages
- Input validation using Zod schemas
- Proper integration with `useActionStateWithError` hook
- Business logic separation from LLM operations

### 3. Error Handling System

**Error Codes**:
- `LLM_UNAVAILABLE`: Service not available
- `LLM_GENERATION_FAILED`: Generation failed
- `LLM_TIMEOUT`: Request timeout
- `LLM_RATE_LIMIT`: Rate limit exceeded
- `VALIDATION_ERROR`: Input validation failed
- `UNSAFE_CONTENT`: Content safety violation

**User-Friendly Messages**: All error codes map to helpful user messages in `AIActionErrorCodeMap`.

### 4. UI Components (`app/(main)/components/`)

**Components**:
- `AIFeaturesDemo`: Comprehensive demo of AI capabilities
- `EventDescriptionEnhancer`: Specific event enhancement tool

**Integration**:
- Uses `useActionStateWithError` hook for state management
- Follows ShadCN UI patterns
- Proper loading states and error handling
- Type-safe with RouterOutput types

## Implementation Examples

### 1. Content Generation Actions

```typescript
// Generate event titles
export async function generateEventTitles(
  _prevState: AIActionState,
  formData: FormData
): Promise<AIActionState>

// Generate event descriptions
export async function generateEventDescription(
  _prevState: AIActionState,
  formData: FormData
): Promise<AIActionState>
```

### 2. Event Enhancement Actions

```typescript
// Enhance existing descriptions
export async function enhanceEventDescription(
  _prevState: AIActionState,
  formData: FormData
): Promise<AIActionState>

// Apply enhanced content
export async function applyEnhancedDescription(
  _prevState: AIActionState,
  formData: FormData
): Promise<AIActionState>
```

### 3. UI Component Usage

```typescript
const {
  formAction,
  errorComponent,
  isPending,
  state,
} = useActionStateWithError({
  action: generateEventTitles,
  initialState: initialAIActionState,
  errorCodeMap: AIActionErrorCodeMap,
})
```

## Configuration

### Environment Variables

```bash
TOGETHER_API_KEY=your_api_key_here
```

### LLM Configuration

```typescript
const LLM_CONFIG = {
  model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
  maxTokens: 10000,
  temperature: 0.7,
  maxRetries: 3,
  baseDelayMs: 1000,
}
```

## Best Practices

### 1. Server Actions

- Always validate input with Zod schemas
- Use proper error handling with specific error codes
- Follow the established `useActionStateWithError` pattern
- Include business logic validation (user permissions, resource access)
- Use descriptive operation names for LLM calls

### 2. LLM Integration

- Create specific Zod schemas for expected responses
- Use descriptive system prompts for consistent results
- Include operation context in error handling
- Implement proper retry logic for transient failures
- Validate all LLM responses before returning

### 3. UI Components

- Use `useActionStateWithError` for state management
- Provide clear loading states and error feedback
- Follow ShadCN UI patterns and components
- Include proper accessibility features
- Use TypeScript for type safety

### 4. Error Handling

- Map technical errors to user-friendly messages
- Distinguish between retryable and non-retryable errors
- Provide actionable feedback to users
- Log technical details for debugging
- Handle edge cases gracefully

## Future Extensions

This architecture is designed to support:

1. **New AI Operations**: Add new action files following the established pattern
2. **Different LLM Providers**: Extend the LLM service with provider abstraction
3. **Streaming Responses**: Add streaming support for real-time generation
4. **Batch Operations**: Support bulk AI operations
5. **Custom Models**: Integration with fine-tuned models
6. **Conversation Context**: Multi-turn AI interactions

## Testing Considerations

- Mock the LLM service for unit tests
- Test error handling paths thoroughly
- Validate Zod schema compatibility
- Test rate limiting and retry logic
- Verify user permission checks

## Performance Considerations

- Cache expensive AI operations when appropriate
- Implement request deduplication for similar prompts
- Monitor API usage and costs
- Optimize prompt engineering for efficiency
- Consider background processing for non-urgent operations

## Security Considerations

- Validate all user input thoroughly
- Implement content safety checks
- Protect API keys in environment variables
- Log AI operations for audit purposes
- Implement rate limiting per user if needed
