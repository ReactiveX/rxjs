#!/usr/bin/env node

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { auditPackedPackage } from './prerelease-adoption-lib.mjs';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const budgets = JSON.parse(await readFile(path.join(repositoryRoot, 'packages/rxjs/test/release/budgets.json'), 'utf8'));
const packages = [
  ['rxjs', 'packages/rxjs'],
  ['@rxjs/observable-polyfill', 'packages/observable-polyfill'],
  ['@rxjs/test', 'packages/test'],
  ['@rxjs/migrate', 'packages/migrate'],
];
const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'rxjs-prerelease-adoption-'));

try {
  const tarballRoot = path.join(temporaryRoot, 'tarballs');
  const consumerRoot = path.join(temporaryRoot, 'consumer');
  const npmCache = path.join(temporaryRoot, 'npm-cache');
  await mkdir(tarballRoot);
  await mkdir(consumerRoot);

  const packed = [];
  for (const [expectedName, packageDirectory] of packages) {
    const result = run(
      'npm',
      ['pack', '--json', '--pack-destination', tarballRoot, '--cache', npmCache],
      path.join(repositoryRoot, packageDirectory)
    );
    const [report] = JSON.parse(result.stdout);
    assert.equal(report.name, expectedName);
    const errors = auditPackedPackage(report, budgets);
    assert.deepEqual(errors, [], errors.join('\n'));
    packed.push({ ...report, tarballPath: path.join(tarballRoot, report.filename) });
  }

  const byName = Object.fromEntries(packed.map((report) => [report.name, report]));
  await writeFile(
    path.join(consumerRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: 'rxjs-prerelease-adoption',
        private: true,
        type: 'module',
        dependencies: {
          '@rxjs/observable-polyfill': `file:${byName['@rxjs/observable-polyfill'].tarballPath}`,
          '@rxjs/test': `file:${byName['@rxjs/test'].tarballPath}`,
          rxjs: `file:${byName.rxjs.tarballPath}`,
        },
      },
      null,
      2
    )}\n`
  );
  run('npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', npmCache], consumerRoot);

  await writeConsumerFixtures(consumerRoot);
  run(process.execPath, ['app.mjs'], consumerRoot);
  run(process.execPath, ['require.cjs'], consumerRoot);
  run(path.join(repositoryRoot, 'node_modules/.bin/tsc'), ['-p', 'tsconfig.json'], consumerRoot);

  const bundle = await build({
    bundle: true,
    conditions: ['browser', 'import'],
    entryPoints: [path.join(consumerRoot, 'browser.mjs')],
    format: 'esm',
    logLevel: 'silent',
    minify: true,
    nodePaths: [path.join(consumerRoot, 'node_modules')],
    platform: 'browser',
    target: 'es2022',
    write: false,
  });
  assert.ok(bundle.outputFiles[0].contents.byteLength <= budgets.webpackBytes);

  console.log(
    JSON.stringify({
      version: byName.rxjs.version,
      consumer: ['esm', 'require(esm)', 'types', 'browser-bundle'],
      browserBundleBytes: bundle.outputFiles[0].contents.byteLength,
      tarballs: Object.fromEntries(packed.map(({ name, size }) => [name, size])),
    })
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

async function writeConsumerFixtures(root) {
  await writeFile(
    path.join(root, 'app.mjs'),
    `
import assert from 'node:assert/strict';
import { ColdObservable } from 'rxjs';
import { map } from 'rxjs/map';
import { rxTest } from '@rxjs/test';

const values = [];
new ColdObservable((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
})[map]((value) => value * 10).subscribe((value) => values.push(value));
assert.deepEqual(values, [10, 20]);
await rxTest(({ cold, expectObservable }) => {
  expectObservable(cold('-a-|', { a: 2 })[map]((value) => value + 1)).toBe('-a-|', { a: 3 });
});
`
  );
  await writeFile(
    path.join(root, 'require.cjs'),
    `
const assert = require('node:assert/strict');
const { ColdObservable } = require('rxjs');
const { map } = require('rxjs/map');
const values = [];
new ColdObservable((subscriber) => {
  subscriber.next(1);
  subscriber.complete();
})[map]((value) => value + 1).subscribe((value) => values.push(value));
assert.deepEqual(values, [2]);
`
  );
  await writeFile(
    path.join(root, 'types.ts'),
    `
import { ColdObservable } from 'rxjs';
import { map } from 'rxjs/map';
const source = new ColdObservable<number>((subscriber) => subscriber.complete());
const mapped: Observable<string> = source[map]((value) => String(value));
void mapped;
`
  );
  await writeFile(
    path.join(root, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          lib: ['ES2023', 'DOM'],
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          noEmit: true,
          strict: true,
          target: 'ES2022',
        },
        include: ['types.ts'],
      },
      null,
      2
    )}\n`
  );
  await writeFile(
    path.join(root, 'browser.mjs'),
    `
import { ColdObservable } from 'rxjs';
import { map } from 'rxjs/map';
new ColdObservable((subscriber) => subscriber.complete())[map]((value) => value);
`
  );
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed (${result.status}).\n${result.stdout}${result.stderr}`);
  }
  return result;
}
