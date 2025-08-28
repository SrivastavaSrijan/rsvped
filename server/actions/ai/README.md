# AI Actions Architecture - Organized Structure

This document outlines the reorganized and well-structured AI actions system for RSVP'd, following the excellent organizational patterns established in the seed system.

## 📁 Directory Structure

```
server/actions/ai/
├── README.md              # This documentation
├── index.ts               # Main barrel export
├── types.ts               # Core types and error definitions
├── prompts/
│   └── index.ts          # Centralized prompt templates
├── schemas/
│   └── index.ts          # Zod schemas for inputs and responses
├── utils/
│   └── index.ts          # Shared utilities and helpers
└── actions/
    ├── contentGeneration.ts  # Content generation actions
    └── eventEnhancement.ts   # Event enhancement actions
```

## 🏗️ Architectural Principles

### 1. Separation of Concerns
- **Prompts**: All LLM prompts are centralized and reusable
- **Schemas**: Input validation and response schemas in one place
- **Utils**: Common utilities for validation, error handling, and responses
- **Actions**: Clean action implementations using the above components
- **Types**: Core type definitions and error codes

### 2. Consistency with Seed System
This structure mirrors the excellent organization found in `prisma/seed/`:
- Centralized prompts (like `prisma/seed/prompts/`)
- Utility functions (like `prisma/seed/utils/`)
- Clear separation of concerns
- Reusable components

### 3. Scalability
- Easy to add new AI operations
- Prompts can be customized without touching action logic
- Utilities are reusable across different AI features
- Type-safe throughout

## 🔧 Component Overview

### `prompts/index.ts`
Centralized prompt templates organized by feature:
```typescript
export const ContentGenerationPrompts = {
  EventTitles: {
    system: (tone) => "...",
    user: (description, eventType, tone) => "..."
  },
  EventDescription: {
    system: (tone, length) => "...",
    user: (title, basicInfo, ...) => "..."
  }
}
```

### `schemas/index.ts`
All Zod schemas for validation and responses:
```typescript
export const InputSchemas = {
  GenerateEventTitles: z.object({...}),
  GenerateEventDescription: z.object({...})
}

export const ResponseSchemas = {
  EventTitleSuggestions: z.object({...}),
  EventDescriptionGeneration: z.object({...})
}
```

### `utils/index.ts`
Shared utilities organized by purpose:
```typescript
export const ValidationUtils = {
  validatePrompt: (prompt) => ...,
  processFormData: (formData, schema) => ...
}

export const ErrorUtils = {
  mapLLMError: (error) => ...,
  createErrorResponse: (error, operation) => ...
}

export const ResponseUtils = {
  createSuccessResponse: (data, content, message) => ...,
  createValidationErrorResponse: (fieldErrors) => ...
}
```

### `actions/`
Clean action implementations that compose the above utilities:
```typescript
export async function generateEventTitles(
  _prevState: AIActionState,
  formData: FormData
): Promise<AIActionState> {
  const validation = ValidationUtils.processFormData(formData, InputSchemas.GenerateEventTitles)
  const systemPrompt = ContentGenerationPrompts.EventTitles.system(tone)
  const result = await llm.generate(...)
  return ResponseUtils.createSuccessResponse(result)
}
```

## 🎯 Benefits of This Structure

### For Developers
1. **Clear Mental Model**: Easy to understand where to find/add things
2. **Reusability**: Utilities and prompts are shared across actions
3. **Maintainability**: Changes to prompts don't require touching action logic
4. **Type Safety**: Full TypeScript coverage with centralized types
5. **Testability**: Each component can be tested in isolation

### For AI Operations
1. **Prompt Management**: Easy to iterate on prompts without code changes
2. **Consistency**: Standardized error handling and response formatting
3. **Debugging**: Clear separation makes issues easier to track down
4. **Performance**: Shared utilities prevent code duplication

### For Future Extensions
1. **New Actions**: Follow the established pattern for consistency
2. **New Prompts**: Add to centralized prompts file
3. **New Schemas**: Extend the schemas file
4. **Custom Logic**: Utilities provide building blocks for complex operations

## 🚀 Usage Examples

### Adding a New AI Action

1. **Add Schema** (if needed):
```typescript
// schemas/index.ts
export const InputSchemas = {
  // ... existing schemas
  GenerateEventHashtags: z.object({
    eventTitle: z.string(),
    eventDescription: z.string(),
    targetAudience: z.string().optional(),
  })
}
```

2. **Add Prompts**:
```typescript
// prompts/index.ts
export const ContentGenerationPrompts = {
  // ... existing prompts
  EventHashtags: {
    system: `You are a social media marketing expert...`,
    user: (title, description, audience) => `Generate hashtags for: ${title}...`
  }
}
```

3. **Create Action**:
```typescript
// actions/contentGeneration.ts
export async function generateEventHashtags(
  _prevState: AIActionState,
  formData: FormData
): Promise<AIActionState> {
  const validation = ValidationUtils.processFormData(formData, InputSchemas.GenerateEventHashtags)
  if (!validation.success) {
    return ResponseUtils.createValidationErrorResponse(validation.errors)
  }

  const systemPrompt = ContentGenerationPrompts.EventHashtags.system()
  const userPrompt = ContentGenerationPrompts.EventHashtags.user(...)
  
  const result = await llm.generate(userPrompt, systemPrompt, ResponseSchemas.EventHashtags, 'generate-hashtags')
  return ResponseUtils.createSuccessResponse(result)
}
```

4. **Export**:
```typescript
// index.ts
export { generateEventHashtags } from './actions/contentGeneration'
```

### Customizing Prompts
```typescript
// Easy to experiment with different prompts
const customSystemPrompt = ContentGenerationPrompts.EventTitles.system('creative')
const customUserPrompt = ContentGenerationPrompts.EventTitles.user(description, 'workshop', 'creative')
```

### Reusing Utilities
```typescript
// Validation
const promptError = ValidationUtils.validatePrompt(userInput)
if (promptError) return ResponseUtils.createValidationErrorResponse({input: [promptError]})

// Error handling
const availabilityCheck = OperationUtils.checkLLMAvailability(llm)
if (availabilityCheck) return availabilityCheck
```

## 📋 Kitchen Sink Tasks for LLM Agent Implementation

Based on this organized structure, here are comprehensive tasks that can be handled by a cloud LLM agent:

### 🔧 Implementation Tasks

1. **New AI Actions**
   - `generateEventAgenda` - Create structured event agendas
   - `generateSpeakerBios` - Create speaker biographies from basic info
   - `generateEventHashtags` - Social media hashtag generation
   - `generateMarketingCopy` - Event promotional content
   - `generateEventSurvey` - Post-event survey questions

2. **Enhanced Features**
   - Batch processing capabilities for multiple events
   - Streaming responses for real-time generation
   - Multi-language content generation
   - Industry-specific prompt variations
   - A/B testing for different prompt approaches

3. **Integration Tasks**
   - Event form integration with AI suggestions
   - Real-time content preview as users type
   - Background AI processing with job queues
   - Caching layer for similar content requests
   - Analytics for AI usage and effectiveness

### 🧹 Cleanup & Refactor Tasks

1. **Code Quality**
   - Add comprehensive unit tests for all utilities
   - Add integration tests for complete AI workflows
   - Implement proper error boundary handling
   - Add performance monitoring and logging
   - Code documentation with JSDoc comments

2. **UI/UX Improvements**
   - Loading states with progress indicators
   - Better error messages with actionable advice
   - Undo/redo functionality for AI generations
   - Copy-to-clipboard functionality
   - Keyboard shortcuts for power users

3. **Performance Optimization**
   - Response caching strategies
   - Request deduplication
   - Lazy loading of AI components
   - Bundle size optimization
   - Memory usage optimization

### 🏗️ Infrastructure Tasks

1. **Monitoring & Observability**
   - AI operation metrics and dashboards
   - Error tracking and alerting
   - Performance monitoring
   - Usage analytics and insights
   - Cost tracking per operation

2. **Security & Compliance**
   - Content safety improvements
   - Rate limiting per user/organization
   - Audit logging for AI operations
   - Privacy controls for generated content
   - GDPR compliance for AI data

3. **Scalability Preparations**
   - Database schema for AI operation history
   - Background job processing system
   - Multiple LLM provider support
   - Load balancing for AI requests
   - Failover mechanisms

### 🎨 Feature Enhancements

1. **Advanced AI Features**
   - Conversational AI for event planning
   - AI-powered event recommendations
   - Smart scheduling suggestions
   - Automated content moderation
   - Personalized content generation

2. **Integration Expansions**
   - Calendar integration with AI scheduling
   - Email template generation
   - Social media post generation
   - Press release writing
   - Speaker recruitment emails

3. **Analytics & Insights**
   - AI-generated content performance tracking
   - User behavior analysis with AI features
   - Content effectiveness metrics
   - ROI analysis for AI-enhanced events
   - Predictive analytics for event success

## 🎯 Next Steps

1. **Immediate**: Test the reorganized structure with existing functionality
2. **Short-term**: Implement 2-3 new AI actions using the established patterns
3. **Medium-term**: Add comprehensive testing and monitoring
4. **Long-term**: Scale to more complex AI workflows and integrations

This organized structure provides a solid foundation for all future AI development while maintaining the high code quality standards established in RSVP'd.
