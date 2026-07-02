/**
 * Individual Test Script: Lead Decision Agent
 * 
 * Prueba el Lead Decision Agent con diferentes escenarios
 * 
 * Ejecutar: npx tsx scripts/test-decision-agent.ts
 */

import { LeadDecisionAgent } from '../src/agents/LeadDecisionAgent.js';
import type { CarRecommendation } from '@decisionhub/shared';

// Mock recommendations para pruebas
const mockTopRecommendations: CarRecommendation[] = [
  {
    id: 'hyundai-tucson',
    name: 'Hyundai Tucson 2024',
    price: 165000000,
    formattedPrice: '$165.000.000',
    category: 'SUV',
    year: 2024,
    imageUrl: '/images/hyundai-tucson-2024.jpg',
    score: 87.5,
    matchReason: 'Excelente calificación de seguridad y amplio espacio interior'
  },
  {
    id: 'mazda-cx5',
    name: 'Mazda CX-5 2024',
    price: 155000000,
    formattedPrice: '$155.000.000',
    category: 'SUV',
    year: 2024,
    imageUrl: '/images/mazda-cx5-2024.jpg',
    score: 84.2,
    matchReason: 'Balance perfecto entre lujo y funcionalidad familiar'
  },
  {
    id: 'toyota-rav4',
    name: 'Toyota RAV4 2024',
    price: 170000000,
    formattedPrice: '$170.000.000',
    category: 'SUV',
    year: 2024,
    imageUrl: '/images/toyota-rav4-2024.jpg',
    score: 82.8,
    matchReason: 'Alta confiabilidad y tecnología de seguridad avanzada'
  }
];

const testCases = [
  {
    name: 'SUV familiar y seguro',
    input: {
      query: 'SUV familiar seguro bajo 180 millones',
      topRecommendations: mockTopRecommendations
    }
  },
  {
    name: 'Sedan económico y confiable',
    input: {
      query: 'Sedan económico confiable para trabajo',
      topRecommendations: [
        {
          id: 'toyota-corolla',
          name: 'Toyota Corolla 2024',
          price: 95000000,
          formattedPrice: '$95.000.000',
          category: 'Sedan',
          year: 2024,
          imageUrl: '/images/toyota-corolla-2024.jpg',
          score: 89.3,
          matchReason: 'Excelente relación precio-calidad y bajo costo de mantenimiento'
        },
        {
          id: 'mazda3',
          name: 'Mazda 3 2024',
          price: 105000000,
          formattedPrice: '$105.000.000',
          category: 'Sedan',
          year: 2024,
          imageUrl: '/images/mazda3-2024.jpg',
          score: 85.7,
          matchReason: 'Diseño premium con tecnología moderna'
        }
      ]
    }
  },
  {
    name: 'Hatchback urbano',
    input: {
      query: 'Hatchback compacto para ciudad',
      topRecommendations: [
        {
          id: 'suzuki-swift',
          name: 'Suzuki Swift 2024',
          price: 65000000,
          formattedPrice: '$65.000.000',
          category: 'Hatchback',
          year: 2024,
          imageUrl: '/images/suzuki-swift-2024.jpg',
          score: 82.1,
          matchReason: 'Compacto, ágil y económico para la ciudad'
        }
      ]
    }
  }
];

async function runTest(testCase: { name: string; input: any }) {
  console.log('\n' + '='.repeat(70));
  console.log(`🧪 TEST: ${testCase.name}`);
  console.log('='.repeat(70));
  console.log(`📝 Query: "${testCase.input.query}"`);
  console.log(`🏆 Top Recommendations: ${testCase.input.topRecommendations.length}`);
  testCase.input.topRecommendations.forEach((rec: CarRecommendation, i: number) => {
    console.log(`   ${i + 1}. ${rec.name} (score: ${rec.score})`);
  });
  console.log('');

  const agent = new LeadDecisionAgent();
  const startTime = Date.now();
  
  try {
    const result = await agent.execute(testCase.input);
    const duration = Date.now() - startTime;

    console.log('✅ RESULTADO:');
    console.log(`\n📋 Resumen de Decisión:`);
    console.log(`"${result.summary}"`);
    
    console.log(`\n🔑 Factores Clave (${result.keyFactors?.length || 0}):`);
    if (result.keyFactors) {
      result.keyFactors.forEach((factor, i) => {
        console.log(`  ${i + 1}. ${factor}`);
      });
    }
    
    if (result.tradeoffs && result.tradeoffs.length > 0) {
      console.log(`\n⚖️  Trade-offs (${result.tradeoffs.length}):`);
      result.tradeoffs.forEach((tradeoff, i) => {
        console.log(`  ${i + 1}. ${tradeoff}`);
      });
    } else {
      console.log(`\n⚖️  Trade-offs: Ninguno`);
    }
    
    console.log(`\n📊 Confianza: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`⏱️  Tiempo de ejecución: ${duration}ms`);
    
    // Validaciones
    console.log('\n✅ VALIDACIONES:');
    console.log(`  ${result.summary && result.summary.length > 0 ? '✓' : '✗'} Resumen generado`);
    console.log(`  ${result.keyFactors && result.keyFactors.length >= 2 ? '✓' : '✗'} Al menos 2 factores clave`);
    console.log(`  ${result.tradeoffs && result.tradeoffs.length >= 1 ? '✓' : '⚠️'} Al menos 1 trade-off (opcional)`);
    console.log(`  ${result.confidence > 0 && result.confidence <= 1 ? '✓' : '✗'} Confianza válida (0-1)`);
    
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
  console.log('║     Lead Decision Agent - Pruebas Individuales            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  console.log('\n⚠️  NOTA: Este agente usa AI (GitHub Models o Mock)');
  console.log('   Si no hay API key, se usa MockAIProvider automáticamente.\n');
  
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
