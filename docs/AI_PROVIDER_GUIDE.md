# AI Provider Integration Guide

## Overview

DecisionHub AI uses a provider-agnostic AI abstraction layer that supports multiple AI services with automatic fallback to mock mode when real AI is unavailable.

## Architecture

```
┌─────────────────────────────────────────┐
│     NaturalLanguageRecommendation       │
│              Agent                      │
└────────────────┬────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼─────┐   ┌──────▼────┐
    │ Research │   │ Decision  │
    │  Agent   │   │   Agent   │
    └────┬─────┘   └─────┬─────┘
         │               │
         └───────┬───────┘
                 │
         ┌───────▼────────┐
         │  AI Provider   │
         │    Factory     │
         └───────┬────────┘
                 │
      ┌──────────┼──────────┐
      │                     │
┌─────▼──────┐      ┌──────▼──────┐
│   GitHub   │      │    Mock     │
│   Models   │      │   Provider  │
│  Provider  │      │             │
└────────────┘      └─────────────┘
```

## Supported Providers

### 1. GitHub Models (Real AI)

GitHub Models provides access to various AI models through Azure OpenAI-compatible API:

**Supported Models:**
- GPT-4o (OpenAI GPT-4 Optimized)
- GPT-4o-mini (OpenAI GPT-4 Mini)
- O1-preview (OpenAI O1 Preview)
- O1-mini (OpenAI O1 Mini)
- Claude Sonnet 4 (if available)

**Features:**
- Real AI understanding of natural language queries
- Context-aware vehicle research
- Intelligent decision strategy explanation
- Colombian market expertise

**Limitations:**
- Requires GitHub Personal Access Token
- Subject to API rate limits
- Costs per request (based on GitHub Models pricing)

### 2. Mock Provider (Fallback)

Rule-based AI that works offline without API keys:

**Features:**
- Keyword-based query analysis
- Pattern matching for preferences
- No API costs or rate limits
- Always available

**Limitations:**
- Limited natural language understanding
- No context awareness
- Basic response generation

## Configuration

### Environment Variables

Create a `.env` file in `packages/api/`:

```env
# AI Provider Configuration
AI_PROVIDER=mock          # Options: 'github', 'mock'

# GitHub Models Configuration (when using AI_PROVIDER=github)
GITHUB_TOKEN=ghp_your_token_here
MODEL_ID=gpt-4o          # Or any available model
```

### Getting a GitHub Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: "DecisionHub AI"
4. Select scopes:
   - ✅ `model` - Access to GitHub Models API
5. Click "Generate token"
6. Copy the token immediately (you won't see it again)
7. Add to your `.env` file

### Available Models

Check [GitHub Marketplace - Models](https://github.com/marketplace/models) for the current list of available models.

**Important:** Only use model IDs that actually exist in GitHub Models. Using invalid model IDs will cause the provider to fall back to mock mode.

## Usage

### Automatic Provider Selection

The system automatically selects the appropriate provider on startup:

```typescript
// In packages/api/src/server.ts
import { AIProviderFactory } from './services/ai';

// Initialize on startup
await AIProviderFactory.initialize();

// Check which provider is active
const isRealAI = AIProviderFactory.isRealAI();
console.log(`AI Provider: ${isRealAI ? 'Real AI' : 'Mock AI'}`);
```

### Using the Provider in Agents

```typescript
import { AIProviderFactory, AIMessage } from '../services/ai';

// Get the active provider
const provider = AIProviderFactory.getProvider();

// Create messages
const messages: AIMessage[] = [
  {
    role: 'system',
    content: 'You are a helpful assistant...',
  },
  {
    role: 'user',
    content: 'User query here',
  },
];

// Call the AI
const response = await provider.chat(messages, {
  temperature: 0.7,
  maxTokens: 1500,
});

// Parse response
const result = JSON.parse(response.content);
```

### Research Agent

The Research Agent uses AI to analyze user queries and extract preferences:

```typescript
import { ResearchAgent } from '../agents/ResearchAgent';

const agent = new ResearchAgent();

const result = await agent.execute({
  query: 'Necesito un SUV seguro para mi familia, presupuesto 200 millones',
  currency: 'COP',
});

// result contains:
// - insights: AI analysis summary
// - suggestedFilters: Extracted filters
// - preferences: Detected preferences with confidence
// - criteria: Decision criteria with weights
```

### Lead Decision Agent

The Decision Agent uses AI to explain recommendation strategies:

```typescript
import { LeadDecisionAgent } from '../agents/LeadDecisionAgent';

const agent = new LeadDecisionAgent();

const explanation = await agent.execute({
  query: 'User query',
  topRecommendations: [...],
});

// explanation contains:
// - strategy: Decision strategy used
// - reasoning: Detailed explanation
// - keyFactors: Important decision factors
// - confidence: Confidence score
```

## API Response Format

### Natural Language Recommendation Endpoint

**Request:**
```bash
POST /api/cars/recommend/nl
Content-Type: application/json

{
  "query": "Necesito un SUV seguro para mi familia, presupuesto 200 millones",
  "currency": "COP"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "category": "cars",
      "budget": { "max": 200000000, "currency": "COP" },
      "detectedPreferences": [
        { "label": "Seguridad", "value": "safety", "confidence": 0.95 }
      ],
      "decisionCriteria": [
        { "name": "Seguridad", "weight": 0.35, "description": "..." }
      ],
      "searchCriteria": { "maxPrice": 200000000, "bodyTypes": ["suv"] }
    },
    "recommendations": [
      {
        "car": { "id": "car-002", "make": "Honda", "model": "CR-V", ... },
        "score": 85,
        "reasoning": "...",
        "pros": ["..."],
        "cons": ["..."]
      }
    ],
    "agentActivity": [
      {
        "agentName": "Research Agent",
        "status": "completed",
        "description": "Análisis completado",
        "timestamp": "2024-01-..."
      }
    ],
    "processingTimeMs": 245
  }
}
```

## Agent Activity Timeline

The system tracks all agent activities for transparency:

```typescript
{
  "agentActivity": [
    {
      "agentName": "Research Agent",
      "status": "completed",
      "description": "Análisis completado"
    },
    {
      "agentName": "Criteria Agent",
      "status": "completed",
      "description": "Criterios generados"
    },
    {
      "agentName": "Recommendation Agent",
      "status": "completed",
      "description": "5 vehículos encontrados"
    },
    {
      "agentName": "Lead Decision Agent",
      "status": "completed",
      "description": "Estrategia explicada"
    }
  ]
}
```

The Decision Agent only runs when real AI is available, providing enhanced explanations.

## Error Handling

The system gracefully handles errors:

1. **GitHub Token Invalid:** Falls back to Mock Provider
2. **API Rate Limit:** Falls back to Mock Provider
3. **Network Error:** Falls back to Mock Provider
4. **Model Not Available:** Falls back to Mock Provider
5. **JSON Parse Error:** Returns fallback response

All errors are logged but don't crash the application.

## Testing

### Test with Mock Provider

```bash
# Start server (default uses mock)
npm run dev

# Test endpoint
curl -X POST http://localhost:3000/api/cars/recommend/nl \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SUV familiar seguro bajo 180 millones",
    "currency": "COP"
  }'
```

### Test with Real AI

```bash
# Configure GitHub token
export GITHUB_TOKEN="ghp_your_token"
export MODEL_ID="gpt-4o"
export AI_PROVIDER="github"

# Start server
npm run dev

# Test endpoint (same as above)
```

### Verify Provider Status

```bash
# Check server logs on startup
# You should see one of:
# ✅ "AI Provider: Real AI" (GitHub Models active)
# ✅ "AI Provider: Mock AI" (Fallback mode)
```

## Best Practices

### 1. Always Use Fallback

Never assume real AI is available. Always handle mock responses:

```typescript
const isRealAI = AIProviderFactory.isRealAI();

if (isRealAI) {
  // Enhanced features with real AI
} else {
  // Basic features with mock
}
```

### 2. Validate JSON Responses

AI responses may not always be valid JSON:

```typescript
try {
  const data = JSON.parse(response.content);
  // Use data
} catch (error) {
  // Use fallback logic
  return getFallbackResult();
}
```

### 3. Set Reasonable Timeouts

Don't let AI calls block indefinitely:

```typescript
const response = await Promise.race([
  provider.chat(messages),
  timeout(10000), // 10 second timeout
]);
```

### 4. Log AI Interactions

Always log AI calls for debugging:

```typescript
this.log(`Using ${provider.name} for analysis`);
const response = await provider.chat(messages);
this.log(`AI response length: ${response.content.length}`);
```

### 5. Monitor Costs

Real AI has costs. Monitor your usage:

- Track API calls per session
- Set budget limits in GitHub
- Use mock provider for development

## Future Enhancements

### Planned Providers

- **OpenAI Direct:** Direct OpenAI API integration
- **Anthropic:** Claude via Anthropic API
- **Azure OpenAI:** Enterprise-grade deployment
- **Local LLM:** Ollama or similar for offline use

### Planned Features

- **Streaming responses:** Real-time AI output
- **Conversation history:** Multi-turn dialogues
- **Caching:** Reduce API calls for similar queries
- **A/B testing:** Compare provider performance
- **RAG integration:** Vector database for vehicle knowledge

## Troubleshooting

### "Mock AI" shown but I configured GitHub token

**Causes:**
1. Token doesn't have `model` scope
2. Token is expired or invalid
3. Model ID doesn't exist
4. Network connectivity issues
5. GitHub Models API is down

**Solutions:**
1. Regenerate token with correct scope
2. Check token expiration
3. Verify model ID at https://github.com/marketplace/models
4. Check network/firewall
5. Check GitHub status page

### Responses are not in Spanish

**Cause:** The AI is responding in English

**Solution:** Add language instructions to system prompts:

```typescript
{
  role: 'system',
  content: 'Respond in Spanish (Colombia). Consider local market context...'
}
```

### Slow response times

**Causes:**
1. Real AI API latency
2. Large token limits
3. Network latency
4. Complex prompts

**Solutions:**
1. Use mock provider for development
2. Reduce `maxTokens` parameter
3. Optimize network connection
4. Simplify system prompts

## Support

For issues or questions:

1. Check server logs for error messages
2. Verify environment variables are set
3. Test with mock provider first
4. Check GitHub Models status
5. Review API rate limits

## License

This AI provider abstraction is part of DecisionHub AI and follows the same license as the main project.
