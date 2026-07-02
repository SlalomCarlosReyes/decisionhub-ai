/**
 * Individual Test Script: Intent Agent
 * 
 * Prueba el Intent Agent con diferentes consultas en español e inglés
 * 
 * Ejecutar: npx tsx scripts/test-intent-agent.ts
 */

import { IntentAgent } from '../src/agents/IntentAgent.js';
import type { IntentAgentInput } from '../src/agents/IntentAgent.js';

// Test cases
const testCases: Array<{ name: string; input: IntentAgentInput }> = [
  {
    name: 'SUV con presupuesto y requisitos',
    input: {
      query: 'SUV familiar seguro bajo 180 millones',
      currency: 'COP'
    }
  },
  {
    name: 'Sedan con rango de presupuesto',
    input: {
      query: 'Sedan entre 100 y 150 millones',
      currency: 'COP'
    }
  },
  {
    name: 'Camioneta con múltiples requisitos',
    input: {
      query: 'Camioneta espaciosa confiable económica',
      currency: 'COP'
    }
  },
  {
    name: 'Consulta de comparación',
    input: {
      query: 'Comparar SUV vs Sedan',
      currency: 'COP'
    }
  },
  {
    name: 'Consulta informativa',
    input: {
      query: 'Qué es mejor para familia grande?',
      currency: 'COP'
    }
  },
  {
    name: 'English query with budget',
    input: {
      query: 'SUV under 180 million for family',
      currency: 'COP'
    }
  }
];

async function runTest(testCase: { name: string; input: IntentAgentInput }) {
  console.log('\n' + '='.repeat(70));
  console.log(`🧪 TEST: ${testCase.name}`);
  console.log('='.repeat(70));
  console.log(`📝 Query: "${testCase.input.query}"`);
  console.log(`💱 Currency: ${testCase.input.currency}\n`);

  const agent = new IntentAgent();
  const startTime = Date.now();
  
  try {
    const result = await agent.execute(testCase.input);
    const duration = Date.now() - startTime;

    console.log('✅ RESULTADO:');
    console.log(JSON.stringify(result, null, 2));
    console.log(`\n⏱️  Tiempo de ejecución: ${duration}ms`);
    
    // Validaciones
    console.log('\n📊 VALIDACIONES:');
    console.log(`  ✓ Categoría detectada: ${result.category || 'ninguna'}`);
    console.log(`  ✓ Tipo de consulta: ${result.queryType}`);
    console.log(`  ✓ Confianza: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`  ✓ Requisitos encontrados: ${result.requirements.length}`);
    if (result.requirements.length > 0) {
      console.log(`    - ${result.requirements.join(', ')}`);
    }
    if (result.budget) {
      console.log(`  ✓ Presupuesto detectado:`);
      if (result.budget.min) {
        console.log(`    - Mínimo: ${result.budget.min.toLocaleString('es-CO')} ${result.budget.currency}`);
      }
      if (result.budget.max) {
        console.log(`    - Máximo: ${result.budget.max.toLocaleString('es-CO')} ${result.budget.currency}`);
      }
    }
    
    return { success: true, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ ERROR:', error);
    return { success: false, duration, error };
  }
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          Intent Agent - Pruebas Individuales              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push({ name: testCase.name, ...result });
  }
  
  // Resumen
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMEN DE PRUEBAS                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  console.log(`\n✅ Pruebas exitosas: ${passed}/${results.length}`);
  console.log(`❌ Pruebas fallidas: ${failed}/${results.length}`);
  console.log(`⏱️  Tiempo promedio: ${avgDuration.toFixed(2)}ms`);
  
  if (failed > 0) {
    console.log('\n⚠️  Pruebas fallidas:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}`);
    });
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
