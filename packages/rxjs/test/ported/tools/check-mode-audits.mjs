#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertAuditBaseline, baselineFromAuditReport } from './mode-audit-baseline.mjs';
import { reportFromVerboseOutput } from './mode-audit-verbose.mjs';

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const packageDirectory = resolve(toolDirectory, '../../..');
const manifest = await readJson(resolve(toolDirectory, '../manifest.generated.json'));
const migrationReport = await readJson(resolve(toolDirectory, '../migration-report.json'));

for (const mode of ['cold', 'polyfill']) {
  const suiteMode = mode === 'cold' ? 'cold' : 'platform';
  const [report, expected] = await Promise.all([
    runAudit(mode, migrationReport.modes[suiteMode]),
    readJson(resolve(toolDirectory, `../verified-${mode}-passes.json`)),
  ]);
  const actual = baselineFromAuditReport({ manifest, migrationReport, mode, packageDirectory, report });
  assertAuditBaseline(actual, expected);
  process.stdout.write(
    `Validated exact ${mode} audit baseline: ${actual.audit.total} cases, ${actual.audit.passed} passing, ${actual.audit.failed} failing.\n`
  );
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function runAudit(mode, migrationEntries) {
  const result = spawnSync(
    process.execPath,
    [
      resolve(packageDirectory, '../../node_modules/vitest/vitest.mjs'),
      '--run',
      '--config',
      'vitest.ported.config.ts',
      '--reporter=verbose',
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
  return reportFromVerboseOutput({ migrationEntries, output: `${result.stdout}\n${result.stderr}`, packageDirectory });
}
