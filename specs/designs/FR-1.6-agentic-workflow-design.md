# Technical Design: FR-1.6 Agentic Decision Workflow

## Document Overview

**Feature**: FR-1.6 - Agentic Decision Workflow  
**Requirement**: [specs/features/agentic-decision-workflow.md](../features/agentic-decision-workflow.md)  
**Architect**: GitHub Copilot (Architect Agent)  
**Created**: 2026-06-29  
**Status**: 📋 Design Complete - Ready for Implementation

---

## Design Overview

**Summary**: Transform the current 3-agent recommendation system into a transparent 5-agent decision workflow with comprehensive execution tracking. Each agent has a specialized role: Intent (query parsing), Research (preference detection), Evaluation (scoring), Lead Decision (reasoning), and Recommendation (formatting). The AgentTrace system captures full execution details for transparency and debugging.

**Components Affected**:
- ➕ New: `packages/api/src/agents/IntentAgent.ts` - Query parsing and classification
- ➕ New: `packages/api/src/agents/EvaluationAgent.ts` - Weighted vehicle scoring
- ➕ New: `packages/api/src/agents/FinalRecommendationAgent.ts` - Response formatting
- ➕ New: `packages/api/src/agents/base/AgentTrace.ts` - Execution tracking system
- 🔧 Modified: `packages/api/src/agents/AgentOrchestrator.ts` - 5-agent coordination
- 🔧 Modified: `packages/api/src/agents/ResearchAgent.ts` - Integrate AgentTrace
- 🔧 Modified: `packages/api/src/agents/LeadDecisionAgent.ts` - Integrate AgentTrace
- ➕ New: `packages/shared/src/types/agentTrace.ts` - Trace type definitions
- 🔧 Modified: `packages/shared/src/types/car.ts` - Add Intent and Evaluation types
- 🔧 Modified: `packages/web/src/components/cars/AgentTimeline.tsx` - 5-agent UI
- ➕ New: `packages/web/src/components/cars/IntentSummary.tsx` - Intent display
- 🔧 Modified: `packages/web/src/components/cars/AIAnalysisPanel.tsx` - Show evaluation
- 📋 Updated: `specs/design.md` - Architecture documentation

---

## Architecture Diagram

### 5-Agent Sequential Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT                                │
│         "SUV familiar seguro bajo 180 millones"             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              AgentOrchestrator                               │
│          (Coordinates 5-agent workflow)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  AgentTrace Collector                              │    │
│  │  - Captures input/output of each agent             │    │
│  │  - Tracks timing (start, duration)                 │    │
│  │  - Serializes for API response                     │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┬──────────────────┐
    │                │                │                  │
    ▼                ▼                ▼                  ▼
┌─────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Intent  │→ │ Research │→ │ Evaluation   │→ │ Lead         │→ │ Final        │
│ Agent   │  │ Agent    │  │ Agent        │  │ Decision     │  │ Recommend.   │
│         │  │          │  │              │  │ Agent        │  │ Agent        │
└────┬────┘  └────┬─────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
     │            │                │                  │                  │
     │ Output:    │ Output:        │ Output:          │ Output:          │ Output:
     │ Intent     │ Preferences    │ Scored           │ Decision         │ Formatted
     │ Analysis   │ + Criteria     │ Vehicles         │ Explanation      │ Response
     │            │                │                  │                  │
     └────────────┴────────────────┴──────────────────┴──────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   AIRecommendationResponse    │
                    │   - recommendations[]         │
                    │   - analysis (with intent)    │
                    │   - agentActivity[]           │
                    │   - agentTrace{}              │
                    │   - processingTimeMs          │
                    └───────────────────────────────┘
```

### Data Flow Between Agents

```
Input: "SUV familiar seguro bajo 180 millones"

┌──────────────────────────────────────────────────────────────┐
│ 1. INTENT AGENT (300-500ms)                                  │
├──────────────────────────────────────────────────────────────┤
│ Extracts:                                                     │
│ • category: "SUV"                                             │
│ • budget: { max: 180000000, currency: "COP" }                │
│ • requirements: ["familiar", "seguro"]                        │
│ • queryType: "recommendation"                                 │
│ • confidence: 0.92                                            │
└────────────────────┬─────────────────────────────────────────┘
                     ├─→ AgentTrace.record()
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. RESEARCH AGENT (500-800ms with AI, 100ms mock)            │
├──────────────────────────────────────────────────────────────┤
│ Uses Intent + AI to generate:                                 │
│ • preferences: [{label: "Seguridad", value: "safety",        │
│                  confidence: 0.95}, ...]                      │
│ • criteria: [{name: "Seguridad", weight: 0.35}, ...]         │
│ • insights: "Usuario busca SUV familiar con énfasis..."      │
└────────────────────┬─────────────────────────────────────────┘
                     ├─→ AgentTrace.record()
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. EVALUATION AGENT (300-500ms)                              │
├──────────────────────────────────────────────────────────────┤
│ Scores each vehicle:                                          │
│ • Load 12 vehicles from cars.json                             │
│ • Apply weighted scoring: score = Σ(criterion_score × weight)│
│ • Filter: score >= 50                                         │
│ • Rank: Highest to lowest                                     │
│ Output: [{car, score: 87, breakdown: {...}}, ...]            │
└────────────────────┬─────────────────────────────────────────┘
                     ├─→ AgentTrace.record()
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. LEAD DECISION AGENT (600-800ms with AI, 50ms mock)        │
├──────────────────────────────────────────────────────────────┤
│ Explains top pick using AI:                                   │
│ • Takes top 3 scored vehicles                                 │
│ • Generates explanation: "El Toyota RAV4 2024 es la..."      │
│ • Compares to alternatives                                    │
│ • Uses AI if available, template if mock                      │
└────────────────────┬─────────────────────────────────────────┘
                     ├─→ AgentTrace.record()
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. FINAL RECOMMENDATION AGENT (50-100ms)                     │
├──────────────────────────────────────────────────────────────┤
│ Formats final response:                                       │
│ • Structures recommendations[] with COP formatting            │
│ • Attaches decision explanation to top pick                   │
│ • Adds pros/cons                                              │
│ • Generates agentActivity[] for timeline                      │
└────────────────────┬─────────────────────────────────────────┘
                     ▼
              Final Response
```

---

## Detailed Design

### 1. Intent Agent (NEW)

**Purpose**: Parse natural language query to extract structured intent

**Location**: `packages/api/src/agents/IntentAgent.ts`

#### Interface

```typescript
// Input
interface IntentAgentInput {
  query: string;
  currency?: Currency;
}

// Output
interface IntentAnalysis {
  category: string;                    // "SUV", "sedan", "vehicle", etc.
  budget?: {
    min?: number;
    max?: number;
    currency: Currency;
  };
  requirements: string[];              // ["familiar", "seguro", "económico"]
  queryType: 'recommendation' | 'comparison' | 'informational';
  confidence: number;                  // 0.0 - 1.0
  extractedKeywords: string[];         // All detected keywords
}
```

#### Implementation

```typescript
import { BaseAgent } from './base/BaseAgent';
import { IntentAgentInput, IntentAnalysis, Currency } from '@decisionhub/shared';

export class IntentAgent extends BaseAgent {
  name = 'IntentAgent';
  description = 'Parses natural language queries to extract structured intent';

  async execute(input: IntentAgentInput): Promise<IntentAnalysis> {
    this.log(`Parsing query: "${input.query}"`);

    const query = input.query.toLowerCase();
    const currency = input.currency || 'COP';

    // Extract category
    const category = this.extractCategory(query);
    
    // Extract budget
    const budget = this.extractBudget(query, currency);
    
    // Extract requirements/keywords
    const requirements = this.extractRequirements(query);
    
    // Classify query type
    const queryType = this.classifyQueryType(query);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(category, budget, requirements);

    return {
      category,
      budget,
      requirements,
      queryType,
      confidence,
      extractedKeywords: this.extractAllKeywords(query),
    };
  }

  private extractCategory(query: string): string {
    const categoryPatterns = {
      suv: /\b(suv|camioneta)\b/i,
      sedan: /\b(sedan|sedán)\b/i,
      truck: /\b(camión|pickup|pick-up)\b/i,
      hatchback: /\b(hatchback|compacto)\b/i,
      hybrid: /\b(híbrido|hybrid)\b/i,
      electric: /\b(eléctrico|electric|ev)\b/i,
    };

    for (const [category, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.test(query)) {
        return category;
      }
    }

    return 'vehicle'; // Generic category
  }

  private extractBudget(query: string, currency: Currency): IntentAnalysis['budget'] {
    // Match various budget patterns
    const patterns = [
      // "bajo 180 millones" or "under 180 million"
      /(?:bajo|under|hasta|up to|máximo|max)\s+(\d+)\s*(?:millones?|million)?/i,
      // "entre 100 y 200 millones"
      /(?:entre|between)\s+(\d+)\s*y\s+(\d+)\s*(?:millones?|million)?/i,
      // "180 millones" (standalone)
      /(\d+)\s*(?:millones?|million)/i,
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) {
        if (match[2]) {
          // Range: "entre 100 y 200"
          return {
            min: this.normalizeAmount(match[1], currency),
            max: this.normalizeAmount(match[2], currency),
            currency,
          };
        } else {
          // Single value: treat as max
          return {
            max: this.normalizeAmount(match[1], currency),
            currency,
          };
        }
      }
    }

    return undefined;
  }

  private normalizeAmount(value: string, currency: Currency): number {
    const num = parseInt(value, 10);
    
    // If currency is COP and value looks like millions (< 1000)
    // Convert to actual COP value
    if (currency === 'COP' && num < 1000) {
      return num * 1_000_000; // Convert millions to COP
    }
    
    return num;
  }

  private extractRequirements(query: string): string[] {
    const keywords: string[] = [];
    
    const requirementPatterns = {
      'seguro': /\b(segur[oa]s?|safety)\b/i,
      'familiar': /\b(familiar|familia|family)\b/i,
      'económico': /\b(económic[oa]|barato|affordable|económic)\b/i,
      'confiable': /\b(confiable|reliable|confiabilidad)\b/i,
      'espacioso': /\b(espacios[oa]|amplio|spacious|grande)\b/i,
      'eficiente': /\b(eficiente|efficiency|bajo consumo)\b/i,
      'moderno': /\b(moderno|modern|nuevo|reciente)\b/i,
      'tecnología': /\b(tecnología|technology|tech)\b/i,
    };

    for (const [keyword, pattern] of Object.entries(requirementPatterns)) {
      if (pattern.test(query)) {
        keywords.push(keyword);
      }
    }

    return keywords;
  }

  private classifyQueryType(query: string): IntentAnalysis['queryType'] {
    // Check for comparison indicators
    if (/\b(compar[ae]|vs|versus|diferencia|between)\b/i.test(query)) {
      return 'comparison';
    }

    // Check for informational indicators
    if (/\b(qué|what|cuál|which|cómo|how|info|información)\b/i.test(query)) {
      return 'informational';
    }

    // Default to recommendation
    return 'recommendation';
  }

  private calculateConfidence(
    category: string,
    budget: IntentAnalysis['budget'],
    requirements: string[]
  ): number {
    let confidence = 0.5; // Base confidence

    // Category specificity
    if (category !== 'vehicle') {
      confidence += 0.2;
    }

    // Budget clarity
    if (budget?.max) {
      confidence += 0.2;
    }
    if (budget?.min && budget?.max) {
      confidence += 0.1; // Range is clearer
    }

    // Requirements
    confidence += Math.min(requirements.length * 0.1, 0.2);

    return Math.min(confidence, 1.0);
  }

  private extractAllKeywords(query: string): string[] {
    // Extract all meaningful words (> 3 chars, not common stop words)
    const stopWords = new Set(['the', 'and', 'for', 'with', 'bajo', 'con', 'para', 'que', 'una', 'uno']);
    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    return [...new Set(words)]; // Unique words only
  }
}
```

#### Mock/Fallback Strategy

Intent Agent is **deterministic** (no AI required). It always uses rule-based keyword extraction and pattern matching. This ensures:
- ✅ Consistent performance (< 500ms)
- ✅ No dependency on AI provider
- ✅ Reliable demo behavior

---

### 2. AgentTrace System (NEW)

**Purpose**: Comprehensive execution tracking for transparency and debugging

**Location**: `packages/api/src/agents/base/AgentTrace.ts`

#### Interface

```typescript
// packages/shared/src/types/agentTrace.ts

export interface AgentExecution {
  agentName: string;
  startTime: string;              // ISO timestamp
  endTime?: string;               // ISO timestamp
  durationMs?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
  };
  metadata?: {
    aiProvider?: 'github' | 'mock' | 'none';
    modelId?: string;
    tokensUsed?: number;
  };
}

export interface AgentTrace {
  workflowId: string;              // Unique ID for this workflow execution
  startTime: string;
  endTime?: string;
  totalDurationMs?: number;
  status: 'in-progress' | 'completed' | 'failed';
  executions: AgentExecution[];
}
```

#### Implementation

```typescript
// packages/api/src/agents/base/AgentTrace.ts

import { AgentTrace, AgentExecution } from '@decisionhub/shared';
import { randomUUID } from 'crypto';

export class AgentTraceCollector {
  private trace: AgentTrace;

  constructor() {
    this.trace = {
      workflowId: randomUUID(),
      startTime: new Date().toISOString(),
      status: 'in-progress',
      executions: [],
    };
  }

  /**
   * Start tracking an agent execution
   */
  startAgent(agentName: string, input: Record<string, unknown>): void {
    const execution: AgentExecution = {
      agentName,
      startTime: new Date().toISOString(),
      status: 'processing',
      input,
    };

    this.trace.executions.push(execution);
  }

  /**
   * Complete tracking for an agent execution
   */
  completeAgent(
    agentName: string,
    output: Record<string, unknown>,
    metadata?: AgentExecution['metadata']
  ): void {
    const execution = this.trace.executions.find(
      e => e.agentName === agentName && e.status === 'processing'
    );

    if (!execution) {
      console.warn(`No processing execution found for agent: ${agentName}`);
      return;
    }

    const endTime = new Date().toISOString();
    const durationMs = new Date(endTime).getTime() - new Date(execution.startTime).getTime();

    execution.endTime = endTime;
    execution.durationMs = durationMs;
    execution.status = 'completed';
    execution.output = output;
    execution.metadata = metadata;
  }

  /**
   * Record an agent failure
   */
  failAgent(agentName: string, error: Error): void {
    const execution = this.trace.executions.find(
      e => e.agentName === agentName && e.status === 'processing'
    );

    if (!execution) {
      console.warn(`No processing execution found for agent: ${agentName}`);
      return;
    }

    const endTime = new Date().toISOString();
    const durationMs = new Date(endTime).getTime() - new Date(execution.startTime).getTime();

    execution.endTime = endTime;
    execution.durationMs = durationMs;
    execution.status = 'failed';
    execution.error = {
      message: error.message,
      stack: error.stack,
    };
  }

  /**
   * Finalize the trace
   */
  finalize(status: 'completed' | 'failed'): AgentTrace {
    const endTime = new Date().toISOString();
    const totalDurationMs = new Date(endTime).getTime() - new Date(this.trace.startTime).getTime();

    this.trace.endTime = endTime;
    this.trace.totalDurationMs = totalDurationMs;
    this.trace.status = status;

    return this.trace;
  }

  /**
   * Get current trace state
   */
  getTrace(): AgentTrace {
    return { ...this.trace };
  }

  /**
   * Serialize for JSON response (omit stack traces in production)
   */
  serialize(includeStacks = false): AgentTrace {
    const trace = { ...this.trace };
    
    if (!includeStacks) {
      trace.executions = trace.executions.map(exec => {
        const sanitized = { ...exec };
        if (sanitized.error?.stack) {
          delete sanitized.error.stack;
        }
        return sanitized;
      });
    }

    return trace;
  }
}
```

#### Usage in Agents

Agents will be updated to integrate with AgentTrace:

```typescript
// Example: ResearchAgent with trace integration
async execute(input: NaturalLanguageRequest, traceCollector?: AgentTraceCollector): Promise<ResearchResult> {
  traceCollector?.startAgent(this.name, { query: input.query, currency: input.currency });

  try {
    const result = await this.doResearch(input);
    
    traceCollector?.completeAgent(this.name, {
      preferences: result.preferences,
      criteriaCount: result.criteria.length,
    }, {
      aiProvider: AIProviderFactory.isRealAI() ? 'github' : 'mock',
    });

    return result;
  } catch (error) {
    traceCollector?.failAgent(this.name, error as Error);
    throw error;
  }
}
```

---

### 3. Evaluation Agent (NEW)

**Purpose**: Score and rank vehicles using weighted criteria

**Location**: `packages/api/src/agents/EvaluationAgent.ts`

#### Interface

```typescript
// Input
interface EvaluationInput {
  vehicles: Car[];
  criteria: DecisionCriteria[];   // From Research Agent
  intent: IntentAnalysis;          // From Intent Agent
}

// Output
interface EvaluationResult {
  scoredVehicles: ScoredVehicle[];
  evaluationSummary: {
    totalEvaluated: number;
    meetsThreshold: number;
    averageScore: number;
  };
}

interface ScoredVehicle {
  car: Car;
  finalScore: number;              // 0-100
  scoreBreakdown: {
    criterion: string;
    weight: number;
    rawScore: number;              // 0-100
    weightedScore: number;         // rawScore * weight
  }[];
  meetsRequirements: boolean;
}
```

#### Implementation

```typescript
import { BaseAgent } from './base/BaseAgent';
import { Car, DecisionCriteria, IntentAnalysis } from '@decisionhub/shared';

export class EvaluationAgent extends BaseAgent {
  name = 'EvaluationAgent';
  description = 'Scores and ranks vehicles using weighted decision criteria';

  async execute(input: EvaluationInput): Promise<EvaluationResult> {
    this.log(`Evaluating ${input.vehicles.length} vehicles with ${input.criteria.length} criteria`);

    const scoredVehicles = input.vehicles.map(car => 
      this.scoreVehicle(car, input.criteria, input.intent)
    );

    // Filter vehicles below threshold (score < 50)
    const meetsThreshold = scoredVehicles.filter(sv => sv.finalScore >= 50);

    // Sort by score (highest first)
    meetsThreshold.sort((a, b) => b.finalScore - a.finalScore);

    const averageScore = meetsThreshold.length > 0
      ? meetsThreshold.reduce((sum, sv) => sum + sv.finalScore, 0) / meetsThreshold.length
      : 0;

    return {
      scoredVehicles: meetsThreshold,
      evaluationSummary: {
        totalEvaluated: input.vehicles.length,
        meetsThreshold: meetsThreshold.length,
        averageScore: Math.round(averageScore),
      },
    };
  }

  private scoreVehicle(
    car: Car,
    criteria: DecisionCriteria[],
    intent: IntentAnalysis
  ): ScoredVehicle {
    const scoreBreakdown: ScoredVehicle['scoreBreakdown'] = [];
    let finalScore = 0;

    // Score each criterion
    for (const criterion of criteria) {
      const rawScore = this.scoreCriterion(car, criterion, intent);
      const weightedScore = rawScore * criterion.weight;
      
      scoreBreakdown.push({
        criterion: criterion.name,
        weight: criterion.weight,
        rawScore: Math.round(rawScore),
        weightedScore: Math.round(weightedScore),
      });

      finalScore += weightedScore;
    }

    // Budget penalty/bonus
    if (intent.budget?.max) {
      const budgetScore = this.scoreBudgetFit(car.price, intent.budget.max);
      finalScore += budgetScore * 0.1; // 10% weight for budget fit
    }

    return {
      car,
      finalScore: Math.round(Math.min(finalScore, 100)),
      scoreBreakdown,
      meetsRequirements: finalScore >= 50,
    };
  }

  private scoreCriterion(
    car: Car,
    criterion: DecisionCriteria,
    intent: IntentAnalysis
  ): number {
    // Map criterion name to scoring logic
    const criterionLower = criterion.name.toLowerCase();

    if (criterionLower.includes('segur') || criterionLower.includes('safety')) {
      return this.scoreSafety(car);
    }
    if (criterionLower.includes('confiab') || criterionLower.includes('reliab')) {
      return this.scoreReliability(car);
    }
    if (criterionLower.includes('comod') || criterionLower.includes('comfort')) {
      return this.scoreComfort(car);
    }
    if (criterionLower.includes('eficien') || criterionLower.includes('efficienc')) {
      return this.scoreEfficiency(car);
    }
    if (criterionLower.includes('tecnol') || criterionLower.includes('tech')) {
      return this.scoreTechnology(car);
    }

    // Default: feature matching
    return this.scoreFeatureMatch(car, intent.requirements);
  }

  private scoreSafety(car: Car): number {
    let score = 50; // Base score

    // Check safety features
    const safetyFeatures = [
      'airbag', 'abs', 'control de estabilidad', 'stability control',
      'lane assist', 'asistencia de carril', 'frenado automático',
      'automatic braking', 'cámara trasera', 'backup camera'
    ];

    const matches = safetyFeatures.filter(feature =>
      car.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
    );

    score += Math.min(matches.length * 8, 50);

    return Math.min(score, 100);
  }

  private scoreReliability(car: Car): number {
    let score = 50;

    // Age factor (newer = potentially more reliable)
    const age = new Date().getFullYear() - car.year;
    if (age <= 2) score += 30;
    else if (age <= 5) score += 20;
    else if (age <= 8) score += 10;

    // Toyota/Honda/Mazda get reliability bonus
    const reliableBrands = ['toyota', 'honda', 'mazda', 'lexus'];
    if (reliableBrands.includes(car.make.toLowerCase())) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private scoreComfort(car: Car): number {
    let score = 50;

    // Seating capacity
    if (car.specifications?.seating) {
      if (car.specifications.seating >= 7) score += 25;
      else if (car.specifications.seating >= 5) score += 15;
    }

    // Comfort features
    const comfortFeatures = [
      'leather', 'cuero', 'climatizador', 'climate control',
      'heated seats', 'asientos calefactables', 'panoramic',
      'sunroof', 'techo panorámico'
    ];

    const matches = comfortFeatures.filter(feature =>
      car.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
    );

    score += Math.min(matches.length * 5, 25);

    return Math.min(score, 100);
  }

  private scoreEfficiency(car: Car): number {
    if (!car.mpg) return 50; // Neutral if no MPG data

    let score = 0;

    // MPG thresholds
    const combined = car.mpg.combined;
    if (combined >= 40) score = 100;
    else if (combined >= 35) score = 90;
    else if (combined >= 30) score = 80;
    else if (combined >= 25) score = 70;
    else if (combined >= 20) score = 60;
    else score = 40;

    // Hybrid/Electric bonus
    if (car.fuelType === 'hybrid' || car.fuelType === 'plugin-hybrid') {
      score = Math.min(score + 10, 100);
    }
    if (car.fuelType === 'electric') {
      score = 100;
    }

    return score;
  }

  private scoreTechnology(car: Car): number {
    let score = 50;

    // Technology features
    const techFeatures = [
      'infotainment', 'apple carplay', 'android auto',
      'navigation', 'navegación', 'bluetooth', 'usb',
      'wireless charging', 'carga inalámbrica', 'digital',
      'touchscreen', 'pantalla táctil'
    ];

    const matches = techFeatures.filter(feature =>
      car.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
    );

    score += Math.min(matches.length * 7, 50);

    return Math.min(score, 100);
  }

  private scoreFeatureMatch(car: Car, requirements: string[]): number {
    if (requirements.length === 0) return 70; // Neutral

    let matched = 0;
    for (const req of requirements) {
      if (car.features.some(f => f.toLowerCase().includes(req.toLowerCase()))) {
        matched++;
      }
    }

    const matchRate = matched / requirements.length;
    return Math.round(50 + (matchRate * 50)); // 50-100 based on match rate
  }

  private scoreBudgetFit(price: number, maxBudget: number): number {
    const ratio = price / maxBudget;

    if (ratio <= 0.8) return 10;  // Well under budget
    if (ratio <= 0.9) return 5;   // Under budget
    if (ratio <= 1.0) return 0;   // At budget
    if (ratio <= 1.1) return -5;  // Slightly over
    return -10;                   // Over budget
  }
}
```

#### Mock/Fallback Strategy

Evaluation Agent is **deterministic** (no AI required). It uses rule-based scoring logic with weighted criteria. Always reliable.

---

### 4. Final Recommendation Agent (NEW)

**Purpose**: Format final response with proper COP currency and structure

**Location**: `packages/api/src/agents/FinalRecommendationAgent.ts`

#### Interface

```typescript
// Input
interface FinalRecommendationInput {
  scoredVehicles: ScoredVehicle[];      // From Evaluation Agent
  decisionExplanation?: string;         // From Lead Decision Agent
  intent: IntentAnalysis;
  currency: Currency;
}

// Output
interface FinalRecommendationOutput {
  recommendations: CarRecommendation[];  // Formatted for UI
  summary: {
    totalRecommendations: number;
    averageScore: number;
    topScore: number;
  };
}
```

#### Implementation

```typescript
import { BaseAgent } from './base/BaseAgent';
import { CarRecommendation, ScoredVehicle, Currency } from '@decisionhub/shared';
import { formatCurrency } from '@decisionhub/shared';

export class FinalRecommendationAgent extends BaseAgent {
  name = 'FinalRecommendationAgent';
  description = 'Formats final recommendations with proper currency and structure';

  async execute(input: FinalRecommendationInput): Promise<FinalRecommendationOutput> {
    this.log(`Formatting ${input.scoredVehicles.length} recommendations`);

    // Take top 5 scored vehicles
    const topVehicles = input.scoredVehicles.slice(0, 5);

    const recommendations: CarRecommendation[] = topVehicles.map((scored, index) => ({
      car: scored.car,
      score: scored.finalScore,
      reasoning: index === 0 && input.decisionExplanation
        ? input.decisionExplanation
        : this.generateReasoning(scored, input.intent, input.currency),
      matchedFeatures: this.extractMatchedFeatures(scored, input.intent),
      pros: this.generatePros(scored),
      cons: this.generateCons(scored, input.intent),
    }));

    const averageScore = recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length;
    const topScore = recommendations[0]?.score || 0;

    return {
      recommendations,
      summary: {
        totalRecommendations: recommendations.length,
        averageScore: Math.round(averageScore),
        topScore,
      },
    };
  }

  private generateReasoning(
    scored: ScoredVehicle,
    intent: IntentAnalysis,
    currency: Currency
  ): string {
    const car = scored.car;
    const parts: string[] = [];

    // Opening statement
    if (scored.finalScore >= 80) {
      parts.push(`El ${car.year} ${car.make} ${car.model} es una excelente opción para tus necesidades.`);
    } else if (scored.finalScore >= 65) {
      parts.push(`El ${car.year} ${car.make} ${car.model} es una buena opción que cumple con tus criterios.`);
    } else {
      parts.push(`El ${car.year} ${car.make} ${car.model} es una opción que considera tus preferencias.`);
    }

    // Budget fit
    if (intent.budget?.max) {
      const priceFormatted = formatCurrency(car.price, currency);
      const budgetFormatted = formatCurrency(intent.budget.max, currency);
      const ratio = (car.price / intent.budget.max) * 100;
      
      if (ratio <= 90) {
        parts.push(`Con un precio de ${priceFormatted}, está bien dentro de tu presupuesto de ${budgetFormatted}.`);
      } else if (ratio <= 100) {
        parts.push(`Tiene un precio de ${priceFormatted}, ajustándose a tu presupuesto de ${budgetFormatted}.`);
      }
    }

    // Top criteria
    const topCriteria = scored.scoreBreakdown
      .sort((a, b) => b.weightedScore - a.weightedScore)
      .slice(0, 2);

    if (topCriteria.length > 0) {
      const criteria = topCriteria.map(c => c.criterion.toLowerCase()).join(' y ');
      parts.push(`Destaca especialmente en ${criteria}.`);
    }

    return parts.join(' ');
  }

  private extractMatchedFeatures(scored: ScoredVehicle, intent: IntentAnalysis): string[] {
    const matched: string[] = [];
    
    for (const req of intent.requirements) {
      const feature = scored.car.features.find(f =>
        f.toLowerCase().includes(req.toLowerCase())
      );
      if (feature) {
        matched.push(feature);
      }
    }

    return matched;
  }

  private generatePros(scored: ScoredVehicle): string[] {
    const pros: string[] = [];
    const car = scored.car;

    // Top scoring criteria become pros
    const topScores = scored.scoreBreakdown
      .filter(sb => sb.rawScore >= 70)
      .sort((a, b) => b.rawScore - a.rawScore)
      .slice(0, 4);

    for (const score of topScores) {
      pros.push(`${score.criterion}: ${score.rawScore}/100`);
    }

    // Age bonus
    const age = new Date().getFullYear() - car.year;
    if (age <= 2) {
      pros.push('Modelo reciente');
    }

    // Fuel efficiency
    if (car.mpg && car.mpg.combined >= 30) {
      pros.push(`Eficiencia de combustible: ${car.mpg.combined} MPG`);
    }

    return pros.slice(0, 5); // Max 5 pros
  }

  private generateCons(scored: ScoredVehicle, intent: IntentAnalysis): string[] {
    const cons: string[] = [];
    const car = scored.car;

    // Budget concerns
    if (intent.budget?.max && car.price > intent.budget.max) {
      const over = ((car.price / intent.budget.max) - 1) * 100;
      cons.push(`Supera el presupuesto en ${Math.round(over)}%`);
    }

    // Low scoring criteria become cons
    const lowScores = scored.scoreBreakdown
      .filter(sb => sb.rawScore < 60)
      .sort((a, b) => a.rawScore - b.rawScore)
      .slice(0, 2);

    for (const score of lowScores) {
      cons.push(`${score.criterion} podría mejorar (${score.rawScore}/100)`);
    }

    // Age concern
    const age = new Date().getFullYear() - car.year;
    if (age > 5) {
      cons.push(`Modelo del ${car.year} (${age} años)`);
    }

    return cons.slice(0, 3); // Max 3 cons
  }
}
```

---

### 5. Enhanced AgentOrchestrator

**Purpose**: Coordinate 5-agent workflow with AgentTrace collection

**Location**: `packages/api/src/agents/AgentOrchestrator.ts` (MODIFY)

#### Implementation

```typescript
import { BaseAgent } from './base/BaseAgent';
import { AgentTraceCollector } from './base/AgentTrace';
import { IntentAgent } from './IntentAgent';
import { ResearchAgent } from './ResearchAgent';
import { EvaluationAgent } from './EvaluationAgent';
import { LeadDecisionAgent } from './LeadDecisionAgent';
import { FinalRecommendationAgent } from './FinalRecommendationAgent';
import { loadCarsData } from '../data/mockData';
import {
  NaturalLanguageRequest,
  AIRecommendationResponse,
  AgentActivity,
  AgentTrace as AgentTraceType,
} from '@decisionhub/shared';

export class AgentOrchestrator extends BaseAgent {
  name = 'AgentOrchestrator';
  description = 'Coordinates 5-agent decision workflow';

  private intentAgent = new IntentAgent();
  private researchAgent = new ResearchAgent();
  private evaluationAgent = new EvaluationAgent();
  private decisionAgent = new LeadDecisionAgent();
  private recommendationAgent = new FinalRecommendationAgent();

  async execute(input: NaturalLanguageRequest): Promise<AIRecommendationResponse> {
    const startTime = Date.now();
    const traceCollector = new AgentTraceCollector();
    const agentActivity: AgentActivity[] = [];

    try {
      this.log('Starting 5-agent decision workflow...');

      // AGENT 1: Intent Agent
      agentActivity.push({
        agentName: 'Intent Agent',
        status: 'processing',
        description: 'Analizando estructura de la consulta',
      });

      traceCollector.startAgent('IntentAgent', { query: input.query, currency: input.currency });
      const intent = await this.intentAgent.execute({
        query: input.query,
        currency: input.currency || 'COP',
      });
      traceCollector.completeAgent('IntentAgent', {
        category: intent.category,
        confidence: intent.confidence,
        requirements: intent.requirements,
      });

      agentActivity.push({
        agentName: 'Intent Agent',
        status: 'completed',
        description: `Detectado: ${intent.category} | Confianza: ${Math.round(intent.confidence * 100)}%`,
        timestamp: new Date().toISOString(),
      });

      this.log(`Intent: ${intent.category}, confidence: ${intent.confidence}`);

      // AGENT 2: Research Agent
      agentActivity.push({
        agentName: 'Research Agent',
        status: 'processing',
        description: 'Analizando preferencias con AI',
      });

      traceCollector.startAgent('ResearchAgent', { intent });
      const research = await this.researchAgent.execute(input);
      traceCollector.completeAgent('ResearchAgent', {
        preferences: research.preferences,
        criteriaCount: research.criteria.length,
      });

      agentActivity.push({
        agentName: 'Research Agent',
        status: 'completed',
        description: `${research.preferences.length} preferencias detectadas`,
        timestamp: new Date().toISOString(),
      });

      this.log(`Research: ${research.preferences.length} preferences, ${research.criteria.length} criteria`);

      // AGENT 3: Evaluation Agent
      agentActivity.push({
        agentName: 'Evaluation Agent',
        status: 'processing',
        description: 'Evaluando y clasificando vehículos',
      });

      traceCollector.startAgent('EvaluationAgent', {
        criteriaCount: research.criteria.length,
      });

      const allVehicles = await loadCarsData();
      const evaluation = await this.evaluationAgent.execute({
        vehicles: allVehicles,
        criteria: research.criteria,
        intent,
      });

      traceCollector.completeAgent('EvaluationAgent', {
        evaluated: evaluation.evaluationSummary.totalEvaluated,
        qualified: evaluation.evaluationSummary.meetsThreshold,
      });

      agentActivity.push({
        agentName: 'Evaluation Agent',
        status: 'completed',
        description: `${evaluation.scoredVehicles.length} vehículos calificados`,
        timestamp: new Date().toISOString(),
      });

      this.log(`Evaluation: ${evaluation.scoredVehicles.length} vehicles qualified`);

      // AGENT 4: Lead Decision Agent (Optional - only if real AI)
      let decisionExplanation: string | undefined;

      if (evaluation.scoredVehicles.length > 0) {
        agentActivity.push({
          agentName: 'Lead Decision Agent',
          status: 'processing',
          description: 'Generando explicación de decisión',
        });

        traceCollector.startAgent('LeadDecisionAgent', {
          topVehicles: evaluation.scoredVehicles.slice(0, 3).map(sv => sv.car.model),
        });

        try {
          const decision = await this.decisionAgent.execute({
            query: input.query,
            topRecommendations: evaluation.scoredVehicles.slice(0, 3).map(sv => ({
              car: sv.car,
              score: sv.finalScore,
              reasoning: '',
              matchedFeatures: [],
              pros: [],
              cons: [],
            })),
          });

          decisionExplanation = decision.strategy;
          traceCollector.completeAgent('LeadDecisionAgent', { explanationLength: decision.strategy.length });

          agentActivity.push({
            agentName: 'Lead Decision Agent',
            status: 'completed',
            description: 'Explicación de decisión generada',
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          this.logError('Lead Decision Agent failed, continuing without explanation', error as Error);
          traceCollector.failAgent('LeadDecisionAgent', error as Error);
          
          agentActivity.push({
            agentName: 'Lead Decision Agent',
            status: 'completed',
            description: 'Modo de respaldo utilizado',
            timestamp: new Date().toISOString(),
          });
        }
      }

      // AGENT 5: Final Recommendation Agent
      agentActivity.push({
        agentName: 'Final Recommendation Agent',
        status: 'processing',
        description: 'Formateando recomendaciones finales',
      });

      traceCollector.startAgent('FinalRecommendationAgent', {
        vehicleCount: evaluation.scoredVehicles.length,
      });

      const final = await this.recommendationAgent.execute({
        scoredVehicles: evaluation.scoredVehicles,
        decisionExplanation,
        intent,
        currency: input.currency || 'COP',
      });

      traceCollector.completeAgent('FinalRecommendationAgent', {
        recommendationCount: final.recommendations.length,
      });

      agentActivity.push({
        agentName: 'Final Recommendation Agent',
        status: 'completed',
        description: `${final.recommendations.length} recomendaciones formateadas`,
        timestamp: new Date().toISOString(),
      });

      this.log(`Final: ${final.recommendations.length} recommendations formatted`);

      // Finalize trace
      const agentTrace = traceCollector.finalize('completed');
      const processingTimeMs = Date.now() - startTime;

      this.log(`Workflow completed in ${processingTimeMs}ms`);

      // Build enhanced analysis
      const analysis = {
        category: intent.category,
        budget: intent.budget,
        detectedPreferences: research.preferences,
        decisionCriteria: research.criteria,
        searchCriteria: {
          maxPrice: intent.budget?.max,
          bodyTypes: intent.category !== 'vehicle' ? [intent.category as any] : undefined,
        },
        originalQuery: input.query,
        intent, // NEW: Include intent analysis
      };

      return {
        analysis,
        recommendations: final.recommendations,
        agentActivity,
        processingTimeMs,
        agentTrace, // NEW: Include trace
      };

    } catch (error) {
      this.logError('Workflow failed', error as Error);
      traceCollector.finalize('failed');
      throw error;
    }
  }
}
```

---

### 6. Frontend: Enhanced AgentTimeline Component

**Location**: `packages/web/src/components/cars/AgentTimeline.tsx` (MODIFY)

#### Enhanced Implementation

```typescript
import { AgentActivity } from '@decisionhub/shared';
import { useState } from 'react';

interface AgentTimelineProps {
  activities: AgentActivity[];
  className?: string;
}

// Agent metadata for display
const AGENT_INFO = {
  'Intent Agent': {
    icon: '🎯',
    description: 'Analiza la estructura de tu consulta',
  },
  'Research Agent': {
    icon: '🔍',
    description: 'Detecta tus preferencias con AI',
  },
  'Evaluation Agent': {
    icon: '📊',
    description: 'Evalúa y clasifica vehículos',
  },
  'Lead Decision Agent': {
    icon: '🤔',
    description: 'Explica la mejor recomendación',
  },
  'Final Recommendation Agent': {
    icon: '✨',
    description: 'Formatea la respuesta final',
  },
};

export default function AgentTimeline({ activities, className = '' }: AgentTimelineProps) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const completedCount = activities.filter(a => a.status === 'completed').length;
  const progressPercent = activities.length > 0 
    ? (completedCount / activities.length) * 100 
    : 0;

  const toggleAgent = (agentName: string) => {
    setExpandedAgent(expandedAgent === agentName ? null : agentName);
  };

  return (
    <div className={`card bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-2 border-purple-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          Flujo de Decisión AI
        </h3>
        <div className="text-sm font-semibold text-purple-700">
          {completedCount}/{activities.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          {progressPercent === 100 
            ? '¡Análisis completo!' 
            : 'Procesando tu solicitud...'}
        </p>
      </div>

      {/* Agent Timeline */}
      <div className="space-y-2">
        {activities.map((activity, index) => {
          const agentInfo = AGENT_INFO[activity.agentName as keyof typeof AGENT_INFO] || {
            icon: '⚙️',
            description: activity.description,
          };
          const isExpanded = expandedAgent === activity.agentName;

          return (
            <div
              key={index}
              className={`
                bg-white rounded-lg shadow-sm transition-all duration-300
                ${activity.status === 'processing' ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                ${activity.status === 'completed' ? 'hover:shadow-md' : ''}
                ${isExpanded ? 'ring-2 ring-purple-300' : ''}
              `}
            >
              {/* Agent Row */}
              <div
                className="flex items-start gap-4 p-4 cursor-pointer"
                onClick={() => activity.status === 'completed' && toggleAgent(activity.agentName)}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-xl
                    ${activity.status === 'completed' ? 'bg-green-100' : ''}
                    ${activity.status === 'processing' ? 'bg-blue-100' : ''}
                    ${activity.status === 'pending' ? 'bg-gray-100' : ''}
                  `}>
                    {activity.status === 'processing' && (
                      <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    {activity.status === 'completed' && (
                      <span>{agentInfo.icon}</span>
                    )}
                    {activity.status === 'pending' && (
                      <span className="text-gray-400">○</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-gray-900">
                      {activity.agentName}
                    </h4>
                    {activity.status === 'completed' && activity.timestamp && (
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-1">
                    {agentInfo.description}
                  </p>
                  
                  <p className="text-sm text-gray-800 font-medium">
                    {activity.description}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {activity.status === 'completed' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      ✓ Listo
                    </span>
                  )}
                  {activity.status === 'processing' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 animate-pulse">
                      ⏳ Activo
                    </span>
                  )}
                  {activity.status === 'pending' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                      ○ Espera
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Details (Only for completed agents) */}
              {isExpanded && activity.status === 'completed' && (
                <div className="px-4 pb-4 border-t border-gray-100 mt-2 pt-3">
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Estado:</strong> Completado exitosamente</p>
                    {activity.timestamp && (
                      <p>
                        <strong>Completado:</strong>{' '}
                        {new Date(activity.timestamp).toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{activities.length}</div>
              <div className="text-xs text-gray-600">Agentes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-xs text-gray-600">Completos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {activities.filter(a => a.status === 'processing').length}
              </div>
              <div className="text-xs text-gray-600">Activos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 7. Frontend: Intent Summary Component (NEW)

**Location**: `packages/web/src/components/cars/IntentSummary.tsx`

```typescript
import { IntentAnalysis } from '@decisionhub/shared';
import { formatCurrency } from '@decisionhub/shared';

interface IntentSummaryProps {
  intent: IntentAnalysis;
}

export default function IntentSummary({ intent }: IntentSummaryProps) {
  return (
    <div className="card bg-blue-50 border-2 border-blue-200">
      <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="text-xl">🎯</span>
        Entendí tu Solicitud
      </h3>

      <div className="space-y-3">
        {/* Category */}
        <div>
          <span className="text-xs font-semibold text-gray-600 uppercase">Categoría</span>
          <div className="mt-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {intent.category === 'vehicle' ? 'Vehículo' : intent.category.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Budget */}
        {intent.budget && (
          <div>
            <span className="text-xs font-semibold text-gray-600 uppercase">Presupuesto</span>
            <div className="mt-1 text-sm text-gray-800">
              {intent.budget.min && intent.budget.max ? (
                <>
                  Entre {formatCurrency(intent.budget.min, intent.budget.currency)} y{' '}
                  {formatCurrency(intent.budget.max, intent.budget.currency)}
                </>
              ) : intent.budget.max ? (
                <>Hasta {formatCurrency(intent.budget.max, intent.budget.currency)}</>
              ) : (
                <>Desde {formatCurrency(intent.budget.min!, intent.budget.currency)}</>
              )}
            </div>
          </div>
        )}

        {/* Requirements */}
        {intent.requirements.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-gray-600 uppercase">Requisitos Clave</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {intent.requirements.map((req, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 border border-gray-300"
                >
                  {req}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Confidence */}
        <div>
          <span className="text-xs font-semibold text-gray-600 uppercase">Confianza</span>
          <div className="mt-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    intent.confidence >= 0.8
                      ? 'bg-green-500'
                      : intent.confidence >= 0.6
                      ? 'bg-yellow-500'
                      : 'bg-orange-500'
                  }`}
                  style={{ width: `${intent.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700">
                {Math.round(intent.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Technology Choices

### No New Dependencies
- ✅ All agents use existing TypeScript patterns
- ✅ AgentTrace uses native `crypto.randomUUID()`
- ✅ Frontend uses existing React + Tailwind
- ✅ No additional npm packages required

### Patterns Used
- **Template Method Pattern**: BaseAgent provides structure
- **Strategy Pattern**: Different scoring strategies per criterion
- **Observer Pattern**: AgentTrace observes agent executions
- **Chain of Responsibility**: Sequential agent workflow

---

## Integration Points

### Existing Systems

**1. API Endpoint** (No changes needed)
- Existing `POST /api/cars/recommend/nl` works as-is
- Response type `AIRecommendationResponse` extended with `agentTrace` and `intent`

**2. Shared Types** (Extensions)
- Add `AgentTrace`, `AgentExecution` interfaces
- Add `IntentAnalysis`, `EvaluationResult` interfaces
- Extend `AIAnalysis` to include `intent` field
- Extend `AIRecommendationResponse` to include `agentTrace` field

**3. Frontend Pages** (Minimal changes)
- `CarSearchPage.tsx`: Already displays `AgentTimeline` (just pass new activities)
- Add `IntentSummary` component display
- `AIAnalysisPanel.tsx`: Optionally show evaluation scores

**API Contract**:
```typescript
// Response structure (extended)
interface AIRecommendationResponse {
  analysis: AIAnalysis & {
    intent?: IntentAnalysis;  // NEW
  };
  recommendations: CarRecommendation[];
  agentActivity: AgentActivity[];
  processingTimeMs: number;
  agentTrace?: AgentTrace;    // NEW
}
```

---

## Performance Considerations

### Target Latency Breakdown

| Agent | Target (Real AI) | Target (Mock) | Notes |
|-------|------------------|---------------|-------|
| Intent Agent | 300-500ms | 300-500ms | Deterministic |
| Research Agent | 500-800ms | 50-100ms | AI call if available |
| Evaluation Agent | 300-500ms | 300-500ms | Deterministic |
| Lead Decision Agent | 600-800ms | 20-50ms | AI call if available |
| Final Recommendation | 50-100ms | 50-100ms | Deterministic |
| **Total** | **1.8-2.8s** | **0.7-1.2s** | **< 3s target ✅** |

### Scalability
- Current MVP: 12 vehicles (instant evaluation)
- Future: 100+ vehicles would need optimization
  - Pre-compute some scores
  - Parallel evaluation
  - Caching

### Optimization Strategies
1. **Parallel where possible** (currently sequential by design for demo)
2. **Memoize vehicle scores** if same criteria repeated
3. **Lazy load agentTrace** (only serialize when needed)
4. **Timeout protection** at orchestrator level (10s max)

---

## Security Considerations

### Input Validation
- ✅ Query length limit: 1000 characters (already enforced)
- ✅ Currency validation: Only 'COP' | 'USD' | 'EUR'
- ✅ No SQL injection risk (using JSON files)

### Authorization
- ✅ Public API (no auth needed for MVP)
- ✅ Future: Rate limiting on `/api/cars/recommend/nl`

### Data Protection
- ✅ No PII collected
- ✅ AgentTrace doesn't log sensitive data
- ✅ Stack traces removed from production responses

### Error Exposure
- ✅ User-facing errors in Spanish
- ✅ Technical details only in agentTrace (dev mode)
- ✅ Fallback on any agent failure

---

## Testing Strategy

### Unit Tests

**Intent Agent**:
- ✅ Extracts category correctly ("SUV", "sedan", etc.)
- ✅ Parses budget from "bajo 180 millones"
- ✅ Parses budget range from "entre 100 y 200 millones"
- ✅ Extracts requirements ("seguro", "familiar")
- ✅ Classifies query type ("recommendation", "comparison")
- ✅ Calculates confidence score accurately

**Evaluation Agent**:
- ✅ Scores vehicles correctly by criteria
- ✅ Applies weighted scoring properly
- ✅ Filters vehicles below threshold (< 50)
- ✅ Ranks vehicles by final score
- ✅ Budget fit scoring works
- ✅ All scoring methods (safety, reliability, comfort, etc.) work

**AgentTrace**:
- ✅ Records agent start correctly
- ✅ Records agent completion with timing
- ✅ Records agent failure with error
- ✅ Calculates total duration correctly
- ✅ Serializes without stack traces

**Final Recommendation Agent**:
- ✅ Formats recommendations correctly
- ✅ Attaches decision explanation to top pick
- ✅ Generates pros/cons appropriately
- ✅ Formats COP currency properly

### Integration Tests

**End-to-End Workflow**:
1. Submit query: "SUV familiar seguro bajo 180 millones"
2. Verify Intent Agent extracts: category=SUV, budget.max=180000000
3. Verify Research Agent generates criteria
4. Verify Evaluation Agent scores 12 vehicles
5. Verify Lead Decision Agent generates explanation (if real AI)
6. Verify Final Recommendation Agent returns 5 recommendations
7. Verify agentActivity has 5 entries (all completed)
8. Verify agentTrace has 5 executions
9. Verify total time < 3s

**Fallback Testing**:
- Disable GitHub token → Verify mock providers work
- Simulate Research Agent failure → Verify workflow continues
- Simulate Decision Agent failure → Verify workflow completes without explanation

### Manual Testing

**Demo Scenarios**:

1. **Basic Search**:
   - Query: "SUV familiar seguro bajo 180 millones"
   - Expected: Toyota RAV4 or similar as top pick
   - Timeline shows 5 agents completed
   - Intent Summary displays correctly

2. **Budget-Constrained Search**:
   - Query: "Sedán confiable bajo 100 millones"
   - Expected: Lower-priced sedans ranked
   - Pros mention budget fit

3. **Feature-Focused Search**:
   - Query: "Vehículo híbrido tecnológico"
   - Expected: Hybrid vehicles scored high on technology
   - Evaluation shows high tech scores

4. **Mobile Testing**:
   - Open on mobile device
   - Verify timeline stacks properly
   - Verify intent summary readable

---

## Implementation Tasks

### Task Breakdown

**Phase 1: Core Infrastructure** (8h)

1. **TASK-AGENT001-A**: Create AgentTrace types and collector class (2h)
   - File: `packages/shared/src/types/agentTrace.ts`
   - File: `packages/api/src/agents/base/AgentTrace.ts`
   - Unit tests for trace collection

2. **TASK-AGENT001-B**: Create Intent Agent (3h)
   - File: `packages/api/src/agents/IntentAgent.ts`
   - Implement parsing logic (category, budget, requirements)
   - Unit tests for all parsing scenarios

3. **TASK-AGENT001-C**: Create Evaluation Agent (3h)
   - File: `packages/api/src/agents/EvaluationAgent.ts`
   - Implement weighted scoring logic
   - Unit tests for all scoring methods

**Phase 2: Agent Integration** (6h)

4. **TASK-AGENT002-A**: Create Final Recommendation Agent (2h)
   - File: `packages/api/src/agents/FinalRecommendationAgent.ts`
   - Implement formatting logic
   - Unit tests

5. **TASK-AGENT002-B**: Update AgentOrchestrator for 5-agent workflow (3h)
   - Modify: `packages/api/src/agents/AgentOrchestrator.ts`
   - Integrate all 5 agents
   - Add AgentTrace collection
   - Update response structure

6. **TASK-AGENT002-C**: Update existing agents with AgentTrace (1h)
   - Modify: `ResearchAgent.ts`, `LeadDecisionAgent.ts`
   - Add trace integration

**Phase 3: Frontend Updates** (4h)

7. **TASK-AGENT003-A**: Enhance AgentTimeline component (2h)
   - Modify: `packages/web/src/components/cars/AgentTimeline.tsx`
   - Support 5 agents
   - Add expand/collapse for details
   - Improve animations

8. **TASK-AGENT003-B**: Create IntentSummary component (1h)
   - File: `packages/web/src/components/cars/IntentSummary.tsx`
   - Display intent analysis
   - Mobile-responsive design

9. **TASK-AGENT003-C**: Update CarSearchPage to show IntentSummary (1h)
   - Modify: `packages/web/src/pages/CarSearchPage.tsx`
   - Add IntentSummary display

**Phase 4: Testing & Polish** (4h)

10. **TASK-AGENT004-A**: Integration testing (2h)
    - End-to-end workflow tests
    - Fallback scenario tests
    - Performance validation

11. **TASK-AGENT004-B**: Manual testing and demo preparation (1h)
    - Test all demo scenarios
    - Verify mobile responsiveness
    - Ensure Spanish labels

12. **TASK-AGENT004-C**: Documentation updates (1h)
    - Update `specs/design.md` with architecture
    - Update `docs/DEMO.md` with new demo script
    - Update `README.md` if needed

**Total Effort**: 22 hours

**Dependencies**:
- Phase 1 tasks can run in parallel
- Phase 2 depends on Phase 1 completion
- Phase 3 depends on Phase 2 completion
- Phase 4 depends on Phase 3 completion

**Risks**:
- ⚠️ **Medium**: Intent parsing edge cases (mitigated by extensive unit tests)
- ⚠️ **Low**: AgentTrace performance overhead (< 10ms per agent)
- ⚠️ **Low**: Frontend animation complexity (use simple CSS transitions)

---

## Demo Impact

### How This Improves Demo

✅ **Technical Sophistication**: Shows 5-agent AI workflow (impressive for capstone)  
✅ **Transparency**: Users see AI "thinking" in real-time  
✅ **Colombian Context**: Intent Agent explicitly handles COP millions  
✅ **Visual Appeal**: Enhanced timeline with progress bar and expandable details  
✅ **Storytelling**: Can narrate agent workflow during presentation  
✅ **Debugging**: AgentTrace enables live debugging during demo if needed  

### Demo Scenario

**Setup** (before demo):
1. Ensure GitHub Models AI is enabled (real AI provider)
2. Load sample query: "SUV familiar seguro bajo 180 millones"
3. Have backend running: `npm run dev`

**Demo Script** (5 minutes):

1. **Introduction** (30s)
   - "DecisionHub AI uses a 5-agent decision workflow"
   - "Each agent has a specialized role"

2. **Submit Query** (10s)
   - Enter: "SUV familiar seguro bajo 180 millones"
   - Click "Buscar"

3. **Watch Timeline** (60s)
   - Point out Intent Agent: "Extracts budget: 180M COP"
   - Research Agent: "AI detects preferences: safety, family"
   - Evaluation Agent: "Scores 12 vehicles with weighted criteria"
   - Lead Decision Agent: "AI explains top pick"
   - Final Recommendation: "Formats response"

4. **Show Intent Summary** (20s)
   - "Here's what the Intent Agent understood"
   - Point out category, budget, requirements, confidence

5. **Show Results** (60s)
   - Top recommendation with explanation
   - Click to expand #1 result
   - Show pros/cons
   - Mention score (e.g., 87/100)

6. **Show Transparency** (30s)
   - "Every step is visible"
   - "AgentTrace captures full execution"
   - "Perfect for auditing decisions"

7. **Colombian Market Focus** (30s)
   - Point out COP formatting
   - Spanish throughout
   - "Designed for Colombian car buyers"

8. **Q&A** (remaining time)

### Fallback Plan (if demo fails)

- **Network issues**: Works offline with mock AI
- **Slow AI response**: Falls back to mock provider
- **Agent failure**: Graceful degradation (workflow continues)
- **No results**: Show pre-recorded video

---

## Design Spec Update

### Add to `specs/design.md`

```markdown
## Section 3.2: Five-Agent Decision Workflow

**Location**: `packages/api/src/agents/*`

**Purpose**: Transparent multi-agent system for vehicle recommendations

### Architecture

```
Intent → Research → Evaluation → Lead Decision → Final Recommendation
```

### Agents

#### 3.2.1: Intent Agent
- **File**: `IntentAgent.ts`
- **Purpose**: Parse natural language to extract structured intent
- **Input**: Query string + currency
- **Output**: IntentAnalysis (category, budget, requirements, confidence)
- **AI Dependency**: None (deterministic)
- **Performance**: 300-500ms

#### 3.2.2: Research Agent
- **File**: `ResearchAgent.ts`
- **Purpose**: Detect preferences and generate decision criteria using AI
- **Input**: NaturalLanguageRequest
- **Output**: Preferences + weighted criteria
- **AI Dependency**: Yes (fallback to keyword matching)
- **Performance**: 500-800ms (AI) or 50-100ms (mock)

#### 3.2.3: Evaluation Agent
- **File**: `EvaluationAgent.ts`
- **Purpose**: Score vehicles using weighted criteria
- **Input**: Vehicles + criteria + intent
- **Output**: Scored and ranked vehicles
- **AI Dependency**: None (deterministic)
- **Performance**: 300-500ms

#### 3.2.4: Lead Decision Agent
- **File**: `LeadDecisionAgent.ts`
- **Purpose**: Generate explanation for top recommendation using AI
- **Input**: Query + top 3 vehicles
- **Output**: Decision explanation
- **AI Dependency**: Yes (fallback to template)
- **Performance**: 600-800ms (AI) or 20-50ms (mock)

#### 3.2.5: Final Recommendation Agent
- **File**: `FinalRecommendationAgent.ts`
- **Purpose**: Format final response with COP currency
- **Input**: Scored vehicles + decision explanation
- **Output**: CarRecommendation[]
- **AI Dependency**: None (deterministic)
- **Performance**: 50-100ms

### Agent Trace System

**File**: `packages/api/src/agents/base/AgentTrace.ts`

**Purpose**: Comprehensive execution tracking

**Features**:
- Unique workflow ID per request
- Start/end timestamps per agent
- Duration tracking
- Input/output capture
- Error recording
- AI provider metadata
- JSON serialization

**Usage**: AgentOrchestrator creates AgentTraceCollector, passes to each agent

### Design Decisions

#### Decision 3.2.1: Sequential vs Parallel Execution

**Decision**: Execute agents **sequentially** in fixed order

**Rationale**:
- Demo clarity: Easy to follow in timeline
- Data dependency: Each agent needs previous agent's output
- Error handling: Easier to track where failures occur
- Performance: < 3s is acceptable for MVP

**Alternatives Considered**:
- **Parallel where possible**: Complex, marginal performance gain
- **Dynamic routing**: Overkill for 5-agent MVP

**Trade-offs**:
- **Pros**: Simple, predictable, easy to debug
- **Cons**: Slightly slower than optimal parallel execution

**Revisit Criteria**: If response time consistently > 3s, consider parallel evaluation

#### Decision 3.2.2: AgentTrace Always-On

**Decision**: AgentTrace **always active** (not optional)

**Rationale**:
- Transparency is core value proposition
- Enables debugging without reproduction
- Minimal performance overhead (< 10ms)
- Demo requirement

**Alternatives Considered**:
- **Conditional (dev only)**: Users lose transparency
- **Opt-in**: Too complex for MVP

**Trade-offs**:
- **Pros**: Full transparency, better debugging
- **Cons**: Minor response size increase (~1-2KB)

**Revisit Criteria**: If response size becomes issue (unlikely)

#### Decision 3.2.3: Intent Agent as First Step

**Decision**: **Always** run Intent Agent first

**Rationale**:
- Provides structure for downstream agents
- Improves Research Agent accuracy
- Enables better error messages
- Demo value (shows understanding)

**Alternatives Considered**:
- **Skip if simple query**: Loses consistency
- **Run in parallel with Research**: Data dependency

**Trade-offs**:
- **Pros**: Better analysis, clearer workflow
- **Cons**: Adds 500ms (acceptable)

**Revisit Criteria**: N/A (always beneficial)
```

---

## Colombian Market Architectural Considerations

✅ **Currency Handling**: Intent Agent normalizes "180 millones" → 180,000,000 COP  
✅ **Language**: All Spanish labels in frontend ("Analizando...", "Completado")  
✅ **Price Context**: Evaluation Agent understands Colombian price ranges  
✅ **Mobile-First**: Timeline component fully responsive  
✅ **Offline Resilience**: Mock fallback ensures demo works without AI  

---

## Success Criteria

This design is **well-architected** when:

✅ Follows existing BaseAgent pattern  
✅ TypeScript strict mode compliant (no `any`)  
✅ ES modules throughout  
✅ Error handling at every agent  
✅ Performance < 3s (95th percentile)  
✅ Demo-ready (simple, reliable workflow)  
✅ Complexity justified (5 agents needed for transparency)  
✅ Implementation tasks clearly defined  
✅ Design decisions documented with rationale  
✅ Ready for Developer Agent to implement  

---

## Architect's Recommendation

**Status**: ✅ **APPROVE FOR IMPLEMENTATION**

**Reasons**:
1. **Achieves Requirements**: All FR-1.6 acceptance criteria met
2. **Follows Patterns**: Uses existing BaseAgent, AgentInterface
3. **Performance**: < 3s target achievable (2.8s worst case)
4. **Demo-Ready**: Clear visual workflow, transparent decisions
5. **Maintainable**: Each agent independent, easy to modify
6. **Colombian Context**: COP handling, Spanish UI
7. **Risk-Mitigated**: Mock fallback, graceful degradation

**Complexity Assessment**: **MEDIUM** (justified by value)

**Timeline**: 22 hours (~3 days) - Reasonable for capstone

**Next Steps**:
1. Developer Agent implements Phase 1 (infrastructure)
2. Developer Agent implements Phase 2 (agent integration)
3. Developer Agent implements Phase 3 (frontend)
4. Developer Agent implements Phase 4 (testing & polish)
5. Demo preparation and practice runs

---

**Design Complete** ✅ - Ready for implementation!
