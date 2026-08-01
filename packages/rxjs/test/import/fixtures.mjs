import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scenarios = [
  'missing-global-subpath',
  'root-core-only',
  'foreign-constructor',
  'earlier-version',
  'event-target-when',
  'frozen-target',
  'separate-realm',
  'shared-esm-require-bridge',
];

for (const scenario of scenarios) {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./fixture-scenario.mjs', import.meta.url)), scenario], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    throw new Error(`Package fixture failed: ${scenario}`);
  }
}
