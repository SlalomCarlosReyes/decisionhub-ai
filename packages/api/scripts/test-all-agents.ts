/**
 * Master Test Runner - All Agents
 * 
 * Ejecuta todos los tests de agentes individuales en secuencia
 * 
 * Ejecutar: npx tsx scripts/test-all-agents.ts
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestResult {
  agent: string;
  success: boolean;
  duration: number;
  error?: string;
}

function runScript(scriptPath: string): Promise<TestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const agentName = path.basename(scriptPath, '.ts').replace('test-', '').replace('-agent', '');
    
    console.log(`\n🚀 Ejecutando: ${agentName}...`);
    
    const child = spawn('npx', ['tsx', scriptPath], {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      
      if (code === 0) {
        resolve({
          agent: agentName,
          success: true,
          duration
        });
      } else {
        resolve({
          agent: agentName,
          success: false,
          duration,
          error: `Exit code: ${code}`
        });
      }
    });
    
    child.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        agent: agentName,
        success: false,
        duration,
        error: error.message
      });
    });
  });
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              Test Suite - Todos los Agentes               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\nEste script ejecuta todos los tests de agentes individuales\n');
  
  const testScripts = [
    path.join(__dirname, 'test-intent-agent.ts'),
    path.join(__dirname, 'test-research-agent.ts'),
    path.join(__dirname, 'test-evaluation-agent.ts'),
    path.join(__dirname, 'test-decision-agent.ts'),
    path.join(__dirname, 'test-recommendation-agent.ts')
  ];
  
  const results: TestResult[] = [];
  
  // Ejecutar cada test en secuencia
  for (const script of testScripts) {
    const result = await runScript(script);
    results.push(result);
    
    if (!result.success) {
      console.log(`\n⚠️  ${result.agent} falló, pero continuando con los demás tests...\n`);
    }
  }
  
  // Resumen final
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              RESUMEN COMPLETO DE PRUEBAS                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log('\n📊 Estadísticas Generales:');
  console.log(`   Total de agentes probados: ${results.length}`);
  console.log(`   ✅ Exitosos: ${passed}`);
  console.log(`   ❌ Fallidos: ${failed}`);
  console.log(`   ⏱️  Tiempo total: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`   ⏱️  Tiempo promedio: ${(totalDuration / results.length / 1000).toFixed(2)}s`);
  
  console.log('\n📋 Resultados por Agente:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const time = (result.duration / 1000).toFixed(2);
    console.log(`   ${status} ${result.agent.padEnd(20)} ${time}s`);
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });
  
  if (failed > 0) {
    console.log('\n⚠️  Agentes con fallos:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.agent}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (passed === results.length) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!');
  } else {
    console.log(`⚠️  ${failed} de ${results.length} agentes fallaron las pruebas`);
  }
  
  console.log('='.repeat(70) + '\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
