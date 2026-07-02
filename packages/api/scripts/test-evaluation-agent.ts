/**
 * Individual Test Script: Evaluation Agent
 * 
 * Prueba el Evaluation Agent con vehículos reales
 * 
 * Ejecutar: npx tsx scripts/test-evaluation-agent.ts
 */

import { EvaluationAgent } from '../src/agents/EvaluationAgent.js';
import { getAllCars } from '../src/services/carService.js';
import type { Car } from '@decisionhub/shared';

async function runTest() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      Evaluation Agent - Pruebas Individuales              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Cargar vehículos reales
  console.log('\n📂 Cargando vehículos desde la base de datos...');
  const allVehicles = await getAllCars();
  console.log(`✓ ${allVehicles.length} vehículos cargados\n`);
  
  // Test Case 1: SUV familiar con criterios de seguridad y espacio
  console.log('='.repeat(70));
  console.log('🧪 TEST 1: SUV familiar con énfasis en seguridad y espacio');
  console.log('='.repeat(70));
  
  const test1Input = {
    vehicles: allVehicles,
    criteria: [
      { name: 'seguridad', weight: 0.35, description: 'Calificación de seguridad y características' },
      { name: 'espacioInterior', weight: 0.25, description: 'Amplitud y comodidad interior' },
      { name: 'precio', weight: 0.20, description: 'Ajuste al presupuesto' },
      { name: 'confiabilidad', weight: 0.15, description: 'Historial de confiabilidad' },
      { name: 'eficiencia', weight: 0.05, description: 'Eficiencia de combustible' }
    ],
    searchCriteria: {
      category: 'suv',
      maxBudget: 180000000,
      requirements: ['familiar', 'seguro']
    }
  };
  
  const agent1 = new EvaluationAgent();
  const startTime1 = Date.now();
  
  try {
    const result1 = await agent1.execute(test1Input);
    const duration1 = Date.now() - startTime1;
    
    console.log('\n✅ RESULTADO:');
    console.log(`\n📊 Resumen:`);
    console.log(`  - Total evaluados: ${result1.summary.totalEvaluated}`);
    console.log(`  - Aprueban umbral (≥50): ${result1.summary.meetsThreshold}`);
    console.log(`  - Puntuación más alta: ${result1.summary.highestScore.toFixed(1)}`);
    console.log(`  - Puntuación más baja: ${result1.summary.lowestScore.toFixed(1)}`);
    console.log(`  - Puntuación promedio: ${result1.summary.averageScore.toFixed(1)}`);
    
    console.log(`\n🏆 Top 5 Recomendaciones:`);
    result1.evaluationResults.slice(0, 5).forEach((evaluation, index) => {
      console.log(`\n  ${index + 1}. ${evaluation.vehicle.name} (${evaluation.vehicle.year})`);
      console.log(`     Puntuación Final: ${evaluation.finalScore.toFixed(1)}/100`);
      console.log(`     Precio: ${evaluation.vehicle.price.toLocaleString('es-CO')} COP`);
      console.log(`     Desglose:`);
      Object.entries(evaluation.criteriaScores).forEach(([criterion, score]) => {
        const criteriaItem = test1Input.criteria.find(c => c.name === criterion);
        const weight = criteriaItem ? criteriaItem.weight : 0;
        console.log(`       - ${criterion}: ${score.toFixed(1)} (peso: ${(weight * 100).toFixed(0)}%)`);
      });
    });
    
    console.log(`\n⏱️  Tiempo de ejecución: ${duration1}ms`);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    return false;
  }
  
  // Test Case 2: Sedan económico
  console.log('\n\n' + '='.repeat(70));
  console.log('🧪 TEST 2: Sedan económico con énfasis en precio y eficiencia');
  console.log('='.repeat(70));
  
  const test2Input = {
    vehicles: allVehicles,
    criteria: [
      { name: 'precio', weight: 0.35, description: 'Ajuste al presupuesto' },
      { name: 'eficiencia', weight: 0.30, description: 'Eficiencia de combustible' },
      { name: 'confiabilidad', weight: 0.20, description: 'Historial de confiabilidad' },
      { name: 'seguridad', weight: 0.10, description: 'Calificación de seguridad' },
      { name: 'tecnologia', weight: 0.05, description: 'Características tecnológicas' }
    ],
    searchCriteria: {
      category: 'sedan',
      maxBudget: 120000000,
      requirements: ['económico', 'confiable']
    }
  };
  
  const agent2 = new EvaluationAgent();
  const startTime2 = Date.now();
  
  try {
    const result2 = await agent2.execute(test2Input);
    const duration2 = Date.now() - startTime2;
    
    console.log('\n✅ RESULTADO:');
    console.log(`\n📊 Resumen:`);
    console.log(`  - Total evaluados: ${result2.summary.totalEvaluated}`);
    console.log(`  - Aprueban umbral (≥50): ${result2.summary.meetsThreshold}`);
    console.log(`  - Puntuación más alta: ${result2.summary.highestScore.toFixed(1)}`);
    console.log(`  - Puntuación promedio: ${result2.summary.averageScore.toFixed(1)}`);
    
    console.log(`\n🏆 Top 3 Recomendaciones:`);
    result2.evaluationResults.slice(0, 3).forEach((evaluation, index) => {
      console.log(`\n  ${index + 1}. ${evaluation.vehicle.name}`);
      console.log(`     Puntuación: ${evaluation.finalScore.toFixed(1)}/100`);
      console.log(`     Precio: ${evaluation.vehicle.price.toLocaleString('es-CO')} COP`);
    });
    
    console.log(`\n⏱️  Tiempo de ejecución: ${duration2}ms`);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    return false;
  }
  
  // Resumen final
  console.log('\n\n' + '='.repeat(70));
  console.log('✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
  console.log('='.repeat(70) + '\n');
  
  return true;
}

runTest()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
