#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2];
const reportPath = process.argv[3];
if (!['cold', 'polyfill'].includes(mode) || !reportPath) {
  throw new Error('Usage: node tools/record-mode-audit.mjs <cold|polyfill> <vitest-json-report>');
}

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(toolDirectory, '../manifest.generated.json');
const migrationReportPath = resolve(toolDirectory, '../migration-report.json');
const outputPath = resolve(toolDirectory, `../verified-${mode}-passes.json`);
const packageDirectory = resolve(toolDirectory, '../../..');
const [manifest, migrationReport] = await Promise.all([
  readFile(manifestPath, 'utf8').then(JSON.parse),
  readFile(migrationReportPath, 'utf8').then(JSON.parse),
]);
const report = JSON.parse(await readFile(resolve(reportPath), 'utf8'));

if (report.numTotalTests !== manifest.totals.cases || report.numPendingTests !== 0) {
  throw new Error(
    `Audit report does not cover the complete manifest: ${report.numTotalTests} total, ${report.numPendingTests} pending, ${manifest.totals.cases} required.`
  );
}
if (report.numPassedTests + report.numFailedTests !== report.numTotalTests) {
  throw new Error(
    `Audit report does not reconcile its pass/fail totals: ${report.numPassedTests} passed, ${report.numFailedTests} failed, ${report.numTotalTests} total.`
  );
}

const manifestByCaseId = new Map(manifest.cases.map((testCase) => [testCase.id, testCase]));
const suiteMode = mode === 'cold' ? 'cold' : 'platform';
const migratedFiles = new Map(migrationReport.modes[suiteMode].map((entry) => [entry.file, entry]));
const assertions = [];
for (const testResult of report.testResults) {
  const file = relative(packageDirectory, testResult.name).replaceAll('\\', '/');
  const migratedFile = migratedFiles.get(file);
  if (!migratedFile) {
    throw new Error(`Audit report contains an unexpected test file: ${file}`);
  }
  if (testResult.assertionResults.length !== migratedFile.caseIds.length) {
    throw new Error(
      `Audit result count does not match the migration report for ${file}: ` +
        `${testResult.assertionResults.length} results, ${migratedFile.caseIds.length} case IDs.`
    );
  }
  for (const [index, assertion] of testResult.assertionResults.entries()) {
    assertions.push({ assertion, caseId: migratedFile.caseIds[index] });
  }
}
const seenCaseIds = new Set();
const caseIds = [];
for (const { assertion, caseId } of assertions) {
  if (!caseId || !manifestByCaseId.has(caseId)) {
    throw new Error(`Could not associate audit result with a manifest case ID: ${caseId}`);
  }
  if (seenCaseIds.has(caseId)) {
    throw new Error(`Audit report contains more than one assertion for case ID: ${caseId}`);
  }
  seenCaseIds.add(caseId);
  if (assertion.status === 'passed') {
    caseIds.push(caseId);
  }
}

if (assertions.length !== report.numTotalTests || seenCaseIds.size !== manifest.totals.cases) {
  throw new Error(
    `Audit report does not identify every manifest case exactly once: ${assertions.length} assertions, ${seenCaseIds.size} IDs, ${manifest.totals.cases} required.`
  );
}
caseIds.sort((left, right) => left.localeCompare(right, 'en'));
if (caseIds.length !== report.numPassedTests || new Set(caseIds).size !== caseIds.length) {
  throw new Error(
    `Audit report cannot produce a one-to-one passing baseline: ${caseIds.length} case IDs for ${report.numPassedTests} passing assertions.`
  );
}
const baseline = {
  schemaVersion: 2,
  mode,
  sourceCommit: manifest.sourceCommit,
  audit: {
    total: report.numTotalTests,
    passed: report.numPassedTests,
    failed: report.numFailedTests,
  },
  caseIds,
};

await writeFile(outputPath, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8');
process.stdout.write(`Recorded ${caseIds.length} passing ${mode} case IDs in ${outputPath}\n`);
