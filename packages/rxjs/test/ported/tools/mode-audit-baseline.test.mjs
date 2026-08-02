import assert from 'node:assert/strict';
import test from 'node:test';
import { join } from 'node:path';
import { assertAuditBaseline, baselineFromAuditReport } from './mode-audit-baseline.mjs';

const packageDirectory = '/workspace/packages/rxjs';

test('accepts a complete report and exact reviewed pass set', () => {
  const actual = baselineFromAuditReport(fixture());
  assert.deepEqual(actual.caseIds, ['RX7-A']);
  assert.doesNotThrow(() => assertAuditBaseline(actual, actual));
});

test('accepts audit reports that omit an empty unhandled-errors field', () => {
  const input = fixture();
  delete input.report.unhandledErrors;
  assert.doesNotThrow(() => baselineFromAuditReport(input));
});

test('rejects incomplete execution', () => {
  const input = fixture();
  input.report.numTotalTests = 1;
  input.report.numFailedTests = 0;
  input.report.testResults[0].assertionResults.pop();
  assert.throws(() => baselineFromAuditReport(input), /result count does not match|incomplete/);
});

test('rejects unknown case IDs', () => {
  const input = fixture();
  input.migrationReport.modes.cold[0].caseIds[1] = 'RX7-UNKNOWN';
  assert.throws(() => baselineFromAuditReport(input), /unknown case ID: RX7-UNKNOWN/);
});

test('rejects duplicate case IDs', () => {
  const input = fixture();
  input.migrationReport.modes.cold[0].caseIds[1] = 'RX7-A';
  assert.throws(() => baselineFromAuditReport(input), /duplicate case ID: RX7-A/);
});

test('rejects a new failure', () => {
  const expected = baselineFromAuditReport(fixture());
  const input = fixture();
  input.report.testResults[0].assertionResults[0].status = 'failed';
  input.report.numPassedTests = 0;
  input.report.numFailedTests = 2;
  const actual = baselineFromAuditReport(input);
  assert.throws(() => assertAuditBaseline(actual, expected), /Unexpected failures \(1\): RX7-A/);
});

test('rejects an unexpected pass until the reviewed baseline is updated', () => {
  const expected = baselineFromAuditReport(fixture());
  const input = fixture();
  input.report.testResults[0].assertionResults[1].status = 'passed';
  input.report.numPassedTests = 2;
  input.report.numFailedTests = 0;
  const actual = baselineFromAuditReport(input);
  assert.throws(() => assertAuditBaseline(actual, expected), /Unexpected passes \(1\): RX7-B/);
});

function fixture() {
  const file = 'test/ported/cold/example.spec.ts';
  return {
    manifest: {
      sourceCommit: 'source-revision',
      totals: { cases: 2 },
      cases: [{ id: 'RX7-A' }, { id: 'RX7-B' }],
    },
    migrationReport: {
      modes: {
        cold: [{ file, caseIds: ['RX7-A', 'RX7-B'] }],
        platform: [],
      },
    },
    mode: 'cold',
    packageDirectory,
    report: {
      numTotalTests: 2,
      numPassedTests: 1,
      numFailedTests: 1,
      numPendingTests: 0,
      numTodoTests: 0,
      testResults: [
        {
          name: join(packageDirectory, file),
          assertionResults: [{ status: 'passed' }, { status: 'failed' }],
        },
      ],
      unhandledErrors: 0,
    },
  };
}
