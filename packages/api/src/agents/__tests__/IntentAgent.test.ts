/**
 * Unit Tests for Intent Agent
 * 
 * Tests query parsing, budget extraction, requirement detection,
 * and confidence scoring for Spanish and English queries.
 * 
 * NOTE: These tests are structured for future integration with
 * a testing framework like Jest or Vitest. Currently, they serve
 * as documentation of expected behavior.
 */

import { IntentAgent, IntentAgentInput } from '../IntentAgent';
import { IntentAnalysis } from '@decisionhub/shared';

/**
 * Test Suite: Intent Agent Query Parsing
 * 
 * Validates that IntentAgent correctly extracts:
 * - Vehicle category
 * - Budget constraints
 * - User requirements
 * - Query type classification
 * - Confidence scoring
 */

// ========================================
// Test Helper Functions
// ========================================

async function runTest(
  testName: string,
  input: IntentAgentInput,
  expected: Partial<IntentAnalysis>
): Promise<void> {
  const agent = new IntentAgent();
  const result = await agent.execute(input);

  console.log(`\n🧪 TEST: ${testName}`);
  console.log(`   Input: "${input.query}"`);
  console.log(`   Result:`, JSON.stringify(result, null, 2));

  // Validate expectations
  const assertions: string[] = [];

  if (expected.category !== undefined) {
    if (result.category === expected.category) {
      assertions.push(`✅ Category: ${result.category}`);
    } else {
      assertions.push(`❌ Category: expected ${expected.category}, got ${result.category}`);
    }
  }

  if (expected.budget !== undefined) {
    if (JSON.stringify(result.budget) === JSON.stringify(expected.budget)) {
      assertions.push(`✅ Budget: ${JSON.stringify(result.budget)}`);
    } else {
      assertions.push(`❌ Budget: expected ${JSON.stringify(expected.budget)}, got ${JSON.stringify(result.budget)}`);
    }
  }

  if (expected.queryType !== undefined) {
    if (result.queryType === expected.queryType) {
      assertions.push(`✅ Query Type: ${result.queryType}`);
    } else {
      assertions.push(`❌ Query Type: expected ${expected.queryType}, got ${result.queryType}`);
    }
  }

  if (expected.requirements !== undefined) {
    const requirementsMatch = 
      expected.requirements.length === result.requirements.length &&
      expected.requirements.every(req => result.requirements.includes(req));
    
    if (requirementsMatch) {
      assertions.push(`✅ Requirements: [${result.requirements.join(', ')}]`);
    } else {
      assertions.push(`❌ Requirements: expected [${expected.requirements.join(', ')}], got [${result.requirements.join(', ')}]`);
    }
  }

  if (expected.confidence !== undefined) {
    const confidenceDelta = Math.abs(result.confidence - expected.confidence);
    if (confidenceDelta < 0.05) {
      assertions.push(`✅ Confidence: ${result.confidence.toFixed(2)} (expected ~${expected.confidence.toFixed(2)})`);
    } else {
      assertions.push(`❌ Confidence: expected ~${expected.confidence.toFixed(2)}, got ${result.confidence.toFixed(2)}`);
    }
  }

  assertions.forEach(a => console.log(`   ${a}`));
}

// ========================================
// Test Cases: Spanish Queries
// ========================================

async function testSpanishQueries(): Promise<void> {
  console.log('\n========================================');
  console.log('📝 Spanish Query Tests');
  console.log('========================================');

  // Test 1: Complete Spanish query with category, budget, requirements
  await runTest(
    'Spanish: Full query with SUV, budget, and requirements',
    {
      query: 'SUV familiar seguro bajo 180 millones',
      currency: 'COP',
    },
    {
      category: 'suv',
      budget: { max: 180_000_000, currency: 'COP' },
      requirements: ['familiar', 'seguro'],
      queryType: 'recommendation',
      confidence: 0.9, // High confidence: category + budget + requirements
    }
  );

  // Test 2: Budget range
  await runTest(
    'Spanish: Budget range',
    {
      query: 'Sedan entre 100 y 150 millones',
      currency: 'COP',
    },
    {
      category: 'sedan',
      budget: { min: 100_000_000, max: 150_000_000, currency: 'COP' },
      queryType: 'recommendation',
    }
  );

  // Test 3: Multiple requirements
  await runTest(
    'Spanish: Multiple requirements',
    {
      query: 'Camioneta espaciosa confiable económica',
      currency: 'COP',
    },
    {
      category: 'suv',
      requirements: ['espacioso', 'confiable', 'económico'],
      queryType: 'recommendation',
    }
  );

  // Test 4: Comparison query
  await runTest(
    'Spanish: Comparison query',
    {
      query: 'Comparar SUV vs Sedan',
      currency: 'COP',
    },
    {
      queryType: 'comparison',
    }
  );

  // Test 5: Informational query
  await runTest(
    'Spanish: Informational query',
    {
      query: 'Qué es mejor para familia grande?',
      currency: 'COP',
    },
    {
      requirements: ['familiar'],
      queryType: 'informational',
    }
  );
}

// ========================================
// Test Cases: English Queries
// ========================================

async function testEnglishQueries(): Promise<void> {
  console.log('\n========================================');
  console.log('📝 English Query Tests');
  console.log('========================================');

  // Test 1: Complete English query
  await runTest(
    'English: Full query with SUV, budget, and safety',
    {
      query: 'Safe family SUV under 180 million COP',
      currency: 'COP',
    },
    {
      category: 'suv',
      budget: { max: 180_000_000, currency: 'COP' },
      requirements: ['seguro', 'familiar'],
      queryType: 'recommendation',
    }
  );

  // Test 2: Budget in USD
  await runTest(
    'English: Budget in USD',
    {
      query: 'Reliable sedan under 50k',
      currency: 'USD',
    },
    {
      category: 'sedan',
      budget: { max: 50000, currency: 'USD' },
      requirements: ['confiable'],
      queryType: 'recommendation',
    }
  );

  // Test 3: Electric vehicle
  await runTest(
    'English: Electric vehicle query',
    {
      query: 'Modern electric vehicle with technology',
      currency: 'COP',
    },
    {
      category: 'electric',
      requirements: ['moderno', 'tecnología'],
      queryType: 'recommendation',
    }
  );

  // Test 4: Truck query
  await runTest(
    'English: Pickup truck',
    {
      query: 'Pickup truck for off-road',
      currency: 'COP',
    },
    {
      category: 'truck',
      requirements: ['todoterreno'],
      queryType: 'recommendation',
    }
  );
}

// ========================================
// Test Cases: Edge Cases
// ========================================

async function testEdgeCases(): Promise<void> {
  console.log('\n========================================');
  console.log('📝 Edge Case Tests');
  console.log('========================================');

  // Test 1: Minimal query
  await runTest(
    'Edge: Minimal query (just category)',
    {
      query: 'SUV',
      currency: 'COP',
    },
    {
      category: 'suv',
      requirements: [],
      queryType: 'recommendation',
      confidence: 0.8, // Lower confidence: only category
    }
  );

  // Test 2: No category
  await runTest(
    'Edge: No category, just requirements',
    {
      query: 'Necesito algo seguro y económico',
      currency: 'COP',
    },
    {
      category: undefined,
      requirements: ['seguro', 'económico'],
      queryType: 'recommendation',
    }
  );

  // Test 3: Budget without category
  await runTest(
    'Edge: Budget without category',
    {
      query: 'bajo 200 millones',
      currency: 'COP',
    },
    {
      category: undefined,
      budget: { max: 200_000_000, currency: 'COP' },
      queryType: 'recommendation',
    }
  );

  // Test 4: Empty query
  await runTest(
    'Edge: Empty query',
    {
      query: '',
      currency: 'COP',
    },
    {
      category: undefined,
      budget: undefined,
      requirements: [],
      queryType: 'recommendation',
      confidence: 0.5, // Minimum confidence
    }
  );

  // Test 5: Complex mixed language query
  await runTest(
    'Edge: Mixed Spanish and English',
    {
      query: 'SUV familiar safe bajo 150 millones with technology',
      currency: 'COP',
    },
    {
      category: 'suv',
      budget: { max: 150_000_000, currency: 'COP' },
      requirements: ['familiar', 'seguro', 'tecnología'],
      queryType: 'recommendation',
    }
  );
}

// ========================================
// Test Cases: Confidence Scoring
// ========================================

async function testConfidenceScoring(): Promise<void> {
  console.log('\n========================================');
  console.log('📝 Confidence Scoring Tests');
  console.log('========================================');

  // Test 1: Maximum confidence (all fields present)
  await runTest(
    'Confidence: Maximum (category + budget range + requirements)',
    {
      query: 'SUV familiar seguro confiable entre 100 y 150 millones',
      currency: 'COP',
    },
    {
      confidence: 1.0, // Should reach or be very close to 1.0
    }
  );

  // Test 2: Medium confidence (category + budget)
  await runTest(
    'Confidence: Medium (category + budget, no requirements)',
    {
      query: 'Sedan bajo 100 millones',
      currency: 'COP',
    },
    {
      confidence: 0.7, // ~0.7: base + category + budget
    }
  );

  // Test 3: Low confidence (minimal information)
  await runTest(
    'Confidence: Low (only vague requirement)',
    {
      query: 'algo económico',
      currency: 'COP',
    },
    {
      confidence: 0.6, // ~0.6: base + one requirement
    }
  );
}

// ========================================
// Test Runner
// ========================================

async function runAllTests(): Promise<void> {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Intent Agent Unit Tests              ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    await testSpanishQueries();
    await testEnglishQueries();
    await testEdgeCases();
    await testConfidenceScoring();

    console.log('\n========================================');
    console.log('✅ All tests completed!');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    throw error;
  }
}

// ========================================
// Export for future test framework integration
// ========================================

export {
  runAllTests,
  testSpanishQueries,
  testEnglishQueries,
  testEdgeCases,
  testConfidenceScoring,
};

// ========================================
// Run tests if executed directly
// ========================================

// Uncomment to run tests directly with: tsx IntentAgent.test.ts
// runAllTests().catch(console.error);
