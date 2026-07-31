import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scenarioPath = fileURLToPath(new URL('./duplicate-install-scenario.mjs', import.meta.url));

for (const order of ['esm-first', 'commonjs-first']) {
  const result = spawnSync(process.execPath, [scenarioPath, order], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    throw new Error(`Duplicate-install package fixture failed: ${order}`);
  }
}
