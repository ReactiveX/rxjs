#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2];
const reportPath = process.argv[3];
if (!['cold', 'polyfill'].includes(mode) || !reportPath) {
  throw new Error('Usage: node tools/record-mode-audit.mjs <cold|polyfill> <vitest-json-report>');
}

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(toolDirectory, '../manifest.generated.json');
const outputPath = resolve(toolDirectory, `../verified-${mode}-passes.json`);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
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
const assertions = report.testResults.flatMap((testResult) => testResult.assertionResults);
const seenCaseIds = new Set();
const caseIds = [];
for (const assertion of assertions) {
  const match = assertion.title.match(/^\[case-id:([^\]]+)\](?: |$)/);
  let caseId;
  try {
    caseId = match ? decodeURIComponent(match[1]) : null;
  } catch {
    caseId = null;
  }
  if (!caseId || !manifestByCaseId.has(caseId)) {
    throw new Error(`Could not associate audit result with a manifest case ID: ${assertion.title}`);
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
