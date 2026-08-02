import { relative } from 'node:path';

export function findIncompleteAuditFiles({ migrationEntries, packageDirectory, report }) {
  const resultsByFile = new Map();
  for (const result of report.testResults ?? []) {
    const file = normalizeFile(packageDirectory, result.name);
    const results = resultsByFile.get(file) ?? [];
    results.push(result);
    resultsByFile.set(file, results);
  }

  return migrationEntries.flatMap((entry) => {
    const results = resultsByFile.get(entry.file) ?? [];
    if (results.length > 1) return [];
    const assertions = results[0]?.assertionResults ?? [];
    const incomplete = assertions.some((assertion) => assertion.status !== 'passed' && assertion.status !== 'failed');
    return results.length === 0 || assertions.length !== entry.caseIds.length || incomplete ? [entry.file] : [];
  });
}

export function repairAuditReport({ packageDirectory, report, replacementReports }) {
  const replacements = new Map();
  let replacementUnhandledErrors = 0;
  for (const replacementReport of replacementReports) {
    replacementUnhandledErrors += replacementReport.unhandledErrors ?? 0;
    if (replacementReport.testResults?.length !== 1) {
      throw new Error(`A supplemental audit must report exactly one test file; received ${replacementReport.testResults?.length ?? 0}.`);
    }
    const [replacement] = replacementReport.testResults;
    const file = normalizeFile(packageDirectory, replacement.name);
    if (replacements.has(file)) {
      throw new Error(`Supplemental audit results contain a duplicate test file: ${file}`);
    }
    replacements.set(file, replacement);
  }

  const replacedFiles = new Set();
  const testResults = (report.testResults ?? []).map((result) => {
    const file = normalizeFile(packageDirectory, result.name);
    const replacement = replacements.get(file);
    if (!replacement) return result;
    replacedFiles.add(file);
    return replacement;
  });
  for (const [file, replacement] of replacements) {
    if (!replacedFiles.has(file)) testResults.push(replacement);
  }

  const assertions = testResults.flatMap((result) => result.assertionResults ?? []);
  return {
    ...report,
    numTotalTests: assertions.length,
    numPassedTests: countStatus(assertions, 'passed'),
    numFailedTests: countStatus(assertions, 'failed'),
    numPendingTests: countStatus(assertions, 'pending'),
    numTodoTests: countStatus(assertions, 'todo'),
    unhandledErrors: (report.unhandledErrors ?? 0) + replacementUnhandledErrors,
    testResults,
  };
}

function normalizeFile(packageDirectory, path) {
  return relative(packageDirectory, path).replaceAll('\\', '/');
}

function countStatus(assertions, status) {
  return assertions.filter((assertion) => assertion.status === status).length;
}
