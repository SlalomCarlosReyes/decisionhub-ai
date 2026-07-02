/**
 * Manual test runner for IntentAgent
 * Run with: tsx packages/api/src/agents/__tests__/run-intent-tests.ts
 */

import { runAllTests } from './IntentAgent.test.js';

console.log('Starting IntentAgent tests...\n');

runAllTests()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  });
