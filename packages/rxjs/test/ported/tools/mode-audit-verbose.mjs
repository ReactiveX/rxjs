import { resolve } from 'node:path';

const statusByMarker = new Map([
  ['✓', 'passed'],
  ['×', 'failed'],
  ['↓', 'pending'],
]);

export function reportFromVerboseOutput({ migrationEntries, output, packageDirectory }) {
  const resultsByFile = new Map(migrationEntries.map((entry) => [entry.file, []]));
  for (const rawLine of output.split(/[\r\n]+/)) {
    const line = stripAnsi(rawLine);
    const match = /^\s*([✓×↓])\s+(\S*test\/ported\/\S+\.spec\.ts)\s+>/.exec(line);
    if (!match) continue;
    const file = match[2].slice(match[2].indexOf('test/ported/'));
    const assertions = resultsByFile.get(file);
    if (!assertions) throw new Error(`Audit output contains an unexpected test file: ${file}`);
    assertions.push({ status: statusByMarker.get(match[1]) });
  }

  const testResults = migrationEntries.map((entry) => ({
    name: resolve(packageDirectory, entry.file),
    assertionResults: resultsByFile.get(entry.file),
  }));
  return reportFromTestResults(testResults, /Unhandled Errors?/.test(stripAnsi(output)) ? 1 : 0);
}

export function findIncompleteAuditEntries({ migrationEntries, report }) {
  return migrationEntries.filter((entry, index) => report.testResults[index]?.assertionResults.length !== entry.caseIds.length);
}

export function replaceAuditReportResults({ report, replacements }) {
  const replacementsByName = new Map(replacements.flatMap((replacement) => replacement.testResults.map((result) => [result.name, result])));
  const testResults = report.testResults.map((result) => replacementsByName.get(result.name) ?? result);
  const unhandledErrors = report.unhandledErrors + replacements.reduce((total, replacement) => total + replacement.unhandledErrors, 0);
  return reportFromTestResults(testResults, unhandledErrors);
}

function reportFromTestResults(testResults, unhandledErrors) {
  const assertions = testResults.flatMap((result) => result.assertionResults);
  return {
    numTotalTests: assertions.length,
    numPassedTests: countStatus(assertions, 'passed'),
    numFailedTests: countStatus(assertions, 'failed'),
    numPendingTests: countStatus(assertions, 'pending'),
    numTodoTests: 0,
    unhandledErrors,
    testResults,
  };
}

function countStatus(assertions, status) {
  return assertions.filter((assertion) => assertion.status === status).length;
}

function stripAnsi(value) {
  return value.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, '');
}
