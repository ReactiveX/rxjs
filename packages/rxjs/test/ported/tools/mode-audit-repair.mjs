import { relative } from 'node:path';

export function findIncompleteAuditFiles({ migrationEntries, packageDirectory, report }) {
  const resultsByFile = new Map((report.testResults ?? []).map((result) => [normalizeFile(packageDirectory, result.name), result]));
  return migrationEntries.flatMap((entry) => {
    const assertions = resultsByFile.get(entry.file)?.assertionResults ?? [];
    const incomplete = assertions.some((assertion) => assertion.status !== 'passed' && assertion.status !== 'failed');
    return assertions.length !== entry.caseIds.length || incomplete ? [entry.file] : [];
  });
}

export function repairAuditReport({ packageDirectory, report, replacementReports }) {
  const replacements = new Map();
  for (const replacementReport of replacementReports) {
    if (replacementReport.testResults?.length !== 1) {
      throw new Error(`A supplemental audit must report exactly one test file; received ${replacementReport.testResults?.length ?? 0}.`);
    }
    const [replacement] = replacementReport.testResults;
    const file = normalizeFile(packageDirectory, replacement.name);
    if (replacements.has(file)) throw new Error(`Supplemental audit results contain a duplicate test file: ${file}`);
    replacements.set(file, replacement);
  }

  const replaced = new Set();
  const testResults = (report.testResults ?? []).map((result) => {
    const file = normalizeFile(packageDirectory, result.name);
    const replacement = replacements.get(file);
    if (!replacement) return result;
    replaced.add(file);
    return replacement;
  });
  for (const [file, replacement] of replacements) {
    if (!replaced.has(file)) testResults.push(replacement);
  }

  const assertions = testResults.flatMap((result) => result.assertionResults ?? []);
  return {
    ...report,
    numTotalTests: assertions.length,
    numPassedTests: countStatus(assertions, 'passed'),
    numFailedTests: countStatus(assertions, 'failed'),
    numPendingTests: countStatus(assertions, 'pending'),
    numTodoTests: countStatus(assertions, 'todo'),
    testResults,
  };
}

function normalizeFile(packageDirectory, path) {
  return relative(packageDirectory, path).replaceAll('\\', '/');
}

function countStatus(assertions, status) {
  return assertions.filter((assertion) => assertion.status === status).length;
}
