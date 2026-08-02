import assert from 'node:assert/strict';
import test from 'node:test';
import { createAuditReport } from './mode-audit-reporter.mjs';

test('serializes nested Vitest task results in declaration order', () => {
  const report = createAuditReport([
    {
      type: 'suite',
      filepath: '/workspace/example.spec.ts',
      result: { state: 'fail' },
      tasks: [
        {
          type: 'suite',
          tasks: [
            { type: 'test', mode: 'run', result: { state: 'pass' } },
            { type: 'test', mode: 'run', result: { state: 'fail' } },
            { type: 'test', mode: 'skip', result: { state: 'skip' } },
            { type: 'test', mode: 'todo' },
          ],
        },
      ],
    },
  ]);

  assert.deepEqual(report, {
    numTotalTests: 4,
    numPassedTests: 1,
    numFailedTests: 1,
    numPendingTests: 1,
    numTodoTests: 1,
    unhandledErrors: 0,
    testResults: [
      {
        name: '/workspace/example.spec.ts',
        status: 'failed',
        assertionResults: [{ status: 'passed' }, { status: 'failed' }, { status: 'pending' }, { status: 'todo' }],
      },
    ],
  });
});

test('leaves missing task states incomplete and records unhandled errors', () => {
  const report = createAuditReport(
    [{ type: 'suite', filepath: '/workspace/incomplete.spec.ts', tasks: [{ type: 'test', mode: 'run' }] }],
    [new Error('collection failed')]
  );
  assert.equal(report.unhandledErrors, 1);
  assert.deepEqual(report.testResults[0].assertionResults, [{ status: 'incomplete' }]);
});
