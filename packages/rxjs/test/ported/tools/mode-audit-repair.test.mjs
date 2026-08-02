import assert from 'node:assert/strict';
import test from 'node:test';
import { findIncompleteAuditFiles, repairAuditReport } from './mode-audit-repair.mjs';

const packageDirectory = '/workspace/packages/rxjs';

test('finds missing, short, and incomplete audit files', () => {
  const migrationEntries = [
    { file: 'test/a.spec.ts', caseIds: ['A'] },
    { file: 'test/b.spec.ts', caseIds: ['B'] },
    { file: 'test/c.spec.ts', caseIds: ['C'] },
  ];
  const report = { testResults: [result('test/a.spec.ts', []), result('test/b.spec.ts', ['incomplete'])] };
  assert.deepEqual(findIncompleteAuditFiles({ migrationEntries, packageDirectory, report }), [
    'test/a.spec.ts',
    'test/b.spec.ts',
    'test/c.spec.ts',
  ]);
});

test('replaces incomplete files and recalculates exact totals', () => {
  const repaired = repairAuditReport({
    packageDirectory,
    report: { testResults: [result('test/a.spec.ts', [])] },
    replacementReports: [{ testResults: [result('test/a.spec.ts', ['passed'])] }, { testResults: [result('test/b.spec.ts', ['failed'])] }],
  });
  assert.deepEqual(
    [repaired.numTotalTests, repaired.numPassedTests, repaired.numFailedTests, repaired.numPendingTests, repaired.numTodoTests],
    [2, 1, 1, 0, 0]
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
