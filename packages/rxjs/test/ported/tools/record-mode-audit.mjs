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

const manifestByLocation = new Map(
  manifest.cases.map((testCase) => [`${testCase.source.path}:${testCase.source.line}`, testCase])
);
const locations = [];
for (const assertion of report.testResults.flatMap((testResult) => testResult.assertionResults)) {
  if (assertion.status !== 'passed') {
    continue;
  }
  const match = assertion.title.match(/^(spec\/.*\.ts):(\d+) /);
  const location = match ? `${match[1]}:${match[2]}` : null;
  if (!location || !manifestByLocation.has(location)) {
    throw new Error(`Could not associate passing audit result with a manifest case: ${assertion.title}`);
  }
  locations.push(location);
}

locations.sort((left, right) => left.localeCompare(right, 'en'));
const baseline = {
  schemaVersion: 1,
  mode,
  sourceCommit: manifest.sourceCommit,
  audit: {
    total: report.numTotalTests,
    passed: report.numPassedTests,
    failed: report.numFailedTests,
  },
  locations,
};

await writeFile(outputPath, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8');
process.stdout.write(`Recorded ${locations.length} passing ${mode} cases in ${outputPath}\n`);
