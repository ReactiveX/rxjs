import assert from 'node:assert/strict';
import test from 'node:test';
import { findIncompleteAuditEntries, replaceAuditReportResults, reportFromVerboseOutput } from './mode-audit-verbose.mjs';

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

test('collects progress records separated by bare carriage returns', () => {
  const report = reportFromVerboseOutput({
    migrationEntries: [migrationEntries[0]],
    packageDirectory: '/workspace/packages/rxjs',
    output: ' ✓ test/ported/cold/a.spec.ts > suite > first\r × test/ported/cold/a.spec.ts > suite > second\r',
  });
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
  assert.deepEqual(findIncompleteAuditEntries({ migrationEntries, report }), migrationEntries);
});

test('replaces isolated file results and recalculates totals', () => {
  const report = reportFromVerboseOutput({ migrationEntries, packageDirectory: '/workspace/packages/rxjs', output: '' });
  const replacement = reportFromVerboseOutput({
    migrationEntries: [migrationEntries[0]],
    packageDirectory: '/workspace/packages/rxjs',
    output: [' ✓ test/ported/cold/a.spec.ts > suite > first', ' × test/ported/cold/a.spec.ts > suite > second'].join('\n'),
  });
  const repaired = replaceAuditReportResults({ report, replacements: [replacement] });
  assert.deepEqual([repaired.numTotalTests, repaired.numPassedTests, repaired.numFailedTests], [2, 1, 1]);
  assert.deepEqual(findIncompleteAuditEntries({ migrationEntries, report: repaired }), [migrationEntries[1]]);
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
