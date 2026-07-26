#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const requested = process.argv[2] ?? 'all';
const vitestArguments = process.argv.slice(3);
const modes = requested === 'all' ? ['cold', 'polyfill'] : [requested];
const packageDirectory = resolve(import.meta.dirname, '../..');
const workspaceDirectory = resolve(packageDirectory, '../..');
const vitest = resolve(workspaceDirectory, 'node_modules/vitest/vitest.mjs');
let exitCode = 0;

for (const mode of modes) {
  if (!['cold', 'polyfill', 'native', 'audit', 'audit-polyfill'].includes(mode)) {
    throw new Error(`Unknown ported-test mode: ${mode}`);
  }
  const audit = mode === 'audit' || mode === 'audit-polyfill';
  const activeMode = mode === 'audit' ? 'cold' : mode === 'audit-polyfill' ? 'polyfill' : mode;
  const files =
    activeMode === 'cold' || audit
      ? ['test/ported/ported.spec.ts']
      : ['test/ported/ported.spec.ts', 'test/ported/platform-lifecycle.spec.ts'];
  const result = spawnSync(process.execPath, [vitest, '--run', ...files, ...vitestArguments], {
    cwd: packageDirectory,
    env: {
      ...process.env,
      RXJS_NEXT_AUDIT: audit ? 'true' : 'false',
      RXJS_NEXT_TEST_MODE: activeMode,
    },
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    exitCode = result.status ?? 1;
  }
}

process.exitCode = exitCode;
