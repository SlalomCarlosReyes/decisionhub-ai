# Agent Workflow Specification - DecisionHub AI

## Document Overview

**Purpose**: Detailed specification of the multi-agent AI workflow  
**Version**: 1.0  
**Status**: ✅ Implemented  
**Last Updated**: 2026-06-29

---

## 1. Agent System Overview

### 1.1 Philosophy

DecisionHub AI uses a **multi-agent architecture** where specialized AI agents collaborate to provide intelligent vehicle recommendations. Each agent has a focused responsibility, communicating through well-defined interfaces.

**Key Principles**:
- **Separation of Concerns**: Each agent handles one aspect of the recommendation process
- **Composability**: Agents can be combined in different ways
- **Transparency**: Agent activities are tracked and visible to users
- **Graceful Degradation**: System works even when AI providers fail
- **Provider Agnostic**: Agents work with any AI provider (or mock)

### 1.2 Agent Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│       Natural Language Recommendation Agent              │
│              (Orchestrator Agent)                        │
│                                                          │
│  Responsibilities:                                       │
│  • Coordinate multi-agent workflow                      │
│  • Track agent activities for timeline                  │
│  • Aggregate results into final response                │
│  • Handle errors across agent pipeline                  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐       ┌────────▼────────┐
│ Research Agent │       │  Lead Decision  │
│                │       │     Agent       │
│ Analyzes query │       │  Explains why   │
│ Detects prefs  │       │                 │
│ Uses AI        │       │  Uses AI        │
└───────┬────────┘       └─────────────────┘
        │
        │ Generates
        │ SearchCriteria
        │
┌───────▼────────┐
│ Car Recomm.    │
│ Agent          │
│                │
│ Scores cars    │
│ No AI needed   │
└────────────────┘
```

---

## 2. Agent Specifications

### 2.1 Natural Language Recommendation Agent

**File**: `packages/api/src/agents/NaturalLanguageRecommendationAgent.ts`

**Type**: Orchestrator Agent

**Purpose**: Coordinate the complete recommendation workflow from natural language query to final results

#### 2.1.1 Interface

**Input**:
```typescript
interface NaturalLanguageRequest {
  query: string;           // User's natural language query
  currency?: Currency;     // COP, USD, or EUR (default: COP)
}
```

**Output**:
```typescript
interface AIRecommendationResponse {
  analysis: AIAnalysis;              // Query understanding
  recommendations: CarRecommendation[];  // Top vehicle matches
  agentActivity: AgentActivity[];    // Workflow timeline
  processingTimeMs: number;          // Performance metric
}
```

#### 2.1.2 Workflow Steps

**Step 1: Research Agent Invocation**
```typescript
// Track activity
trackActivity({
  agentName: 'Research Agent',
  status: 'processing',
  description: 'Analizando consulta del usuario'
});

// Execute Research Agent
const researchResult = await researchAgent.execute({
  query: input.query,
  currency: input.currency || 'COP'
});

// Merge with NLP Parser results
const analysis = {
  ...baseAnalysis,
  detectedPreferences: researchResult.preferences || baseAnalysis.detectedPreferences,
  decisionCriteria: researchResult.criteria || baseAnalysis.decisionCriteria
};

// Mark complete
trackActivity({
  agentName: 'Research Agent',
  status: 'completed',
  description: 'Análisis completado',
  timestamp: new Date().toISOString()
});
```

**Step 2: Criteria Agent (Implicit)**
```typescript
// Note: Criteria generation happens in Research Agent
trackActivity({
  agentName: 'Criteria Agent',
  status: 'completed',
  description: 'Criterios de comparación generados'
});
```

**Step 3: Recommendation Agent Invocation**
```typescript
trackActivity({
  agentName: 'Recommendation Agent',
  status: 'processing',
  description: 'Buscando y clasificando vehículos'
});

// Execute Car Recommendation Agent
const result = await recommendationAgent.execute(
  analysis.searchCriteria
);
const recommendations = result.recommendations;

trackActivity({
  agentName: 'Recommendation Agent',
  status: 'completed',
  description: `${recommendations.length} vehículos encontrados y clasificados`
});
```

**Step 4: Decision Agent Invocation (Optional)**
```typescript
// Only run if real AI is available
if (isRealAI && recommendations.length > 0) {
  trackActivity({
    agentName: 'Lead Decision Agent',
    status: 'processing',
    description: 'Explicando estrategia de decisión'
  });
  
  try {
    const explanation = await decisionAgent.execute({
      query: input.query,
      topRecommendations: recommendations.slice(0, 3)
    });
    
    trackActivity({
      agentName: 'Lead Decision Agent',
      status: 'completed',
      description: 'Estrategia de decisión explicada'
    });
  } catch (error) {
    // Continue without decision explanation
  }
}
```

**Step 5: Response Assembly**
```typescript
return {
  analysis,
  recommendations,
  agentActivity: this.agentActivity,
  processingTimeMs: Date.now() - startTime
};
```

#### 2.1.3 Error Handling

```typescript
try {
  // Execute workflow
} catch (error) {
  this.logError('Failed to process natural language query', error);
  throw error;  // Propagate to controller for HTTP error response
}
```

---

### 2.2 Research Agent

**File**: `packages/api/src/agents/ResearchAgent.ts`

**Type**: AI-Powered Analysis Agent

**Purpose**: Use AI to analyze user queries, detect preferences, and suggest vehicle filters

#### 2.2.1 Interface

**Input**:
```typescript
interface NaturalLanguageRequest {
  query: string;
  currency?: Currency;
}
```

**Output**:
```typescript
interface ResearchResult {
  insights: string;                          // AI analysis summary
  suggestedFilters: {                        // Extracted filters
    bodyTypes?: string[];
    fuelTypes?: string[];
    priceRange?: { min: number; max: number };
  };
  preferences: DetectedPreference[];         // With confidence scores
  criteria: DecisionCriteria[];              // With weights
}
```

#### 2.2.2 AI Prompt Design

**System Prompt**:
```
You are a Research Agent for DecisionHub AI, specialized in the Colombian automotive market.

Your task:
1. Analyze the user's vehicle request
2. Extract key preferences (safety, comfort, fuel efficiency, etc.)
3. Suggest vehicle types and filters
4. Generate decision criteria with weights

Respond ONLY with valid JSON in this format:
{
  "insights": "Brief analysis of what the user needs",
  "suggestedFilters": {
    "bodyTypes": ["suv", "sedan"],
    "fuelTypes": ["hybrid", "electric"],
    "priceRange": { "min": 100000000, "max": 250000000 }
  },
  "preferences": [
    { "label": "Seguridad", "value": "safety", "confidence": 0.95 }
  ],
  "criteria": [
    { "name": "Seguridad", "weight": 0.35, "description": "Safety features and ratings" }
  ]
}

Consider:
- Colombian market (COP prices in millions)
- Road conditions and service availability
- Family needs, safety priorities
- Budget constraints
```

**User Prompt**:
```
Analyze this vehicle request for the Colombian market:

"Necesito un SUV seguro y confiable para mi familia, presupuesto 200 millones"

Currency: COP
```

#### 2.2.3 Execution Flow

```typescript
async execute(input: NaturalLanguageRequest): Promise<ResearchResult> {
  this.log(`Researching query: "${input.query}"`);
  
  try {
    // Get AI provider
    const provider = AIProviderFactory.getProvider();
    const isRealAI = AIProviderFactory.isRealAI();
    
    if (isRealAI) {
      this.log('Using real AI for research');
    } else {
      this.log('Using mock AI for research');
    }
    
    // Prepare messages
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: USER_PROMPT }
    ];
    
    // Call AI provider
    const response = await provider.chat(messages, {
      temperature: 0.7,
      maxTokens: 1500
    });
    
    // Parse JSON response
    const result = this.parseAIResponse(response.content);
    
    this.log(`Research complete with ${result.preferences.length} preferences`);
    
    return result;
  } catch (error) {
    this.logError('Research failed, using fallback', error);
    return this.getFallbackResult(input.query);
  }
}
```

#### 2.2.4 Fallback Logic

When AI is unavailable or fails, use keyword-based analysis:

```typescript
private getFallbackResult(query: string): ResearchResult {
  const lowerQuery = query.toLowerCase();
  const preferences: DetectedPreference[] = [];
  const criteria: DecisionCriteria[] = [];
  
  // Keyword matching
  if (lowerQuery.includes('segur') || lowerQuery.includes('safety')) {
    preferences.push({ 
      label: 'Seguridad', 
      value: 'safety', 
      confidence: 0.9 
    });
    criteria.push({ 
      name: 'Seguridad', 
      weight: 0.30, 
      description: 'Características de seguridad' 
    });
  }
  
  // ... more keyword checks ...
  
  // Normalize weights
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight > 0) {
    criteria.forEach(c => c.weight = c.weight / totalWeight);
  }
  
  return {
    insights: 'Análisis basado en palabras clave detectadas',
    suggestedFilters: {},
    preferences,
    criteria
  };
}
```

---

### 2.3 Lead Decision Agent

**File**: `packages/api/src/agents/LeadDecisionAgent.ts`

**Type**: AI-Powered Explanation Agent

**Purpose**: Explain the decision-making strategy and reasoning behind recommendations

#### 2.3.1 Interface

**Input**:
```typescript
interface DecisionInput {
  query: string;                         // Original user query
  topRecommendations: CarRecommendation[];  // Top 3-5 matches
}
```

**Output**:
```typescript
interface DecisionExplanation {
  strategy: string;       // Decision strategy used
  reasoning: string;      // Detailed explanation
  keyFactors: string[];   // Important factors
  confidence: number;     // 0-1 confidence score
}
```

#### 2.3.2 AI Prompt Design

**System Prompt**:
```
You are the Lead Decision Agent for DecisionHub AI.

Your task:
1. Explain the decision-making strategy used
2. Provide clear reasoning for the recommendations
3. Highlight key factors that influenced the decision
4. Give a confidence assessment

Respond ONLY with valid JSON in this format:
{
  "strategy": "Brief description of the decision strategy",
  "reasoning": "Detailed explanation of why these vehicles were recommended",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3"],
  "confidence": 0.85
}

Be concise, informative, and focus on the Colombian market context.
```

**User Prompt**:
```
User Query: "Necesito un SUV seguro para mi familia, presupuesto 200 millones"

Top Recommendations:
1. Honda CR-V (Score: 85)
2. Mazda CX-5 (Score: 82)
3. Subaru Outback (Score: 80)

Explain the decision strategy and reasoning behind these recommendations.
```

#### 2.3.3 Execution Flow

```typescript
async execute(input: DecisionInput): Promise<DecisionExplanation> {
  this.log('Generating decision explanation');
  
  try {
    const provider = AIProviderFactory.getProvider();
    const isRealAI = AIProviderFactory.isRealAI();
    
    // Prepare top cars summary
    const topCars = input.topRecommendations
      .slice(0, 3)
      .map((rec, idx) => `${idx + 1}. ${rec.car.make} ${rec.car.model} (Score: ${rec.score})`)
      .join('\n');
    
    // Call AI
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `User Query: "${input.query}"\n\nTop Recommendations:\n${topCars}\n\nExplain...` }
    ];
    
    const response = await provider.chat(messages, {
      temperature: 0.7,
      maxTokens: 1000
    });
    
    const result = this.parseAIResponse(response.content);
    
    this.log('Decision explanation generated successfully');
    
    return result;
  } catch (error) {
    this.logError('Decision explanation failed, using fallback', error);
    return this.getFallbackExplanation(input);
  }
}
```

#### 2.3.4 Fallback Logic

```typescript
private getFallbackExplanation(input: DecisionInput): DecisionExplanation {
  return {
    strategy: 'Weighted Multi-Criteria Decision Analysis',
    reasoning: 'These vehicles were selected based on a comprehensive analysis...',
    keyFactors: [
      'User-stated preferences and requirements',
      'Vehicle availability in Colombian market',
      'Safety ratings and features',
      'Reliability and maintenance considerations',
      'Budget fit and value proposition'
    ],
    confidence: 0.82
  };
}
```

**Note**: This agent only runs when real AI is available, as its output is optional enhancement.

---

### 2.4 Car Recommendation Agent

**File**: `packages/api/src/agents/CarRecommendationAgent.ts`

**Type**: Scoring and Ranking Agent (No AI Required)

**Purpose**: Score and rank vehicles based on decision criteria using deterministic logic

#### 2.4.1 Interface

**Input**:
```typescript
interface RecommendationInput extends AgentInput {
  criteria?: CarSearchCriteria;
}
```

**Output**:
```typescript
interface RecommendationOutput extends AgentOutput {
  recommendations: CarRecommendation[];
}
```

#### 2.4.2 Scoring Algorithm

**Score Calculation** (0-100):

```typescript
function scoreVehicle(car: Car, criteria: CarSearchCriteria): number {
  let score = 0;
  let weights = 0;
  
  // 1. Price Fit (30% weight)
  if (criteria.maxPrice) {
    const priceFit = car.price <= criteria.maxPrice ? 100 : 0;
    score += priceFit * 0.30;
    weights += 0.30;
  }
  
  // 2. Body Type Match (20% weight)
  if (criteria.bodyTypes && criteria.bodyTypes.includes(car.bodyType)) {
    score += 100 * 0.20;
    weights += 0.20;
  }
  
  // 3. Fuel Efficiency (20% weight)
  if (car.mpg && criteria.minMpg) {
    const mpgScore = Math.min((car.mpg.combined / criteria.minMpg) * 100, 100);
    score += mpgScore * 0.20;
    weights += 0.20;
  }
  
  // 4. Features Match (20% weight)
  if (criteria.requiredFeatures) {
    const matchedFeatures = criteria.requiredFeatures.filter(
      f => car.features.includes(f)
    ).length;
    const featureScore = (matchedFeatures / criteria.requiredFeatures.length) * 100;
    score += featureScore * 0.20;
    weights += 0.20;
  }
  
  // 5. Vehicle Age (10% weight)
  const currentYear = new Date().getFullYear();
  const age = currentYear - car.year;
  const ageScore = Math.max(100 - (age * 10), 0);
  score += ageScore * 0.10;
  weights += 0.10;
  
  // Normalize to 100
  return weights > 0 ? (score / weights) : 60;  // Default 60 if no criteria
}
```

#### 2.4.3 Execution Flow

```typescript
async execute(input: RecommendationInput): Promise<RecommendationOutput> {
  this.log('Executing car recommendation logic...');
  
  const { result, executionTime } = await this.measureExecutionTime(() =>
    this.generateRecommendations(input.criteria || {})
  );
  
  this.log(`Generated ${result.length} recommendations in ${executionTime}ms`);
  
  return {
    recommendations: result
  };
}

private async generateRecommendations(
  criteria: CarSearchCriteria
): Promise<CarRecommendation[]> {
  // 1. Load all cars
  const allCars = await loadCarsData();
  
  // 2. Filter by criteria
  const filteredCars = this.filterByCriteria(allCars, criteria);
  
  // 3. Score each car
  const scored = filteredCars.map(car => ({
    car,
    score: this.scoreVehicle(car, criteria),
    reasoning: this.generateReasoning(car, criteria),
    matchedFeatures: this.getMatchedFeatures(car, criteria),
    pros: this.generatePros(car),
    cons: this.generateCons(car)
  }));
  
  // 4. Sort by score (descending)
  scored.sort((a, b) => b.score - a.score);
  
  // 5. Return top 5
  return scored.slice(0, 5);
}
```

#### 2.4.4 Reasoning Generation

```typescript
private generateReasoning(car: Car, criteria: CarSearchCriteria): string {
  const parts: string[] = [];
  
  parts.push(`The ${car.year} ${car.make} ${car.model} is a good match for your criteria.`);
  
  if (car.mpg) {
    parts.push(
      `Fuel economy is ${car.mpg.combined} MPG combined (${car.mpg.city} city / ${car.mpg.highway} highway).`
    );
  }
  
  if (criteria.maxPrice && car.price <= criteria.maxPrice) {
    parts.push('Fits within your budget.');
  }
  
  return parts.join(' ');
}
```

---

## 3. Agent Activity Tracking

### 3.1 Activity Model

```typescript
interface AgentActivity {
  agentName: string;        // "Research Agent", "Criteria Agent", etc.
  status: 'pending' | 'processing' | 'completed';
  description: string;      // Spanish description of activity
  timestamp?: string;       // ISO 8601 timestamp when completed
}
```

### 3.2 Tracking Implementation

```typescript
class NaturalLanguageRecommendationAgent extends BaseAgent {
  private agentActivity: AgentActivity[] = [];
  
  private trackActivity(activity: AgentActivity): void {
    this.agentActivity.push({
      ...activity,
      timestamp: activity.timestamp || new Date().toISOString()
    });
  }
  
  // Usage:
  this.trackActivity({
    agentName: 'Research Agent',
    status: 'processing',
    description: 'Analizando consulta del usuario'
  });
  
  // Later...
  this.trackActivity({
    agentName: 'Research Agent',
    status: 'completed',
    description: 'Análisis completado',
    timestamp: new Date().toISOString()
  });
}
```

### 3.3 Timeline Visualization

Frontend displays agent activities in real-time:

```
Research Agent
  ✓ Análisis completado
  
Criteria Agent  
  ✓ Criterios de comparación generados
  
Recommendation Agent
  ✓ 5 vehículos encontrados y clasificados
  
Lead Decision Agent
  ✓ Estrategia de decisión explicada
  
Progress: [████████████████████] 100%
```

---

## 4. AI Provider Integration

### 4.1 Provider Interface

```typescript
interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  chat(
    messages: AIMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<AIResponse>;
}
```

### 4.2 Usage Pattern in Agents

```typescript
// In any agent that needs AI
const provider = AIProviderFactory.getProvider();
const isRealAI = AIProviderFactory.isRealAI();

if (isRealAI) {
  this.log('Using real AI');
} else {
  this.log('Using mock AI');
}

try {
  const response = await provider.chat(messages, options);
  const result = JSON.parse(response.content);
  // Use result
} catch (error) {
  // Fall back to rule-based logic
  const result = this.getFallbackResult(input);
}
```

### 4.3 Graceful Degradation

```
User Query
  │
  ├─> Try GitHub Models
  │   ├─> Success → Use AI result ✅
  │   └─> Failure ⬇
  │
  ├─> Try Mock Provider
  │   ├─> Success → Use mock result ✅
  │   └─> Failure ⬇
  │
  └─> Use agent's built-in fallback ✅
```

**Guarantee**: User always gets a response, even if all AI providers fail.

---

## 5. Workflow Scenarios

### 5.1 Scenario A: Real AI Available

```
User: "Necesito un SUV seguro bajo 200 millones"
  ↓
NL Recommendation Agent
  ↓
Research Agent
  ├─> GitHub Models (GPT-4o)
  ├─> AI analyzes: Safety + Budget + SUV
  ├─> Returns: Preferences [Safety: 0.95, Family: 0.9]
  └─> Returns: Criteria [Safety: 35%, Comfort: 25%, ...]
  ↓
Car Recommendation Agent
  ├─> Filter: bodyType=SUV, price≤200M
  ├─> Score: CR-V(85), CX-5(82), Outback(80)
  └─> Return: Top 5 with reasoning
  ↓
Lead Decision Agent
  ├─> GitHub Models (GPT-4o)
  ├─> AI explains: "Weighted scoring prioritized safety..."
  └─> Returns: Strategy explanation
  ↓
Response to User
  ├─> Analysis: Safety, Family preferences detected
  ├─> Recommendations: 5 SUVs with scores
  ├─> Agent Activity: 4 agents completed
  └─> Processing Time: ~1500ms
```

### 5.2 Scenario B: Mock AI (No API Key)

```
User: "Necesito un SUV seguro bajo 200 millones"
  ↓
NL Recommendation Agent
  ↓
Research Agent
  ├─> Mock Provider (rule-based)
  ├─> Keyword match: "seguro" → Safety (0.9)
  ├─> Keyword match: "SUV" → Body Type
  ├─> Extract budget: "200 millones" → 200M COP
  └─> Returns: Basic preferences and criteria
  ↓
Car Recommendation Agent
  ├─> Filter: bodyType=SUV, price≤200M
  ├─> Score: CR-V(85), CX-5(82), Outback(80)
  └─> Return: Top 5 with reasoning
  ↓
Lead Decision Agent
  └─> SKIP (mock mode doesn't need explanation)
  ↓
Response to User
  ├─> Analysis: Safety preference detected
  ├─> Recommendations: 5 SUVs with scores
  ├─> Agent Activity: 3 agents completed
  └─> Processing Time: ~15ms
```

### 5.3 Scenario C: AI Fails Mid-Request

```
User: "SUV familiar seguro bajo 180 millones"
  ↓
NL Recommendation Agent
  ↓
Research Agent
  ├─> Try GitHub Models
  ├─> ERROR: API timeout
  └─> Fallback: Keyword-based analysis ✅
  ↓
Car Recommendation Agent
  └─> Continue normally ✅
  ↓
Response to User
  └─> Success with fallback data ✅
```

---

## 6. Performance Characteristics

### 6.1 Timing Breakdown

**With Real AI** (GitHub Models):
```
Research Agent:     800-1200ms
Criteria Agent:     (included in Research)
Recommendation:     10-20ms
Decision Agent:     500-800ms
─────────────────
Total:              1300-2000ms
```

**With Mock AI**:
```
Research Agent:     1-3ms
Criteria Agent:     (included in Research)
Recommendation:     10-20ms
Decision Agent:     (skipped)
─────────────────
Total:              11-23ms
```

### 6.2 Optimization Opportunities

**Current**:
- Sequential agent execution
- Single AI provider call per agent
- No caching

**Future**:
- Parallel agent execution where possible
- Response caching for similar queries
- Streaming AI responses
- Result memoization

---

## 7. Error Handling Strategy

### 7.1 Agent-Level Errors

```typescript
try {
  // Agent logic
  const result = await doWork();
  return result;
} catch (error) {
  this.logError('Agent failed', error);
  return fallbackResult;  // Never throw, always return something
}
```

### 7.2 Provider-Level Errors

```typescript
try {
  const response = await provider.chat(messages);
  return parseResponse(response);
} catch (error) {
  this.logError('Provider failed', error);
  // Try alternative approach or fallback
  return fallbackResult;
}
```

### 7.3 Orchestrator-Level Errors

```typescript
try {
  // Coordinate agents
  const result = await orchestrate();
  return result;
} catch (error) {
  this.logError('Orchestration failed', error);
  throw error;  // Let controller handle HTTP response
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests (Future)

**Research Agent**:
- Test AI prompt formatting
- Test JSON parsing
- Test fallback logic
- Test preference detection accuracy

**Decision Agent**:
- Test explanation generation
- Test fallback logic
- Test confidence scoring

**Recommendation Agent**:
- Test filtering logic
- Test scoring algorithm
- Test ranking
- Test edge cases (no matches, all match)

### 8.2 Integration Tests (Future)

**Full Workflow**:
- Test complete agent pipeline
- Test with mock provider
- Test with real provider (if token available)
- Test error scenarios
- Test activity tracking

### 8.3 Performance Tests (Future)

- Measure end-to-end latency
- Measure individual agent latency
- Test under load
- Test provider fallback timing

---

## 9. Future Enhancements

### 9.1 Advanced Agent Capabilities

**Conversation Memory**:
- Store conversation history
- Context-aware follow-up questions
- Reference previous recommendations

**Multi-turn Dialogue**:
- "Tell me more about the CR-V"
- "Show me cheaper options"
- "What about electric vehicles?"

**Proactive Suggestions**:
- "Have you considered hybrid options?"
- "This model has excellent safety ratings"

### 9.2 Additional Agents

**Comparison Agent**:
- Side-by-side vehicle comparison
- Highlight differences
- Recommend best choice

**Negotiation Agent**:
- Suggest negotiation strategies
- Estimate true market value
- Identify best purchase timing

**Financing Agent**:
- Calculate loan options
- Compare financing offers
- Suggest down payment strategies

---

## 10. Agent Communication Protocol

### 10.1 Message Format

All agent-to-agent communication uses typed interfaces:

```typescript
// Research → Recommendation
interface ResearchToRecommendation {
  searchCriteria: CarSearchCriteria;
  preferences: DetectedPreference[];
  criteria: DecisionCriteria[];
}

// Recommendation → Decision
interface RecommendationToDecision {
  query: string;
  topRecommendations: CarRecommendation[];
}
```

### 10.2 Event System (Future)

```typescript
// Publish-subscribe pattern for agent coordination
EventBus.publish('research.complete', {
  preferences: [...],
  criteria: [...]
});

EventBus.subscribe('research.complete', (data) => {
  // Recommendation Agent responds
  startRecommendation(data);
});
```

---

## 11. Monitoring & Observability

### 11.1 Logging

Each agent logs:
- Start of execution
- Key decisions
- AI provider usage
- Fallback activation
- Completion with timing

**Example**:
```
[2026-06-29T12:01:38.269Z] [ResearchAgent] Researching query: "SUV familiar..."
[2026-06-29T12:01:38.269Z] [ResearchAgent] Using mock AI for research
[2026-06-29T12:01:38.269Z] [ResearchAgent] Research complete with 2 preferences
```

### 11.2 Metrics (Future)

**Agent Metrics**:
- Execution time per agent
- Success/failure rates
- Fallback activation frequency
- AI provider usage per agent

**Workflow Metrics**:
- End-to-end completion time
- Agent pipeline efficiency
- Error rates by stage

---

## 12. Conclusion

The multi-agent architecture provides:

✅ **Modularity**: Each agent has focused responsibility  
✅ **Transparency**: User sees AI workflow in real-time  
✅ **Reliability**: Multiple fallback layers ensure success  
✅ **Extensibility**: Easy to add new agents or enhance existing ones  
✅ **Performance**: Optimized for both real AI and mock modes  
✅ **Maintainability**: Clean interfaces and separation of concerns

The agent workflow is the core intelligence layer of DecisionHub AI, demonstrating how specialized AI agents can collaborate to solve complex recommendation problems.

---

**Document Status**: ✅ Complete - Reflects Current MVP Implementation  
**Next Update**: After agent enhancements or new agent additions  
**Maintained By**: Development Team
