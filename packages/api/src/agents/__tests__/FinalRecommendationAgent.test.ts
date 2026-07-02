/**
 * Unit Tests for Final Recommendation Agent
 * 
 * Tests recommendation formatting, Spanish text generation,
 * price formatting, and decision explanation attachment.
 * 
 * Task: TASK-FEAT-AW006
 */

import {
  FinalRecommendationAgent,
  FinalRecommendationInput,
  FinalRecommendationOutput,
} from '../FinalRecommendationAgent';
import { Car, EvaluationResult, Currency } from '@decisionhub/shared';

/**
 * Test Helper Functions
 */

/**
 * Create mock evaluation result
 */
function createMockEvaluationResult(
  overrides: Partial<EvaluationResult> = {}
): EvaluationResult {
  const defaultCar: Car = {
    id: 'test-car-1',
    make: 'Toyota',
    model: 'RAV4',
    year: 2024,
    price: 180000000, // 180M COP
    fuelType: 'hybrid',
    bodyType: 'suv',
    drivetrain: 'awd',
    transmission: 'automatic',
    mpg: {
      city: 40,
      highway: 37,
      combined: 38,
    },
    features: [
      'Toyota Safety Sense 2.5',
      'Apple CarPlay',
      'Android Auto',
      'Cámara de Reversa',
      'Control de Crucero Adaptativo',
      'Asientos de Cuero',
    ],
    specifications: {
      horsepower: 219,
      seating: 5,
      cargoSpace: 1065,
    },
  };

  const defaultResult: EvaluationResult = {
    vehicle: defaultCar,
    finalScore: 87,
    criteriaScores: {
      'Seguridad': 92,
      'Confiabilidad': 88,
      'Eficiencia': 85,
      'Tecnología': 80,
      'Comodidad': 75,
    },
    rank: 1,
  };

  return {
    ...defaultResult,
    ...overrides,
    vehicle: {
      ...defaultCar,
      ...(overrides.vehicle || {}),
    },
  };
}

/**
 * Run a test case and log results
 */
async function runTest(
  testName: string,
  input: FinalRecommendationInput,
  expectations: {
    minRecommendations?: number;
    maxRecommendations?: number;
    topScoreMin?: number;
    hasDecisionExplanation?: boolean;
    hasSpanishText?: boolean;
    hasPriceFormatted?: boolean;
    hasStrengths?: boolean;
    hasConsiderations?: boolean;
  }
): Promise<void> {
  const agent = new FinalRecommendationAgent();
  const result = await agent.execute(input);

  console.log(`\n🧪 TEST: ${testName}`);
  console.log(`   Input: ${input.evaluationResults.length} evaluation results`);
  console.log(`   Output: ${result.recommendations.length} recommendations`);
  console.log(`   Summary:`, JSON.stringify(result.summary, null, 2));

  // Show top recommendation details
  if (result.recommendations.length > 0) {
    const top = result.recommendations[0];
    console.log(`   Top Recommendation:`);
    console.log(`     Vehicle: ${top.car.year} ${top.car.make} ${top.car.model}`);
    console.log(`     Score: ${top.score}`);
    console.log(`     Reasoning: ${top.reasoning.substring(0, 100)}...`);
    console.log(`     Pros (${top.pros.length}):`, top.pros.slice(0, 3));
    console.log(`     Cons (${top.cons.length}):`, top.cons.slice(0, 2));
    console.log(`     Matched Features (${top.matchedFeatures.length}):`, top.matchedFeatures.slice(0, 3));
  }

  // Validate expectations
  const assertions: string[] = [];

  if (expectations.minRecommendations !== undefined) {
    if (result.recommendations.length >= expectations.minRecommendations) {
      assertions.push(`✅ At least ${expectations.minRecommendations} recommendations`);
    } else {
      assertions.push(
        `❌ Expected >= ${expectations.minRecommendations} recommendations, got ${result.recommendations.length}`
      );
    }
  }

  if (expectations.maxRecommendations !== undefined) {
    if (result.recommendations.length <= expectations.maxRecommendations) {
      assertions.push(`✅ At most ${expectations.maxRecommendations} recommendations`);
    } else {
      assertions.push(
        `❌ Expected <= ${expectations.maxRecommendations} recommendations, got ${result.recommendations.length}`
      );
    }
  }

  if (expectations.topScoreMin !== undefined && result.recommendations.length > 0) {
    const topScore = result.recommendations[0].score;
    if (topScore >= expectations.topScoreMin) {
      assertions.push(`✅ Top score >= ${expectations.topScoreMin} (${topScore})`);
    } else {
      assertions.push(`❌ Top score < ${expectations.topScoreMin} (${topScore})`);
    }
  }

  if (expectations.hasDecisionExplanation !== undefined) {
    const hasExplanation = result.recommendations.length > 0 && 
                          input.decisionExplanation !== undefined &&
                          result.recommendations[0].reasoning === input.decisionExplanation;
    if (hasExplanation === expectations.hasDecisionExplanation) {
      assertions.push(
        expectations.hasDecisionExplanation
          ? `✅ Decision explanation attached to top pick`
          : `✅ No decision explanation (as expected)`
      );
    } else {
      assertions.push(
        `❌ Decision explanation ${expectations.hasDecisionExplanation ? 'not attached' : 'unexpectedly attached'}`
      );
    }
  }

  if (expectations.hasSpanishText !== undefined && result.recommendations.length > 0) {
    const reasoning = result.recommendations[0].reasoning;
    const hasSpanish = /\b(El|La|es|una|en|de|con)\b/.test(reasoning);
    if (hasSpanish === expectations.hasSpanishText) {
      assertions.push(
        expectations.hasSpanishText
          ? `✅ Reasoning contains Spanish text`
          : `✅ No Spanish text (as expected)`
      );
    } else {
      assertions.push(`❌ Spanish text ${expectations.hasSpanishText ? 'missing' : 'found unexpectedly'}`);
    }
  }

  if (expectations.hasPriceFormatted !== undefined && result.recommendations.length > 0) {
    const reasoning = result.recommendations[0].reasoning;
    const hasCurrency = /\$|COP|USD|EUR/.test(reasoning);
    if (hasCurrency === expectations.hasPriceFormatted) {
      assertions.push(
        expectations.hasPriceFormatted
          ? `✅ Price formatted in reasoning`
          : `✅ No price formatting (as expected)`
      );
    } else {
      assertions.push(
        `❌ Price formatting ${expectations.hasPriceFormatted ? 'missing' : 'found unexpectedly'}`
      );
    }
  }

  if (expectations.hasStrengths !== undefined && result.recommendations.length > 0) {
    const hasStrengths = result.recommendations[0].pros.length > 0;
    if (hasStrengths === expectations.hasStrengths) {
      assertions.push(
        expectations.hasStrengths
          ? `✅ Strengths generated (${result.recommendations[0].pros.length})`
          : `✅ No strengths (as expected)`
      );
    } else {
      assertions.push(
        `❌ Strengths ${expectations.hasStrengths ? 'missing' : 'found unexpectedly'}`
      );
    }
  }

  if (expectations.hasConsiderations !== undefined && result.recommendations.length > 0) {
    const hasConsiderations = result.recommendations[0].cons.length > 0;
    if (hasConsiderations === expectations.hasConsiderations) {
      assertions.push(
        expectations.hasConsiderations
          ? `✅ Considerations generated (${result.recommendations[0].cons.length})`
          : `✅ No considerations (as expected)`
      );
    } else {
      assertions.push(
        `❌ Considerations ${expectations.hasConsiderations ? 'missing' : 'found unexpectedly'}`
      );
    }
  }

  // Print assertions
  console.log(`   Assertions:`);
  assertions.forEach((assertion) => console.log(`     ${assertion}`));

  const allPassed = assertions.every((a) => a.startsWith('✅'));
  if (allPassed) {
    console.log(`   ✅ TEST PASSED`);
  } else {
    console.log(`   ❌ TEST FAILED`);
  }
}

/**
 * Test Cases
 */

async function testBasicRecommendationFormatting(): Promise<void> {
  const evaluationResults: EvaluationResult[] = [
    createMockEvaluationResult({ rank: 1, finalScore: 87 }),
    createMockEvaluationResult({
      rank: 2,
      finalScore: 82,
      vehicle: { id: 'test-car-2', make: 'Honda', model: 'CR-V', year: 2023 } as Car,
    }),
    createMockEvaluationResult({
      rank: 3,
      finalScore: 78,
      vehicle: { id: 'test-car-3', make: 'Mazda', model: 'CX-5', year: 2024 } as Car,
    }),
  ];

  await runTest(
    'Basic Recommendation Formatting',
    { evaluationResults },
    {
      minRecommendations: 3,
      maxRecommendations: 3,
      topScoreMin: 87,
      hasSpanishText: true,
      hasPriceFormatted: true,
      hasStrengths: true,
    }
  );
}

async function testDecisionExplanationAttachment(): Promise<void> {
  const evaluationResults: EvaluationResult[] = [
    createMockEvaluationResult({ rank: 1, finalScore: 90 }),
    createMockEvaluationResult({ rank: 2, finalScore: 75 }),
  ];

  const decisionExplanation =
    'El Toyota RAV4 2024 es la mejor opción debido a su excelente equilibrio entre seguridad, eficiencia y confiabilidad. Su sistema híbrido ofrece un consumo excepcional mientras que el Toyota Safety Sense 2.5 proporciona la protección necesaria para tu familia.';

  await runTest(
    'Decision Explanation Attachment',
    { evaluationResults, decisionExplanation },
    {
      minRecommendations: 2,
      hasDecisionExplanation: true,
      hasSpanishText: true,
    }
  );
}

async function testTop5Limit(): Promise<void> {
  // Create 10 evaluation results
  const evaluationResults: EvaluationResult[] = Array.from({ length: 10 }, (_, i) =>
    createMockEvaluationResult({
      rank: i + 1,
      finalScore: 90 - i * 3,
      vehicle: {
        id: `test-car-${i + 1}`,
        make: 'Toyota',
        model: `Model-${i + 1}`,
        year: 2024,
      } as Car,
    })
  );

  await runTest(
    'Top 5 Limit (10 inputs → 5 outputs)',
    { evaluationResults },
    {
      minRecommendations: 5,
      maxRecommendations: 5, // Should limit to top 5
    }
  );
}

async function testCOPPriceFormatting(): Promise<void> {
  const evaluationResults: EvaluationResult[] = [
    createMockEvaluationResult({
      rank: 1,
      finalScore: 85,
      vehicle: { price: 250000000 } as Car, // 250M COP
    }),
  ];

  await runTest(
    'COP Price Formatting',
    { evaluationResults, currency: 'COP' },
    {
      minRecommendations: 1,
      hasPriceFormatted: true,
    }
  );
}

async function testUSDPriceFormatting(): Promise<void> {
  const evaluationResults: EvaluationResult[] = [
    createMockEvaluationResult({
      rank: 1,
      finalScore: 85,
      vehicle: { price: 45000 } as Car, // $45K USD
    }),
  ];

  await runTest(
    'USD Price Formatting',
    { evaluationResults, currency: 'USD' },
    {
      minRecommendations: 1,
      hasPriceFormatted: true,
    }
  );
}

async function testStrengthsGeneration(): Promise<void> {
  const evaluationResults: EvaluationResult[] = [
    createMockEvaluationResult({
      rank: 1,
      finalScore: 92,
      criteriaScores: {
        'Seguridad': 95,
        'Confiabilidad': 90,
        'Eficiencia': 88,
        'Tecnología': 85,
        'Comodidad': 80,
      },
      vehicle: {
        year: 2024, // Recent model
        fuelType: 'hybrid',
        mpg: { city: 42, highway: 38, combined: 40 },
      } as Car,
    }),
  ];

  await runTest(
    'Strengths Generation (High Scores)',
    { evaluationResults },
    {
      minRecommendations: 1,
      hasStrengths: true,
    }
  );
}

async function testConsiderationsGeneration(): Promise<void> {
  const evaluationResults: EvaluationResult[] = [
    createMockEvaluationResult({
      rank: 1,
      finalScore: 65, // Moderate score
      criteriaScores: {
        'Seguridad': 70,
        'Confiabilidad': 55, // Low score
        'Eficiencia': 50, // Low score
        'Tecnología': 68,
        'Comodidad': 72,
      },
      vehicle: {
        year: 2016, // Older model (8 years old)
        mpg: { city: 18, highway: 24, combined: 20 },
      } as Car,
    }),
  ];

  await runTest(
    'Considerations Generation (Low Scores, Old Model)',
    { evaluationResults },
    {
      minRecommendations: 1,
      hasConsiderations: true,
    }
  );
}

async function testMatchedFeaturesExtraction(): Promise<void> {
  const evaluationResults: EvaluationResult[] = [
    createMockEvaluationResult({
      rank: 1,
      finalScore: 88,
      vehicle: {
        features: [
          'Toyota Safety Sense 2.5',
          'Apple CarPlay',
          'Android Auto',
          'Cámara de Reversa',
          'Control de Crucero Adaptativo',
          'Asientos de Cuero',
          'Climatizador Automático',
          'Sistema de Navegación',
        ],
      } as Car,
    }),
  ];

  await runTest(
    'Matched Features Extraction',
    { evaluationResults },
    {
      minRecommendations: 1,
    }
  );
}

async function testEmptyInput(): Promise<void> {
  await runTest(
    'Empty Input (No Evaluation Results)',
    { evaluationResults: [] },
    {
      minRecommendations: 0,
      maxRecommendations: 0,
    }
  );
}

async function testSingleRecommendation(): Promise<void> {
  const evaluationResults: EvaluationResult[] = [
    createMockEvaluationResult({ rank: 1, finalScore: 85 }),
  ];

  await runTest(
    'Single Recommendation',
    { evaluationResults },
    {
      minRecommendations: 1,
      maxRecommendations: 1,
      hasStrengths: true,
      hasSpanishText: true,
    }
  );
}

async function testSummaryCalculation(): Promise<void> {
  const evaluationResults: EvaluationResult[] = [
    createMockEvaluationResult({ rank: 1, finalScore: 90 }),
    createMockEvaluationResult({ rank: 2, finalScore: 80 }),
    createMockEvaluationResult({ rank: 3, finalScore: 70 }),
  ];

  const agent = new FinalRecommendationAgent();
  const result = await agent.execute({ evaluationResults });

  console.log(`\n🧪 TEST: Summary Calculation`);
  console.log(`   Expected average: 80, Got: ${result.summary.averageScore}`);
  console.log(`   Expected top score: 90, Got: ${result.summary.topScore}`);
  console.log(`   Expected total: 3, Got: ${result.summary.totalRecommendations}`);

  const assertions: string[] = [];

  if (result.summary.averageScore === 80) {
    assertions.push(`✅ Average score correct (80)`);
  } else {
    assertions.push(`❌ Average score incorrect (expected 80, got ${result.summary.averageScore})`);
  }

  if (result.summary.topScore === 90) {
    assertions.push(`✅ Top score correct (90)`);
  } else {
    assertions.push(`❌ Top score incorrect (expected 90, got ${result.summary.topScore})`);
  }

  if (result.summary.totalRecommendations === 3) {
    assertions.push(`✅ Total recommendations correct (3)`);
  } else {
    assertions.push(
      `❌ Total recommendations incorrect (expected 3, got ${result.summary.totalRecommendations})`
    );
  }

  console.log(`   Assertions:`);
  assertions.forEach((assertion) => console.log(`     ${assertion}`));

  const allPassed = assertions.every((a) => a.startsWith('✅'));
  if (allPassed) {
    console.log(`   ✅ TEST PASSED`);
  } else {
    console.log(`   ❌ TEST FAILED`);
  }
}

/**
 * Main Test Runner
 */
async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Final Recommendation Agent - Unit Tests');
  console.log('  Task: TASK-FEAT-AW006');
  console.log('═══════════════════════════════════════════════════════════════');

  try {
    await testBasicRecommendationFormatting();
    await testDecisionExplanationAttachment();
    await testTop5Limit();
    await testCOPPriceFormatting();
    await testUSDPriceFormatting();
    await testStrengthsGeneration();
    await testConsiderationsGeneration();
    await testMatchedFeaturesExtraction();
    await testEmptyInput();
    await testSingleRecommendation();
    await testSummaryCalculation();

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  ✅ All Tests Completed');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
    process.exit(1);
  }
}

export { main as runFinalRecommendationAgentTests };

// Run tests
main();
