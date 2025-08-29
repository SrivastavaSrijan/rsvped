# AI Integration System

This directory contains the core AI services used throughout the RSVP'd application for content generation and enhancement.

## Architecture Overview

The AI system is designed around three key components:
1. **LLM Service** (`llm.ts`) - Core AI client with structured output validation
2. **Server Actions** (`/server/actions/ai/`) - Application-level AI operations  
3. **UI Components** (`/components/shared/`) - Smart form inputs with AI assistance

## Current Implementation

### LLM Service (`llm.ts`)
- **Provider**: Together AI (Meta-Llama-3.1-70B-Instruct-Turbo)
- **Features**: Structured JSON output with Zod validation, retry logic, error handling
- **Usage**: Singleton `llm` instance for all AI operations

### Server Actions (`/server/actions/ai/`)
- `generateSuggestions()` - Context-aware content suggestions
- `enhanceText()` - Text improvements (proofread, rewrite, tone adjustments)
- **Context System**: Each AI call includes domain/page/field context for relevant outputs

### UI Components
- **SmartInput**: Form input with integrated AI assistance
- **WritingAssistant**: Popover with enhancement options and custom prompts
- **SuggestionChips**: Simple chip-based suggestions (legacy, being replaced)

## Current Workflow

### 1. Event Form Integration
```tsx
// EventForm.tsx
<SmartInput
  name="title"
  assistant={{
    enabled: true,
    context: createAIContext('title'),
    generatePrompt: (currentValue) => EventPrompts.title(currentValue, {...}),
  }}
/>
```

### 2. AI Context System
Each AI-enabled field provides context:
```typescript
{
  domain: 'events',        // What part of the app
  page: 'create',          // What action
  field: 'title',          // What field
  location: 'venue-name',  // Additional context
  metadata: {              // Flexible metadata
    locationType: 'PHYSICAL',
    startDate: '9/5/2025',
    eventTitle: 'Current Title'
  }
}
```

### 3. Response Validation
All AI responses are validated against Zod schemas:
```typescript
const SuggestionsSchema = z.object({
  suggestions: z.array(z.object({
    text: z.string().min(1).max(500),
    disposition: z.string().min(1).max(20), // LLM-provided disposition
  })).min(1).max(5),
})
```

## Current Workflow

### 1. WritingAssistant Enhanced Flow
- User opens WritingAssistant (popover with enhancement options)
- AI generates suggestions with dispositions (e.g., "professional", "casual", "creative")
- User sees disposition badges, clicks to preview full text
- Preview shows side-by-side with Apply button
- Apply replaces input text, closes preview, keeps assistant open


### Configuration
- **API Key**: `TOGETHER_API_KEY` environment variable
- **Model**: Meta-Llama-3.1-70B-Instruct-Turbo (configurable in `llm.ts`)
- **Limits**: 5 suggestions max, 500 chars each

## Usage Examples

### Basic AI-Enhanced Input
```tsx
<SmartInput
  name="description"
  type="textarea"
  assistant={{
    enabled: true,
    context: { domain: 'events', page: 'create', field: 'description' },
    generatePrompt: (value) => `Enhance this event description: ${value}`
  }}
/>
```

### Custom Enhancement
```tsx
// WritingAssistant automatically handles:
// - Text enhancements (proofread, rewrite, tone)
// - Custom prompts with suggestions
// - Undo functionality
// - Error handling
```

## Error Handling
- **LLMError**: Custom error class with retry logic
- **Validation**: All responses validated against schemas
- **Fallbacks**: Graceful degradation when AI unavailable
- **User Feedback**: Clear error messages mapped from error codes
