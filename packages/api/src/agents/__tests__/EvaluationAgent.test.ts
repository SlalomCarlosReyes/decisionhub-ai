/**
 * Unit Tests for Evaluation Agent
 * 
 * Tests vehicle scoring, weighted criteria evaluation, filtering,
 * ranking, and edge cases for the Evaluation Agent.
 * 
 * Task: TASK-FEAT-AW003
 */

import { EvaluationAgent, EvaluationInput, EvaluationOutput } from '../EvaluationAgent';
import {
  Car,
  DecisionCriteria,
  CarSearchCriteria,
  EvaluationResult,
} from '@decisionhub/shared';

/**
 * Test Helper Functions
 */

/**
 * Run a test case and log results
 */
async function runTest(
  testName: string,
  input: EvaluationInput,
  expected: {
    minScore?: number;
    maxScore?: number;
    minResults?: number;
    maxResults?: number;
    topVehicleMake?: string;
  }
): Promise<void> {
  const agent = new EvaluationAgent();
  const result = await agent.execute(input);

  console.log(`\n🧪 TEST: ${testName}`);
  console.log(`   Input: ${input.vehicles.length} vehicles, ${input.criteria.length} criteria`);
  console.log(`   Results: ${result.evaluationResults.length} vehicles passed threshold`);
  console.log(`   Summary:`, JSON.stringify(result.summary, null, 2));

  // Show top 3 results
  if (result.evaluationResults.length > 0) {
    console.log(`   Top 3 vehicles:`);
    result.evaluationResults.slice(0, 3).forEach((r) => {
      console.log(
        `     ${r.rank}. ${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model} - Score: ${r.finalScore}`
      );
      console.log(`        Criteria scores:`, JSON.stringify(r.criteriaScores));
    });
  }

  // Validate expectations
  const assertions: string[] = [];

  if (expected.minScore !== undefined && result.evaluationResults.length > 0) {
    const allMeetMin = result.evaluationResults.every((r) => r.finalScore >= expected.minScore!);
    if (allMeetMin) {
      assertions.push(`✅ All scores >= ${expected.minScore}`);
    } else {
      assertions.push(`❌ Some scores < ${expected.minScore}`);
    }
  }

  if (expected.maxScore !== undefined && result.evaluationResults.length > 0) {
    const allBelowMax = result.evaluationResults.every((r) => r.finalScore <= expected.maxScore!);
    if (allBelowMax) {
      assertions.push(`✅ All scores <= ${expected.maxScore}`);
    } else {
      assertions.push(`❌ Some scores > ${expected.maxScore}`);
    }
  }

  if (expected.minResults !== undefined) {
    if (result.evaluationResults.length >= expected.minResults) {
      assertions.push(`✅ At least ${expected.minResults} results returned`);
    } else {
      assertions.push(
        `❌ Expected >= ${expected.minResults} results, got ${result.evaluationResults.length}`
      );
    }
  }

  if (expected.maxResults !== undefined) {
    if (result.evaluationResults.length <= expected.maxResults) {
      assertions.push(`✅ At most ${expected.maxResults} results returned`);
    } else {
      assertions.push(
        `❌ Expected <= ${expected.maxResults} results, got ${result.evaluationResults.length}`
      );
    }
  }

  if (expected.topVehicleMake !== undefined && result.evaluationResults.length > 0) {
    const topVehicle = result.evaluationResults[0];
    if (topVehicle.vehicle.make === expected.topVehicleMake) {
      assertions.push(`✅ Top vehicle is ${expected.topVehicleMake}`);
    } else {
      assertions.push(
        `❌ Expected top vehicle to be ${expected.topVehicleMake}, got ${topVehicle.vehicle.make}`
      );
    }
  }

  // Check ranking consistency
  const ranksValid = result.evaluationResults.every(
    (r, index) => r.rank === index + 1
  );
  if (ranksValid) {
    assertions.push(`✅ Rankings are sequential (1, 2, 3, ...)`);
  } else {
    assertions.push(`❌ Rankings are not sequential`);
  }

  // Check score ordering (highest to lowest)
  const scoresDescending = result.evaluationResults.every(
    (r, index, arr) => index === 0 || r.finalScore <= arr[index - 1].finalScore
  );
  if (scoresDescending) {
    assertions.push(`✅ Scores are in descending order`);
  } else {
    assertions.push(`❌ Scores are not in descending order`);
  }

  assertions.forEach((a) => console.log(`   ${a}`));
}

/**
 * Create mock vehicles for testing
 */
function createMockVehicles(): Car[] {
  return [
    {
      id: '1',
      make: 'Toyota',
      model: 'RAV4',
      year: 2024,
      price: 150_000_000,
      fuelType: 'hybrid',
      bodyType: 'suv',
      drivetrain: 'awd',
      transmission: 'automatic',
      mpg: { city: 40, highway: 37, combined: 38 },
      features: [
        'Airbags',
        'ABS',
        'Control de estabilidad',
        'Lane assist',
        'Frenado automático',
        'Cámara trasera',
        'Apple CarPlay',
        'Android Auto',
        'Climate control',
        'Leather seats',
      ],
      specifications: {
        horsepower: 219,
        seating: 5,
        cargoSpace: 69,
      },
    },
    {
      id: '2',
      make: 'Honda',
      model: 'CR-V',
      year: 2023,
      price: 140_000_000,
      fuelType: 'gasoline',
      bodyType: 'suv',
      drivetrain: 'awd',
      transmission: 'cvt',
      mpg: { city: 28, highway: 34, combined: 30 },
      features: [
        'Airbags',
        'ABS',
        'Stability control',
        'Backup camera',
        'Bluetooth',
        'Climate control',
        'Heated seats',
      ],
      specifications: {
        horsepower: 190,
        seating: 5,
        cargoSpace: 75,
      },
    },
    {
      id: '3',
      make: 'Mazda',
      model: 'CX-5',
      year: 2024,
      price: 135_000_000,
      fuelType: 'gasoline',
      bodyType: 'suv',
      drivetrain: 'awd',
      transmission: 'automatic',
      mpg: { city: 25, highway: 31, combined: 27 },
      features: [
        'Airbags',
        'ABS',
        'Lane assist',
        'Apple CarPlay',
        'Android Auto',
        'Leather',
        'Touchscreen',
      ],
      specifications: {
        horsepower: 187,
        seating: 5,
        cargoSpace: 59,
      },
    },
    {
      id: '4',
      make: 'Ford',
      model: 'Explorer',
      year: 2020,
      price: 120_000_000,
      fuelType: 'gasoline',
      bodyType: 'suv',
      drivetrain: 'awd',
      transmission: 'automatic',
      mpg: { city: 18, highway: 24, combined: 20 },
      features: ['Airbags', 'ABS', 'Bluetooth', 'Backup camera'],
      specifications: {
        horsepower: 300,
        seating: 7,
        cargoSpace: 87,
      },
    },
    {
      id: '5',
      make: 'Nissan',
      model: 'Rogue',
      year: 2019,
      price: 100_000_000,
      fuelType: 'gasoline',
      bodyType: 'suv',
      drivetrain: 'awd',
      transmission: 'cvt',
      mpg: { city: 26, highway: 33, combined: 29 },
      features: ['Airbags', 'ABS', 'Backup camera', 'Bluetooth'],
      specifications: {
        horsepower: 170,
        seating: 5,
        cargoSpace: 70,
      },
    },
  ];
}

/**
 * Test Suite: Basic Scoring
 */
async function testBasicScoring(): Promise<void> {
  console.log('\n========================================');
  console.log('📝 Basic Scoring Tests');
  console.log('========================================');

  const vehicles = createMockVehicles();

  // Test 1: Safety-focused criteria
  await runTest(
    'Safety-focused evaluation',
    {
      vehicles,
      criteria: [
        { name: 'Seguridad', weight: 0.5, description: 'Safety features' },
        { name: 'Confiabilidad', weight: 0.3, description: 'Reliability' },
        { name: 'Tecnología', weight: 0.2, description: 'Technology' },
      ],
      searchCriteria: {
        maxPrice: 180_000_000,
        bodyTypes: ['suv'],
      },
    },
    {
      minScore: 50,
      maxScore: 100,
      minResults: 3,
    }
  );

  // Test 2: Efficiency-focused criteria
  await runTest(
    'Efficiency-focused evaluation',
    {
      vehicles,
      criteria: [
        { name: 'Eficiencia', weight: 0.6, description: 'Fuel efficiency' },
        { name: 'Valor', weight: 0.4, description: 'Value for money' },
      ],
      searchCriteria: {
        maxPrice: 180_000_000,
        bodyTypes: ['suv'],
      },
    },
    {
      minScore: 50,
      minResults: 3,
      topVehicleMake: 'Toyota', // Hybrid RAV4 should win on efficiency
    }
  );

  // Test 3: Comfort and space focused
  await runTest(
    'Comfort-focused evaluation',
    {
      vehicles,
      criteria: [
        { name: 'Comodidad', weight: 0.4, description: 'Comfort features' },
        { name: 'Espacioso', weight: 0.4, description: 'Spacious interior' },
        { name: 'Tecnología', weight: 0.2, description: 'Technology' },
      ],
      searchCriteria: {
        maxPrice: 180_000_000,
        bodyTypes: ['suv'],
      },
    },
    {
      minScore: 50,
      minResults: 3,
    }
  );
}

/**
 * Test Suite: Filtering and Ranking
 */
async function testFilteringAndRanking(): Promise<void> {
  console.log('\n========================================');
  console.log('📝 Filtering and Ranking Tests');
  console.log('========================================');

  const vehicles = createMockVehicles();

  // Test 1: High threshold - should filter out low scorers
  await runTest(
    'Strict criteria (should filter some vehicles)',
    {
      vehicles,
      criteria: [
        { name: 'Seguridad', weight: 0.4, description: 'Safety' },
        { name: 'Tecnología', weight: 0.6, description: 'Technology' },
      ],
      searchCriteria: {
        maxPrice: 180_000_000,
        requiredFeatures: ['Apple CarPlay', 'Lane assist', 'Leather'],
      },
    },
    {
      minScore: 50,
      maxResults: 5,
    }
  );

  // Test 2: All should pass with balanced criteria
  await runTest(
    'Balanced criteria (all should pass)',
    {
      vehicles,
      criteria: [
        { name: 'Confiabilidad', weight: 0.5, description: 'Reliability' },
        { name: 'Valor', weight: 0.5, description: 'Value' },
      ],
      searchCriteria: {
        maxPrice: 180_000_000,
      },
    },
    {
      minScore: 50,
      minResults: 4,
    }
  );
}

/**
 * Test Suite: Budget Adjustment
 */
async function testBudgetAdjustment(): Promise<void> {
  console.log('\n========================================');
  console.log('📝 Budget Adjustment Tests');
  console.log('========================================');

  const vehicles = createMockVehicles();

  // Test 1: Low budget - should penalize expensive vehicles
  await runTest(
    'Low budget (120M COP) - should favor cheaper vehicles',
    {
      vehicles,
      criteria: [
        { name: 'Valor', weight: 0.5, description: 'Value' },
        { name: 'Confiabilidad', weight: 0.5, description: 'Reliability' },
      ],
      searchCriteria: {
        maxPrice: 120_000_000,
      },
    },
    {
      minScore: 50,
    }
  );

  // Test 2: High budget - expensive vehicles not penalized
  await runTest(
    'High budget (200M COP) - all vehicles within budget',
    {
      vehicles,
      criteria: [
        { name: 'Seguridad', weight: 0.5, description: 'Safety' },
        { name: 'Tecnología', weight: 0.5, description: 'Technology' },
      ],
      searchCriteria: {
        maxPrice: 200_000_000,
      },
    },
    {
      minScore: 50,
      minResults: 3,
    }
  );
}

/**
 * Test Suite: Edge Cases
 */
async function testEdgeCases(): Promise<void> {
  console.log('\n========================================');
  console.log('📝 Edge Case Tests');
  console.log('========================================');

  // Test 1: Empty vehicles list
  await runTest(
    'Empty vehicles list',
    {
      vehicles: [],
      criteria: [{ name: 'Seguridad', weight: 1.0, description: 'Safety' }],
      searchCriteria: { maxPrice: 180_000_000 },
    },
    {
      minResults: 0,
      maxResults: 0,
    }
  );

  // Test 2: Single criterion
  await runTest(
    'Single criterion (100% weight)',
    {
      vehicles: createMockVehicles(),
      criteria: [{ name: 'Eficiencia', weight: 1.0, description: 'Efficiency only' }],
      searchCriteria: { maxPrice: 180_000_000 },
    },
    {
      minScore: 50,
      topVehicleMake: 'Toyota', // Hybrid should win
    }
  );

  // Test 3: No budget specified
  await runTest(
    'No budget specified',
    {
      vehicles: createMockVehicles(),
      criteria: [
        { name: 'Seguridad', weight: 0.5, description: 'Safety' },
        { name: 'Confiabilidad', weight: 0.5, description: 'Reliability' },
      ],
      searchCriteria: {},
    },
    {
      minScore: 50,
    }
  );

  // Test 4: Vehicle with minimal features
  const minimalVehicle: Car = {
    id: '6',
    make: 'Basic',
    model: 'Car',
    year: 2015,
    price: 50_000_000,
    fuelType: 'gasoline',
    features: [],
    specifications: {},
  };

  await runTest(
    'Vehicle with minimal features',
    {
      vehicles: [minimalVehicle, ...createMockVehicles()],
      criteria: [
        { name: 'Seguridad', weight: 0.6, description: 'Safety' },
        { name: 'Tecnología', weight: 0.4, description: 'Technology' },
      ],
      searchCriteria: {
        maxPrice: 180_000_000,
        requiredFeatures: ['Apple CarPlay', 'Airbags'],
      },
    },
    {
      minScore: 50,
    }
  );
}

/**
 * Test Suite: Weighted Scoring Validation
 */
async function testWeightedScoring(): Promise<void> {
  console.log('\n========================================');
  console.log('📝 Weighted Scoring Validation Tests');
  console.log('========================================');

  const vehicles = createMockVehicles();

  // Test 1: Heavy weight on one criterion
  await runTest(
    'Heavy weight on safety (80%)',
    {
      vehicles,
      criteria: [
        { name: 'Seguridad', weight: 0.8, description: 'Safety - primary' },
        { name: 'Tecnología', weight: 0.2, description: 'Technology - secondary' },
      ],
      searchCriteria: { maxPrice: 180_000_000 },
    },
    {
      minScore: 50,
    }
  );

  // Test 2: Equal weights
  await runTest(
    'Equal weights across four criteria',
    {
      vehicles,
      criteria: [
        { name: 'Seguridad', weight: 0.25, description: 'Safety' },
        { name: 'Confiabilidad', weight: 0.25, description: 'Reliability' },
        { name: 'Eficiencia', weight: 0.25, description: 'Efficiency' },
        { name: 'Tecnología', weight: 0.25, description: 'Technology' },
      ],
      searchCriteria: { maxPrice: 180_000_000 },
    },
    {
      minScore: 50,
    }
  );
}

/**
 * Main test runner
 */
async function runAllTests(): Promise<void> {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   Evaluation Agent Unit Tests                          ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  try {
    await testBasicScoring();
    await testFilteringAndRanking();
    await testBudgetAdjustment();
    await testEdgeCases();
    await testWeightedScoring();

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   ✅ All tests completed!                              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export for use in other test files
export { runAllTests, createMockVehicles };
