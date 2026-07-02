/**
 * Individual Test Script: Research Agent
 * 
 * Prueba el Research Agent con diferentes consultas
 * 
 * Ejecutar: npx tsx scripts/test-research-agent.ts
 */

import { ResearchAgent } from '../src/agents/ResearchAgent.js';
import { AIProviderFactory } from '../src/services/ai/index.js';
import type { NaturalLanguageRequest } from '@decisionhub/shared';

// Test cases
const testCases: Array<{ name: string; input: NaturalLanguageRequest }> = [
  {
    name: 'SUV familiar y seguro',
    input: {
      query: 'SUV familiar seguro bajo 180 millones',
      category: 'suv',
      budget: {
        max: 180000000,
        currency: 'COP'
      },
      requirements: ['familiar', 'seguro']
    }
  },
  {
    name: 'Sedan económico',
    input: {
      query: 'Sedan económico confiable',
      category: 'sedan',
      budget: {
        max: 120000000,
        currency: 'COP'
      },
      requirements: ['económico', 'confiable']
    }
  },
  {
    name: 'Hatchback urbano',
    input: {
      query: 'Hatchback compacto para ciudad',
      category: 'hatchback',
      budget: {
        max: 80000000,
        currency: 'COP'
      },
      requirements: ['compacto', 'urbano']
    }
  }
];

async function runTest(testCase: { name: string; input: NaturalLanguageRequest }) {
  console.log('\n' + '='.repeat(70));
  console.log(`🧪 TEST: ${testCase.name}`);
  console.log('='.repeat(70));
  console.log(`📝 Query: "${testCase.input.query}"`);
  console.log(`🚗 Category: ${testCase.input.category}`);
  console.log(`💰 Budget: Max ${testCase.input.budget?.max?.toLocaleString('es-CO')} ${testCase.input.budget?.currency}`);
  console.log(`📋 Requirements: ${testCase.input.requirements.join(', ')}\n`);

  const agent = new ResearchAgent();
  const startTime = Date.now();
  
  try {
    const result = await agent.execute(testCase.input);
    const duration = Date.now() - startTime;

    console.log('✅ RESULTADO:');
    console.log(JSON.stringify(result, null, 2));
    console.log(`\n⏱️  Tiempo de ejecución: ${duration}ms`);
    
    // Validaciones
    console.log('\n📊 VALIDACIONES:');
    if (result.preferences && result.preferences.length > 0) {
      console.log(`  ✓ Preferencias detectadas: ${result.preferences.length}`);
      result.preferences.forEach(pref => {
        const confidence = pref.confidence || 0;
        console.log(`    - ${pref.label || pref.value} (confianza: ${(confidence * 100).toFixed(0)}%)`);
      });
    } else {
      console.log(`  ⚠️  Preferencias detectadas: 0`);
    }
    
    if (result.criteria && result.criteria.length > 0) {
      console.log(`  ✓ Criterios generados: ${result.criteria.length}`);
      result.criteria.forEach(criteria => {
        console.log(`    - ${criteria.name}: ${(criteria.weight * 100).toFixed(0)}% peso`);
      });
      
      const totalWeight = result.criteria.reduce((sum, c) => sum + c.weight, 0);
      console.log(`  ✓ Suma de pesos: ${totalWeight.toFixed(2)} ${Math.abs(totalWeight - 1.0) < 0.01 ? '✅' : '⚠️ (debe ser ~1.0)'}`);
    } else {
      console.log(`  ⚠️  Criterios generados: 0`);
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
  console.log('║        Research Agent - Pruebas Individuales              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  console.log('\n⚠️  NOTA: Este agente usa AI (GitHub Models o Mock)');
  console.log('   Si no hay API key, se usa MockAIProvider automáticamente.\n');
  
  // Initialize AI Provider Factory
  console.log('🔧 Inicializando AI Provider...');
  await AIProviderFactory.initialize();
  console.log('✅ AI Provider inicializado\n');
  
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
