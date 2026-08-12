import { relative } from 'node:path';

export function baselineFromAuditReport({ manifest, migrationReport, mode, packageDirectory, report }) {
  if (mode !== 'cold' && mode !== 'polyfill') {
    throw new Error(`Unsupported audit mode: ${String(mode)}`);
  }

  const suiteMode = mode === 'cold' ? 'cold' : 'platform';
  const migratedFiles = new Map(migrationReport.modes[suiteMode].map((entry) => [entry.file, entry]));
  const knownCaseIds = new Set(manifest.cases.map((testCase) => testCase.id));
  const assertions = [];

  for (const testResult of report.testResults ?? []) {
    const file = relative(packageDirectory, testResult.name).replaceAll('\\', '/');
    const migratedFile = migratedFiles.get(file);
    if (!migratedFile) {
      throw new Error(`${mode} audit contains an unexpected test file: ${file}`);
    }
    if (testResult.assertionResults.length !== migratedFile.caseIds.length) {
      throw new Error(
        `${mode} audit result count does not match ${file}: ` +
          `${testResult.assertionResults.length} results, ${migratedFile.caseIds.length} case IDs.`
      );
    }
    for (const [index, assertion] of testResult.assertionResults.entries()) {
      assertions.push({ assertion, caseId: migratedFile.caseIds[index] });
    }
  }

  const reportTotals = {
    total: report.numTotalTests,
    passed: report.numPassedTests,
    failed: report.numFailedTests,
    pending: report.numPendingTests,
    todo: report.numTodoTests ?? 0,
  };
  const assertionTotals = {
    total: assertions.length,
    passed: assertions.filter(({ assertion }) => assertion.status === 'passed').length,
    failed: assertions.filter(({ assertion }) => assertion.status === 'failed').length,
    incomplete: assertions.filter(({ assertion }) => assertion.status !== 'passed' && assertion.status !== 'failed').length,
  };
  const unhandledErrors = report.unhandledErrors ?? 0;
  if (
    reportTotals.total !== manifest.totals.cases ||
    reportTotals.total !== assertionTotals.total ||
    reportTotals.passed !== assertionTotals.passed ||
    reportTotals.failed !== assertionTotals.failed ||
    reportTotals.pending !== 0 ||
    reportTotals.todo !== 0 ||
    unhandledErrors !== 0 ||
    assertionTotals.incomplete !== 0 ||
    reportTotals.passed + reportTotals.failed !== reportTotals.total
  ) {
    throw new Error(
      `${mode} audit is incomplete: report ${JSON.stringify(reportTotals)}, ` +
        `assertions ${JSON.stringify(assertionTotals)}, ${manifest.totals.cases} required.`
    );
  }

  const seenCaseIds = new Set();
  const passingCaseIds = [];
  for (const { assertion, caseId } of assertions) {
    if (!knownCaseIds.has(caseId)) {
      throw new Error(`${mode} audit contains an unknown case ID: ${String(caseId)}`);
    }
    if (seenCaseIds.has(caseId)) {
      throw new Error(`${mode} audit contains duplicate case ID: ${caseId}`);
    }
    seenCaseIds.add(caseId);
    if (assertion.status === 'passed') {
      passingCaseIds.push(caseId);
    }
  }
  if (seenCaseIds.size !== knownCaseIds.size) {
    const missing = [...knownCaseIds].filter((caseId) => !seenCaseIds.has(caseId));
    throw new Error(`${mode} audit is missing ${missing.length} case ID(s): ${summarizeIds(missing)}`);
  }

  passingCaseIds.sort((left, right) => left.localeCompare(right, 'en'));
  return {
    schemaVersion: 2,
    mode,
    sourceCommit: manifest.sourceCommit,
    audit: {
      total: reportTotals.total,
      passed: reportTotals.passed,
      failed: reportTotals.failed,
    },
    caseIds: passingCaseIds,
  };
}

export function assertAuditBaseline(actual, expected) {
  if (expected.schemaVersion !== 2 || !Array.isArray(expected.caseIds)) {
    throw new Error(`The reviewed ${actual.mode} baseline must use schema version 2 with exact case IDs.`);
  }
  if (actual.mode !== expected.mode || actual.sourceCommit !== expected.sourceCommit || actual.audit.total !== expected.audit.total) {
    throw new Error(
      `${actual.mode} audit identity differs from its reviewed baseline: ` +
        `${actual.sourceCommit}/${actual.audit.total} versus ${expected.sourceCommit}/${expected.audit.total}.`
    );
  }

  const actualPasses = new Set(actual.caseIds);
  const expectedPasses = new Set(expected.caseIds);
  if (actualPasses.size !== actual.caseIds.length || expectedPasses.size !== expected.caseIds.length) {
    throw new Error(`${actual.mode} audit baseline contains duplicate passing case IDs.`);
  }

  const unexpectedFailures = expected.caseIds.filter((caseId) => !actualPasses.has(caseId));
  const unexpectedPasses = actual.caseIds.filter((caseId) => !expectedPasses.has(caseId));
  if (
    unexpectedFailures.length > 0 ||
    unexpectedPasses.length > 0 ||
    actual.audit.passed !== expected.audit.passed ||
    actual.audit.failed !== expected.audit.failed
  ) {
    throw new Error(
      [
        `${actual.mode} audit differs from the reviewed baseline.`,
        `Expected ${expected.audit.passed} passing and ${expected.audit.failed} failing; received ${actual.audit.passed} passing and ${actual.audit.failed} failing.`,
        `Unexpected failures (${unexpectedFailures.length}): ${summarizeIds(unexpectedFailures)}`,
        `Unexpected passes (${unexpectedPasses.length}): ${summarizeIds(unexpectedPasses)}`,
      ].join('\n')
    );
  }
}

function summarizeIds(caseIds) {
  return caseIds.length === 0 ? 'none' : caseIds.slice(0, 10).join(', ');
}
