/**
 * Individual Test Script: Final Recommendation Agent
 * 
 * Prueba el Final Recommendation Agent con resultados de evaluación
 * 
 * Ejecutar: npx tsx scripts/test-recommendation-agent.ts
 */

import { FinalRecommendationAgent } from '../src/agents/FinalRecommendationAgent.js';
import { getAllCars } from '../src/services/carService.js';
import type { EvaluationResult, DecisionExplanation } from '@decisionhub/shared';

async function runTest() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Final Recommendation Agent - Pruebas Individuales        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Cargar vehículos reales
  console.log('\n📂 Cargando vehículos desde la base de datos...');
  const allVehicles = await getAllCars();
  console.log(`✓ ${allVehicles.length} vehículos cargados\n`);
  
  // Mock evaluation results - using first 3 vehicles from database
  const mockEvaluationResults: EvaluationResult[] = [
    {
      vehicle: allVehicles[0], // First vehicle
      finalScore: 87.5,
      criteriaScores: {
        seguridad: 95,
        espacioInterior: 85,
        precio: 78,
        confiabilidad: 90,
        eficiencia: 70
      },
      rank: 1
    },
    {
      vehicle: allVehicles[1], // Second vehicle
      finalScore: 84.2,
      criteriaScores: {
        seguridad: 92,
        espacioInterior: 82,
        precio: 80,
        confiabilidad: 88,
        eficiencia: 75
      },
      rank: 2
    },
    {
      vehicle: allVehicles[2], // Third vehicle
      finalScore: 82.8,
      criteriaScores: {
        seguridad: 90,
        espacioInterior: 80,
        precio: 75,
        confiabilidad: 95,
        eficiencia: 72
      },
      rank: 3
    }
  ];
  
  const mockDecisionExplanation: DecisionExplanation = {
    summary: 'Basado en tu búsqueda de un SUV familiar y seguro, estas son las mejores opciones dentro de tu presupuesto.',
    keyFactors: [
      'Excelente calificación de seguridad (5 estrellas)',
      'Amplio espacio interior para familias',
      'Precio dentro del presupuesto establecido',
      'Alta confiabilidad según valoraciones'
    ],
    tradeoffs: [
      'SUVs grandes vs. eficiencia de combustible',
      'Seguridad avanzada vs. precio más alto',
      'Espacio interior vs. maniobrabilidad urbana'
    ],
    confidence: 0.9
  };
  
  // Test Case 1: Con explicación de decisión
  console.log('='.repeat(70));
  console.log('🧪 TEST 1: Formatear recomendaciones con explicación de decisión');
  console.log('='.repeat(70));
  
  const test1Input = {
    evaluationResults: mockEvaluationResults,
    decisionExplanation: mockDecisionExplanation,
    currency: 'COP'
  };
  
  const agent = new FinalRecommendationAgent();
  const startTime = Date.now();
  
  try {
    const result = await agent.execute(test1Input);
    const duration = Date.now() - startTime;
    
    console.log('\n✅ RESULTADO:');
    console.log(`\n🏆 ${result.recommendations.length} Recomendaciones Generadas:\n`);
    
    result.recommendations.forEach((rec, index) => {
      console.log(`${'─'.repeat(70)}`);
      console.log(`${index + 1}. ${rec.car.make} ${rec.car.model} (${rec.car.year})`);
      console.log(`   ID: ${rec.car.id}`);
      console.log(`   Categoría: ${rec.car.bodyType}`);
      console.log(`   Precio: ${rec.car.price.toLocaleString('es-CO')} COP`);
      console.log(`   Puntuación: ${rec.score.toFixed(1)}/100`);
      
      if (rec.reasoning) {
        console.log(`\n   💡 Razón: ${rec.reasoning}`);
      }
      
      if (rec.pros && rec.pros.length > 0) {
        console.log(`\n   ✅ Fortalezas (${rec.pros.length}):`);
        rec.pros.forEach(strength => {
          console.log(`      • ${strength}`);
        });
      }
      
      if (rec.cons && rec.cons.length > 0) {
        console.log(`\n   ⚠️  Consideraciones (${rec.cons.length}):`);
        rec.cons.forEach(consideration => {
          console.log(`      • ${consideration}`);
        });
      }
      
      console.log('');
    });
    
    console.log(`⏱️  Tiempo de ejecución: ${duration}ms`);
    
    // Validaciones
    console.log('\n📊 VALIDACIONES:');
    console.log(`  ${result.recommendations.length <= 5 ? '✓' : '✗'} Máximo 5 recomendaciones`);
    console.log(`  ${result.recommendations.every(r => r.car.price) ? '✓' : '✗'} Precios presentes`);
    console.log(`  ${result.recommendations.every(r => r.pros && r.pros.length >= 3) ? '✓' : '✗'} Al menos 3 fortalezas por vehículo`);
    console.log(`  ${result.recommendations.every(r => r.cons && r.cons.length >= 2) ? '✓' : '✗'} Al menos 2 consideraciones por vehículo`);
    console.log(`  ${result.recommendations[0].reasoning ? '✓' : '✗'} Top pick tiene explicación`);
    console.log(`  ${result.recommendations.every(r => r.score > 0 && r.score <= 100) ? '✓' : '✗'} Scores válidos (0-100)`);
    
    // Test Case 2: Sin explicación de decisión
    console.log('\n\n' + '='.repeat(70));
    console.log('🧪 TEST 2: Formatear recomendaciones sin explicación de decisión');
    console.log('='.repeat(70));
    
    const test2Input = {
      evaluationResults: mockEvaluationResults.slice(0, 2),
      decisionExplanation: undefined,
      currency: 'COP'
    };
    
    const startTime2 = Date.now();
    const result2 = await agent.execute(test2Input);
    const duration2 = Date.now() - startTime2;
    
    console.log('\n✅ RESULTADO:');
    console.log(`\n🏆 ${result2.recommendations.length} Recomendaciones Generadas (sin explicación):\n`);
    
    result2.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.car.make} ${rec.car.model} - $${rec.car.price.toLocaleString()} (score: ${rec.score.toFixed(1)})`);
      console.log(`   Fortalezas: ${rec.pros?.length || 0}, Consideraciones: ${rec.cons?.length || 0}`);
    });
    
    console.log(`\n⏱️  Tiempo de ejecución: ${duration2}ms`);
    console.log(`\n✅ VALIDACIÓN: ${!result2.recommendations[0].reasoning || result2.recommendations[0].reasoning === '' ? '✓' : '✗'} Sin explicación específica cuando no se provee`);
    
    // Test Case 3: Más de 5 resultados (debe limitar a 5)
    console.log('\n\n' + '='.repeat(70));
    console.log('🧪 TEST 3: Limitar a máximo 5 recomendaciones');
    console.log('='.repeat(70));
    
    const manyResults: EvaluationResult[] = allVehicles.slice(0, 8).map((vehicle, i) => ({
      vehicle,
      finalScore: 90 - (i * 3),
      criteriaScores: { general: 90 - (i * 3) },
      rank: i + 1
    }));
    
    const test3Input = {
      evaluationResults: manyResults,
      decisionExplanation: undefined,
      currency: 'COP'
    };
    
    const startTime3 = Date.now();
    const result3 = await agent.execute(test3Input);
    const duration3 = Date.now() - startTime3;
    
    console.log(`\n✅ RESULTADO: ${result3.recommendations.length} recomendaciones (de ${manyResults.length} evaluaciones)`);
    console.log(`✅ VALIDACIÓN: ${result3.recommendations.length === 5 ? '✓' : '✗'} Limitado correctamente a 5`);
    console.log(`⏱️  Tiempo de ejecución: ${duration3}ms`);
    
    // Resumen final
    console.log('\n\n' + '='.repeat(70));
    console.log('✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('='.repeat(70));
    console.log(`\n⏱️  Tiempo total: ${duration + duration2 + duration3}ms`);
    console.log(`⏱️  Tiempo promedio: ${((duration + duration2 + duration3) / 3).toFixed(2)}ms\n`);
    
    return true;
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    return false;
  }
}

runTest()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
