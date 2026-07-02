# Guía de Pruebas de Agentes Individuales

Esta guía explica cómo probar cada agente del sistema de 5 agentes de forma individual.

## Métodos de Prueba

### 1. Tests Unitarios (Recomendado)

Los tests unitarios ya están implementados para algunos agentes y se pueden ejecutar directamente:

```bash
# Desde la carpeta raíz del proyecto
cd packages/api

# Intent Agent (13 tests)
npx tsx src/agents/__tests__/run-intent-tests.ts

# Evaluation Agent (13 tests)
npx tsx src/agents/__tests__/EvaluationAgent.test.ts

# Final Recommendation Agent (11 tests)
npx tsx src/agents/__tests__/FinalRecommendationAgent.test.ts
```

### 2. Scripts de Prueba Individuales

Hemos creado scripts simples para probar cada agente de forma aislada:

```bash
# Desde packages/api
npx tsx scripts/test-intent-agent.ts
npx tsx scripts/test-research-agent.ts
npx tsx scripts/test-evaluation-agent.ts
npx tsx scripts/test-decision-agent.ts
npx tsx scripts/test-recommendation-agent.ts
```

### 3. API Endpoint (Prueba de Integración)

Puedes probar el flujo completo de 5 agentes usando el API:

```bash
curl -X POST http://localhost:3000/api/cars/recommend/nl \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SUV familiar seguro bajo 180 millones",
    "currency": "COP"
  }' | jq '.'
```

Para ver solo el agentTrace:

```bash
curl -s -X POST http://localhost:3000/api/cars/recommend/nl \
  -H "Content-Type: application/json" \
  -d '{"query": "SUV familiar seguro bajo 180 millones", "currency": "COP"}' \
  | jq '.data.agentTrace'
```

Para ver la salida de un agente específico:

```bash
# Intent Agent output
curl -s -X POST http://localhost:3000/api/cars/recommend/nl \
  -H "Content-Type: application/json" \
  -d '{"query": "SUV familiar seguro bajo 180 millones", "currency": "COP"}' \
  | jq '.data.agentTrace.executions[] | select(.agentName == "IntentAgent") | .output'

# Research Agent output
curl -s -X POST http://localhost:3000/api/cars/recommend/nl \
  -H "Content-Type: application/json" \
  -d '{"query": "SUV familiar seguro bajo 180 millones", "currency": "COP"}' \
  | jq '.data.agentTrace.executions[] | select(.agentName == "ResearchAgent") | .output'

# Evaluation Agent output
curl -s -X POST http://localhost:3000/api/cars/recommend/nl \
  -H "Content-Type: application/json" \
  -d '{"query": "SUV familiar seguro bajo 180 millones", "currency": "COP"}' \
  | jq '.data.agentTrace.executions[] | select(.agentName == "EvaluationAgent") | .output'

# Lead Decision Agent output
curl -s -X POST http://localhost:3000/api/cars/recommend/nl \
  -H "Content-Type: application/json" \
  -d '{"query": "SUV familiar seguro bajo 180 millones", "currency": "COP"}' \
  | jq '.data.agentTrace.executions[] | select(.agentName == "LeadDecisionAgent") | .output'

# Final Recommendation Agent output
curl -s -X POST http://localhost:3000/api/cars/recommend/nl \
  -H "Content-Type: application/json" \
  -d '{"query": "SUV familiar seguro bajo 180 millones", "currency": "COP"}' \
  | jq '.data.agentTrace.executions[] | select(.agentName == "FinalRecommendationAgent") | .output'
```

## Detalles por Agente

### 1. Intent Agent

**Propósito**: Analizar la consulta y extraer intención, categoría, presupuesto y requisitos.

**Input**:
```typescript
{
  query: "SUV familiar seguro bajo 180 millones",
  currency: "COP"
}
```

**Output Esperado**:
```typescript
{
  category: "suv",
  budget: { max: 180000000, currency: "COP" },
  requirements: ["familiar", "seguro"],
  queryType: "recommendation",
  confidence: 1.0,
  rawQuery: "SUV familiar seguro bajo 180 millones"
}
```

**Probar**:
```bash
npx tsx scripts/test-intent-agent.ts
```

---

### 2. Research Agent

**Propósito**: Generar criterios de decisión y pesos usando AI.

**Input**:
```typescript
{
  query: "SUV familiar seguro bajo 180 millones",
  category: "suv",
  budget: { max: 180000000, currency: "COP" },
  requirements: ["familiar", "seguro"]
}
```

**Output Esperado**:
```typescript
{
  originalQuery: "SUV familiar seguro bajo 180 millones",
  category: "suv",
  budget: { max: 180000000, currency: "COP" },
  detectedPreferences: [
    { label: "familiar", confidence: 0.9 },
    { label: "seguro", confidence: 0.9 }
  ],
  decisionCriteria: [
    { name: "seguridad", weight: 0.35, description: "..." },
    { name: "espacioInterior", weight: 0.25, description: "..." },
    // ... más criterios
  ]
}
```

**Probar**:
```bash
npx tsx scripts/test-research-agent.ts
```

**Nota**: Este agente usa AI (GitHub Models o Mock). Si no hay API key, usa el MockAIProvider.

---

### 3. Evaluation Agent

**Propósito**: Calificar y rankear vehículos según criterios.

**Input**:
```typescript
{
  vehicles: Car[],  // Array de vehículos
  criteria: {       // Criterios con pesos
    seguridad: 0.35,
    espacioInterior: 0.25,
    precio: 0.20,
    // ...
  },
  searchCriteria: {
    category: "suv",
    maxBudget: 180000000
  }
}
```

**Output Esperado**:
```typescript
{
  evaluations: [
    {
      vehicle: { id: "hyundai-tucson", name: "Hyundai Tucson", ... },
      finalScore: 87.5,
      criteriaScores: {
        seguridad: 95,
        espacioInterior: 85,
        precio: 90,
        // ...
      },
      rank: 1
    },
    // ... más evaluaciones
  ],
  summary: {
    totalEvaluated: 12,
    meetsThreshold: 5,
    averageScore: 67.3,
    highestScore: 87.5,
    lowestScore: 42.1
  }
}
```

**Probar**:
```bash
npx tsx scripts/test-evaluation-agent.ts
```

---

### 4. Lead Decision Agent

**Propósito**: Generar explicación de la decisión usando AI.

**Input**:
```typescript
{
  query: "SUV familiar seguro bajo 180 millones",
  topRecommendations: [
    {
      vehicle: { id: "hyundai-tucson", name: "Hyundai Tucson", ... },
      score: 87.5,
      rank: 1
    },
    // ... top 3
  ]
}
```

**Output Esperado**:
```typescript
{
  summary: "Basado en tu búsqueda de un SUV familiar y seguro...",
  keyFactors: [
    "Excelente calificación de seguridad",
    "Amplio espacio interior para familias",
    "Precio dentro del presupuesto"
  ],
  tradeoffs: [
    "Consumo de combustible moderado vs. eficiencia",
    "Tamaño grande vs. maniobrabilidad urbana"
  ],
  confidence: 0.9
}
```

**Probar**:
```bash
npx tsx scripts/test-decision-agent.ts
```

**Nota**: Este agente usa AI (GitHub Models o Mock).

---

### 5. Final Recommendation Agent

**Propósito**: Formatear recomendaciones finales con precios COP y textos en español.

**Input**:
```typescript
{
  evaluationResults: [
    {
      vehicle: { ... },
      finalScore: 87.5,
      rank: 1
    },
    // ... top 5
  ],
  decisionExplanation: {
    summary: "...",
    keyFactors: [...],
    tradeoffs: [...]
  },
  currency: "COP"
}
```

**Output Esperado**:
```typescript
[
  {
    id: "hyundai-tucson",
    name: "Hyundai Tucson",
    price: 165000000,
    formattedPrice: "$165.000.000",
    category: "SUV",
    year: 2024,
    imageUrl: "...",
    score: 87.5,
    matchReason: "Excelente calificación de seguridad...",
    strengths: [
      "Calificación de seguridad de 5 estrellas",
      "Amplio espacio interior",
      "Tecnología de asistencia al conductor"
    ],
    considerations: [
      "Consumo de combustible moderado",
      "Precio en el límite superior del presupuesto"
    ]
  },
  // ... hasta 5 recomendaciones
]
```

**Probar**:
```bash
npx tsx scripts/test-recommendation-agent.ts
```

---

## Resultados de Tests

### Tests Completados

- ✅ **Intent Agent**: 13 tests (100% pasan)
- ✅ **Evaluation Agent**: 13 tests (100% pasan)
- ✅ **Final Recommendation Agent**: 11 tests (100% pasan)

### Tests Pendientes

- ⏳ **Research Agent**: Por implementar (TASK-FEAT-AW012)
- ⏳ **Lead Decision Agent**: Por implementar (TASK-FEAT-AW012)

---

## Crear Nuevos Tests

Para crear tests para un nuevo agente:

```typescript
// packages/api/src/agents/__tests__/MyAgent.test.ts

import { MyAgent } from '../MyAgent';

async function runTest(testName: string, input: any, expectedOutput: any) {
  console.log(`\n🧪 TEST: ${testName}`);
  
  const agent = new MyAgent();
  const result = await agent.execute(input);
  
  console.log('Input:', JSON.stringify(input, null, 2));
  console.log('Output:', JSON.stringify(result, null, 2));
  
  // Validar resultado
  if (JSON.stringify(result) === JSON.stringify(expectedOutput)) {
    console.log('✅ PASS');
  } else {
    console.log('❌ FAIL');
    console.log('Expected:', JSON.stringify(expectedOutput, null, 2));
  }
}

export async function runAllTests() {
  console.log('Starting MyAgent tests...\n');
  
  await runTest('Test case 1', { /* input */ }, { /* expected */ });
  await runTest('Test case 2', { /* input */ }, { /* expected */ });
  // ... más tests
  
  console.log('\n✅ All tests passed!');
}

// Si ejecutas directamente
runAllTests()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
```

---

## Debugging de Agentes

Para debug detallado, cada agente hereda de `BaseAgent` que incluye logging:

```typescript
// En cualquier agente
this.logger.info('Processing input', { input });
this.logger.debug('Intermediate result', { result });
this.logger.error('Error occurred', { error });
```

Los logs aparecen en la consola del servidor y en `agentTrace.executions[].metadata`.

---

## Próximos Pasos

1. **Completar tests unitarios**: Agregar tests para Research y Lead Decision agents
2. **Tests de integración**: Validar flujo completo de 5 agentes
3. **Tests de performance**: Medir tiempo de ejecución y optimizar
4. **Tests de errores**: Validar manejo de errores y fallbacks

Ver `specs/tasks.md` sección 2.6 para más detalles sobre TASK-FEAT-AW012 y TASK-FEAT-AW013.
