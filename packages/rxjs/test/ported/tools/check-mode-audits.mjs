#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertAuditBaseline, baselineFromAuditReport } from './mode-audit-baseline.mjs';
import { findIncompleteAuditEntries, replaceAuditReportResults, reportFromVerboseOutput } from './mode-audit-verbose.mjs';

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const packageDirectory = resolve(toolDirectory, '../../..');
const manifest = await readJson(resolve(toolDirectory, '../manifest.generated.json'));
const migrationReport = await readJson(resolve(toolDirectory, '../migration-report.json'));

for (const mode of ['cold', 'polyfill']) {
  const suiteMode = mode === 'cold' ? 'cold' : 'platform';
  let [report, expected] = await Promise.all([
    runAudit(mode, migrationReport.modes[suiteMode]),
    readJson(resolve(toolDirectory, `../verified-${mode}-passes.json`)),
  ]);
  const incompleteEntries = findIncompleteAuditEntries({ migrationEntries: migrationReport.modes[suiteMode], report });
  if (incompleteEntries.length > 0) {
    process.stdout.write(`Re-running ${incompleteEntries.length} incomplete ${mode} audit file(s) in isolation.\n`);
    const replacements = incompleteEntries.map((entry) => {
      let replacement = runAudit(mode, [entry], entry.file);
      if (findIncompleteAuditEntries({ migrationEntries: [entry], report: replacement }).length > 0) {
        replacement = runAudit(mode, [entry], entry.file, 'threads');
      }
      return replacement;
    });
    report = replaceAuditReportResults({ report, replacements });
  }
  const actual = baselineFromAuditReport({ manifest, migrationReport, mode, packageDirectory, report });
  assertAuditBaseline(actual, expected);
  process.stdout.write(
    `Validated exact ${mode} audit baseline: ${actual.audit.total} cases, ${actual.audit.passed} passing, ${actual.audit.failed} failing.\n`
  );
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function runAudit(mode, migrationEntries, file, pool) {
  const result = spawnSync(
    process.execPath,
    [
      resolve(packageDirectory, '../../node_modules/vitest/vitest.mjs'),
      '--run',
      ...(file ? [file] : []),
      '--config',
      'vitest.ported.config.ts',
      '--reporter=verbose',
      ...(pool ? [`--pool=${pool}`] : []),
    ],
    {
      cwd: packageDirectory,
      encoding: 'utf8',
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1', RXJS_NEXT_AUDIT_ONLY: '1', RXJS_NEXT_TEST_MODE: mode },
      maxBuffer: 50 * 1024 * 1024,
    }
  );
  if (result.signal || (result.status !== 0 && result.status !== 1)) {
    throw new Error(
      `${mode} audit process did not complete normally: status ${String(result.status)}, signal ${String(result.signal)}.\n` +
        `${result.stderr || result.stdout}`
    );
  }
  const output = `${result.stdout}\n${result.stderr}`;
  const report = reportFromVerboseOutput({ migrationEntries, output, packageDirectory });
  if (migrationEntries.length > 0 && report.numTotalTests === 0) {
    const sample = `${output.slice(0, 1000)}\n... captured output tail ...\n${output.slice(-12000)}`;
    throw new Error(
      `${mode} audit produced no parseable per-case results. Captured output sample: ${JSON.stringify(sample)}`
    );
  }
  return report;
}
