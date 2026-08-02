#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertAuditBaseline, baselineFromAuditReport } from './mode-audit-baseline.mjs';
import { findIncompleteAuditFiles, repairAuditReport } from './mode-audit-repair.mjs';

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const packageDirectory = resolve(toolDirectory, '../../..');
const manifest = await readJson(resolve(toolDirectory, '../manifest.generated.json'));
const migrationReport = await readJson(resolve(toolDirectory, '../migration-report.json'));
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'rxjs-next-mode-audits-'));

try {
  for (const mode of ['cold', 'polyfill']) {
    const reportPath = join(temporaryDirectory, `${mode}.json`);
    runAudit(mode, reportPath);

    let [report, expected] = await Promise.all([readJson(reportPath), readJson(resolve(toolDirectory, `../verified-${mode}-passes.json`))]);
    const suiteMode = mode === 'cold' ? 'cold' : 'platform';
    const incompleteFiles = findIncompleteAuditFiles({
      migrationEntries: migrationReport.modes[suiteMode],
      packageDirectory,
      report,
    });
    if (incompleteFiles.length > 0) {
      process.stdout.write(
        `Re-running ${incompleteFiles.length} ${mode} audit file(s) whose complete task results were not retained by the full Vitest run.\n`
      );
      const replacementReports = [];
      for (const [index, file] of incompleteFiles.entries()) {
        const supplementalPath = join(temporaryDirectory, `${mode}-supplemental-${index}.json`);
        runAudit(mode, supplementalPath, file);
        replacementReports.push(await readJson(supplementalPath));
      }
      report = repairAuditReport({ packageDirectory, report, replacementReports });
    }
    const actual = baselineFromAuditReport({ manifest, migrationReport, mode, packageDirectory, report });
    assertAuditBaseline(actual, expected);
    process.stdout.write(
      `Validated exact ${mode} audit baseline: ${actual.audit.total} cases, ${actual.audit.passed} passing, ${actual.audit.failed} failing.\n`
    );
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function runAudit(mode, reportPath, file) {
  const result = spawnSync(
    process.execPath,
    [
      resolve(packageDirectory, '../../node_modules/vitest/vitest.mjs'),
      '--run',
      ...(file ? [file] : []),
      '--config',
      'vitest.ported.config.ts',
      '--reporter=./test/ported/tools/mode-audit-reporter.mjs',
    ],
    {
      cwd: packageDirectory,
      env: { ...process.env, RXJS_NEXT_AUDIT_ONLY: '1', RXJS_NEXT_AUDIT_REPORT: reportPath, RXJS_NEXT_TEST_MODE: mode },
      stdio: 'inherit',
    }
  );
  if (result.signal || (result.status !== 0 && result.status !== 1)) {
    throw new Error(`${mode} audit process did not complete normally: status ${String(result.status)}, signal ${String(result.signal)}.`);
  }
}
