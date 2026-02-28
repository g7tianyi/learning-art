#!/usr/bin/env tsx

/**
 * SM-2 Algorithm Unit Tests
 *
 * Tests the core SM-2 algorithm implementation for correctness.
 */

import {
  calculateSM2,
  createInitialSchedule,
  simpleQualityToSM2,
  updateReviewSchedule,
  estimateReviewsToMastery,
  getRecommendedDailyLimit,
  SimpleQuality,
  type SM2Input
} from './sm2';

// ============================================================================
// Test Framework (Minimal)
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (err) {
    results.push({ name, passed: false, error: (err as Error).message });
    console.error(`✗ ${name}`);
    console.error(`  Error: ${(err as Error).message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${expected}, got ${actual}`
    );
  }
}

function assertClose(actual: number, expected: number, tolerance: number = 0.01) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Expected ${expected} (±${tolerance}), got ${actual}`);
  }
}

function assertTrue(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

// ============================================================================
// Tests: Core Algorithm
// ============================================================================

test('SM-2: First review with perfect recall (quality 5)', () => {
  const input: SM2Input = {
    quality: 5,
    easinessFactor: 2.5,
    interval: 1,
    repetition: 0
  };

  const output = calculateSM2(input);

  assertEqual(output.repetition, 1, 'Repetition should increment to 1');
  assertEqual(output.interval, 1, 'First interval should be 1 day');
  assertClose(output.easinessFactor, 2.6, 0.01); // EF increases for quality 5
});

test('SM-2: Second review with perfect recall (quality 5)', () => {
  const input: SM2Input = {
    quality: 5,
    easinessFactor: 2.6,
    interval: 1,
    repetition: 1
  };

  const output = calculateSM2(input);

  assertEqual(output.repetition, 2, 'Repetition should increment to 2');
  assertEqual(output.interval, 6, 'Second interval should be 6 days');
});

test('SM-2: Third review with perfect recall (quality 5)', () => {
  const input: SM2Input = {
    quality: 5,
    easinessFactor: 2.7,
    interval: 6,
    repetition: 2
  };

  const output = calculateSM2(input);

  assertEqual(output.repetition, 3, 'Repetition should increment to 3');
  // interval = previous_interval * EF = 6 * 2.7 ≈ 16
  assertTrue(output.interval >= 15 && output.interval <= 17, 'Third interval should be ~16 days');
});

test('SM-2: Failed recall (quality < 3) resets progress', () => {
  const input: SM2Input = {
    quality: 2,
    easinessFactor: 2.7,
    interval: 16,
    repetition: 3
  };

  const output = calculateSM2(input);

  assertEqual(output.repetition, 0, 'Repetition should reset to 0');
  assertEqual(output.interval, 1, 'Interval should reset to 1 day');
});

test('SM-2: Difficult recall (quality 3) continues but slower', () => {
  const input: SM2Input = {
    quality: 3,
    easinessFactor: 2.5,
    interval: 6,
    repetition: 2
  };

  const output = calculateSM2(input);

  assertEqual(output.repetition, 3, 'Repetition should increment');
  assertTrue(output.easinessFactor < 2.5, 'EF should decrease for quality 3');
});

test('SM-2: Easiness factor never goes below 1.3', () => {
  const input: SM2Input = {
    quality: 0, // Complete failure
    easinessFactor: 1.3,
    interval: 1,
    repetition: 0
  };

  const output = calculateSM2(input);

  assertTrue(output.easinessFactor >= 1.3, 'EF should never go below 1.3');
});

test('SM-2: Quality validation (must be 0-5)', () => {
  const invalidInputs = [
    { quality: -1, easinessFactor: 2.5, interval: 1, repetition: 0 },
    { quality: 6, easinessFactor: 2.5, interval: 1, repetition: 0 }
  ];

  invalidInputs.forEach((input, i) => {
    try {
      calculateSM2(input);
      throw new Error(`Should have thrown for invalid quality: ${input.quality}`);
    } catch (err) {
      // Expected to throw
      assertTrue((err as Error).message.includes('Quality must be between 0 and 5'), 'Should validate quality range');
    }
  });
});

// ============================================================================
// Tests: Simple Quality Mapping
// ============================================================================

test('Simple quality mapping: Hard → 3, Medium → 4, Easy → 5', () => {
  assertEqual(simpleQualityToSM2(SimpleQuality.HARD), 3);
  assertEqual(simpleQualityToSM2(SimpleQuality.MEDIUM), 4);
  assertEqual(simpleQualityToSM2(SimpleQuality.EASY), 5);
});

test('Update review schedule with simple quality (Easy)', () => {
  const output = updateReviewSchedule(
    SimpleQuality.EASY,
    2.5, // current EF
    1,   // current interval
    0    // current repetition
  );

  assertEqual(output.repetition, 1);
  assertEqual(output.interval, 1);
  assertTrue(output.easinessFactor > 2.5, 'EF should increase for Easy rating');
});

test('Update review schedule with simple quality (Hard)', () => {
  const output = updateReviewSchedule(
    SimpleQuality.HARD,
    2.5,
    6,
    2
  );

  assertEqual(output.repetition, 3);
  assertTrue(output.easinessFactor < 2.5, 'EF should decrease for Hard rating');
});

// ============================================================================
// Tests: Initial Schedule
// ============================================================================

test('Create initial schedule', () => {
  const schedule = createInitialSchedule();

  assertEqual(schedule.easinessFactor, 2.5, 'Initial EF should be 2.5');
  assertEqual(schedule.interval, 1, 'Initial interval should be 1 day');
  assertEqual(schedule.repetition, 0, 'Initial repetition should be 0');
  assertTrue(schedule.nextReviewDate.length > 0, 'Should have next review date');
});

// ============================================================================
// Tests: Statistics
// ============================================================================

test('Estimate reviews to mastery', () => {
  assertEqual(estimateReviewsToMastery(0), 7, 'Should need 7 reviews from start');
  assertEqual(estimateReviewsToMastery(3), 4, 'Should need 4 more reviews after 3 successful');
  assertEqual(estimateReviewsToMastery(7), 0, 'Should be mastered after 7 reviews');
  assertEqual(estimateReviewsToMastery(10), 0, 'Should not go negative');
});

test('Get recommended daily limit', () => {
  assertEqual(getRecommendedDailyLimit(50), 5, 'Small collection: 5 per day');
  assertEqual(getRecommendedDailyLimit(200), 8, 'Medium collection: 8 per day');
  assertEqual(getRecommendedDailyLimit(328), 10, 'Large collection: 10 per day');
});

// ============================================================================
// Integration Test: Complete Review Cycle
// ============================================================================

test('Integration: Complete review cycle simulation', () => {
  console.log('  Simulating 10 reviews with varying quality...');

  let state = {
    easinessFactor: 2.5,
    interval: 1,
    repetition: 0
  };

  // Review 1: Easy (quality 5)
  let result = calculateSM2({ ...state, quality: 5 });
  assertEqual(result.repetition, 1, 'Review 1: repetition should be 1');
  assertEqual(result.interval, 1, 'Review 1: interval should be 1');
  state = result;

  // Review 2: Easy (quality 5)
  result = calculateSM2({ ...state, quality: 5 });
  assertEqual(result.repetition, 2, 'Review 2: repetition should be 2');
  assertEqual(result.interval, 6, 'Review 2: interval should be 6');
  state = result;

  // Review 3: Easy (quality 5)
  result = calculateSM2({ ...state, quality: 5 });
  assertEqual(result.repetition, 3, 'Review 3: repetition should be 3');
  assertTrue(result.interval > 10, 'Review 3: interval should be >10 days');
  state = result;

  // Review 4: Hard (quality 3) - still correct but difficult
  result = calculateSM2({ ...state, quality: 3 });
  assertEqual(result.repetition, 4, 'Review 4: repetition should continue');
  assertTrue(result.easinessFactor < state.easinessFactor, 'Review 4: EF should decrease');
  state = result;

  // Review 5: Failed (quality 2) - forgot!
  result = calculateSM2({ ...state, quality: 2 });
  assertEqual(result.repetition, 0, 'Review 5: repetition should reset to 0');
  assertEqual(result.interval, 1, 'Review 5: interval should reset to 1');
  state = result;

  // Review 6: Medium (quality 4) - recovering
  result = calculateSM2({ ...state, quality: 4 });
  assertEqual(result.repetition, 1, 'Review 6: starting over, repetition = 1');
  state = result;

  console.log(`  Final state: EF=${state.easinessFactor.toFixed(2)}, interval=${state.interval}, rep=${state.repetition}`);
});

// ============================================================================
// Run All Tests
// ============================================================================

function runTests() {
  console.log('='.repeat(80));
  console.log('SM-2 Algorithm Unit Tests');
  console.log('='.repeat(80));
  console.log('');

  // Tests are already run via test() calls above

  console.log('');
  console.log('='.repeat(80));
  console.log('Test Results');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('');
    console.log('Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('');
    console.log('✓ All tests passed!');
  }
}

runTests();
