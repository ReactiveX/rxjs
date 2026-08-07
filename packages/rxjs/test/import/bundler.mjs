import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const packageRoot = fileURLToPath(new URL('../..', import.meta.url));
const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'rxjs-extension-bundler-'));

try {
  await buildAndRun({
    label: 'root-functional-surface',
    source: `
      import 'rxjs';
      const constructorSymbols = Object.getOwnPropertySymbols(globalThis.Observable).map((symbol) => symbol.description);
      const prototypeSymbols = Object.getOwnPropertySymbols(globalThis.Observable.prototype).map((symbol) => symbol.description);
      if (!prototypeSymbols.includes('buffer') || !constructorSymbols.includes('merge')) {
        throw new Error('The bundled root import did not retain the functional surface implementations');
      }
    `,
  });

  await buildAndRun({
    label: 'unused-extension-import',
    source: `
      import { map } from 'rxjs/map';
      const mapSymbol = Object.getOwnPropertySymbols(globalThis.Observable.prototype).find((symbol) => symbol.description === 'map');
      if (!mapSymbol || typeof globalThis.Observable.prototype[mapSymbol] !== 'function') {
        throw new Error('The bundler erased the unused map extension import');
      }
      const descriptor = Object.getOwnPropertyDescriptor(globalThis.Observable.prototype, mapSymbol);
      if (!descriptor.enumerable || !descriptor.configurable || !descriptor.writable) {
        throw new Error('The bundled map extension has the wrong descriptor');
      }
    `,
  });
} finally {
  await fs.rm(temporaryRoot, { force: true, recursive: true });
}

async function buildAndRun({ label, source }) {
  const outputPath = path.join(temporaryRoot, `${label}.mjs`);
  await build({
    absWorkingDir: packageRoot,
    bundle: true,
    format: 'esm',
    outfile: outputPath,
    logLevel: 'silent',
    platform: 'node',
    stdin: {
      contents: source,
      resolveDir: packageRoot,
      sourcefile: `${label}.mjs`,
    },
    treeShaking: true,
    write: true,
  });

  const result = spawnSync(process.execPath, [outputPath], { encoding: 'utf8' });
  assert.equal(result.status, 0, `${label} failed\n${result.stdout}${result.stderr}`);
}
