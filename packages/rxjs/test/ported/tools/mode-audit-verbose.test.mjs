import assert from 'node:assert/strict';
import test from 'node:test';
import { reportFromVerboseOutput } from './mode-audit-verbose.mjs';

const migrationEntries = [
  { file: 'test/ported/cold/a.spec.ts', caseIds: ['A', 'B'] },
  { file: 'test/ported/cold/b.spec.ts', caseIds: ['C'] },
];

test('collects verbose Vitest outcomes in declaration order', () => {
  const report = reportFromVerboseOutput({
    migrationEntries,
    packageDirectory: '/workspace/packages/rxjs',
    output: [
      ' ✓ test/ported/cold/a.spec.ts > suite > first 1ms',
      ' × test/ported/cold/a.spec.ts > suite > second 2ms',
      ' ✓ test/ported/cold/b.spec.ts > suite > third 1ms',
    ].join('\n'),
  });
  assert.deepEqual(
    [report.numTotalTests, report.numPassedTests, report.numFailedTests, report.numPendingTests, report.unhandledErrors],
    [3, 2, 1, 0, 0]
  );
  assert.deepEqual(report.testResults[0].assertionResults, [{ status: 'passed' }, { status: 'failed' }]);
});

test('retains incomplete files and unhandled errors for the baseline validator', () => {
  const report = reportFromVerboseOutput({ migrationEntries, packageDirectory: '/workspace/packages/rxjs', output: 'Unhandled Error' });
  assert.equal(report.numTotalTests, 0);
  assert.equal(report.unhandledErrors, 1);
  assert.deepEqual(
    report.testResults.map((result) => result.assertionResults),
    [[], []]
  );
});

test('rejects results from an unexpected test file', () => {
  assert.throws(
    () =>
      reportFromVerboseOutput({
        migrationEntries,
        packageDirectory: '/workspace/packages/rxjs',
        output: ' ✓ test/ported/cold/unknown.spec.ts > suite > test',
      }),
    /unexpected test file/
  );
});
