import assert from 'node:assert/strict';
import test from 'node:test';
import { findIncompleteAuditFiles, repairAuditReport } from './mode-audit-repair.mjs';

const packageDirectory = '/workspace/packages/rxjs';

test('finds missing, short, and incomplete files without masking duplicate reports', () => {
  const migrationEntries = [
    { file: 'test/a.spec.ts', caseIds: ['A'] },
    { file: 'test/b.spec.ts', caseIds: ['B'] },
    { file: 'test/c.spec.ts', caseIds: ['C'] },
    { file: 'test/duplicate.spec.ts', caseIds: ['D'] },
  ];
  const duplicate = result('test/duplicate.spec.ts', ['passed']);
  const report = {
    testResults: [result('test/a.spec.ts', []), result('test/b.spec.ts', ['incomplete']), duplicate, duplicate],
  };

  assert.deepEqual(findIncompleteAuditFiles({ migrationEntries, packageDirectory, report }), [
    'test/a.spec.ts',
    'test/b.spec.ts',
    'test/c.spec.ts',
  ]);
});

test('replaces incomplete files, appends missing files, and recalculates totals', () => {
  const report = {
    numTotalTests: 1,
    numPassedTests: 0,
    numFailedTests: 0,
    numPendingTests: 0,
    numTodoTests: 0,
    unhandledErrors: 0,
    testResults: [result('test/a.spec.ts', ['incomplete'])],
  };
  const repaired = repairAuditReport({
    packageDirectory,
    report,
    replacementReports: [
      { unhandledErrors: 0, testResults: [result('test/a.spec.ts', ['passed'])] },
      { unhandledErrors: 0, testResults: [result('test/b.spec.ts', ['failed'])] },
    ],
  });

  assert.deepEqual(
    {
      total: repaired.numTotalTests,
      passed: repaired.numPassedTests,
      failed: repaired.numFailedTests,
      pending: repaired.numPendingTests,
      todo: repaired.numTodoTests,
    },
    { total: 2, passed: 1, failed: 1, pending: 0, todo: 0 }
  );
  assert.deepEqual(
    repaired.testResults.map((entry) => entry.assertionResults),
    [[{ status: 'passed' }], [{ status: 'failed' }]]
  );
});

test('rejects ambiguous supplemental reports', () => {
  assert.throws(
    () => repairAuditReport({ packageDirectory, report: {}, replacementReports: [{ testResults: [] }] }),
    /exactly one test file/
  );
});

function result(file, statuses) {
  return {
    name: `${packageDirectory}/${file}`,
    assertionResults: statuses.map((status) => ({ status })),
  };
}
