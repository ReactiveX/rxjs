import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';

const repositoryRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const budgets = JSON.parse(await readFile(new URL('./budgets.json', import.meta.url), 'utf8'));
const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'rxjs-webpack-release-'));

try {
  const entryPath = path.join(temporaryRoot, 'entry.mjs');
  const outputPath = path.join(temporaryRoot, 'dist');
  const fixtureModules = path.join(temporaryRoot, 'node_modules');
  await mkdir(fixtureModules);
  await symlink(path.join(repositoryRoot, 'packages/rxjs'), path.join(fixtureModules, 'rxjs'), 'dir');
  await writeFile(
    entryPath,
    `
      import { ColdObservable } from 'rxjs';
      import { map } from 'rxjs/map';
      const values = [];
      new ColdObservable((subscriber) => {
        subscriber.next(1);
        subscriber.complete();
      })[map]((value) => value + 1).subscribe((value) => values.push(value));
      if (JSON.stringify(values) !== '[2]') throw new Error('Webpack runtime contract failed');
    `
  );

  const stats = await compile({ entryPath, fixtureModules, outputPath });
  const json = stats.toJson({ all: false, assets: true, errors: true, modules: true, warnings: true });
  assert.deepEqual(json.errors, [], `Webpack errors:\n${JSON.stringify(json.errors, null, 2)}`);
  assert.deepEqual(json.warnings, [], `Webpack warnings:\n${JSON.stringify(json.warnings, null, 2)}`);
  const packageResources = [...stats.compilation.modules]
    .map((module) => module.resource)
    .filter((resource) => typeof resource === 'string' && resource.includes('/packages/'));
  assert.ok(
    packageResources.some((resource) => resource.includes('/packages/rxjs/dist/esm/')),
    'Webpack did not consume the RxJS ESM output.'
  );
  assert.ok(
    packageResources.every((resource) => !/\/dist\/(?:browser|commonjs|webpack)\//.test(resource)),
    'Webpack consumed a duplicate dialect.'
  );

  const asset = json.assets?.find(({ name }) => name === 'bundle.mjs');
  assert.ok(asset, 'Webpack did not emit bundle.mjs.');
  assert.ok(asset.size <= budgets.webpackBytes, `Webpack bundle is ${asset.size} bytes; budget is ${budgets.webpackBytes}.`);

  const execution = spawnSync(process.execPath, [path.join(outputPath, 'bundle.mjs')], { encoding: 'utf8' });
  assert.equal(execution.status, 0, `Webpack bundle failed:\n${execution.stdout}${execution.stderr}`);
  process.stdout.write(`${JSON.stringify({ webpack: webpack.version, bytes: asset.size, esmModules: packageResources.length })}\n`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

function compile({ entryPath, fixtureModules, outputPath }) {
  return new Promise((resolve, reject) => {
    const compiler = webpack({
      context: repositoryRoot,
      entry: entryPath,
      experiments: { outputModule: true },
      mode: 'production',
      output: { filename: 'bundle.mjs', module: true, path: outputPath },
      performance: false,
      resolve: {
        conditionNames: ['webpack', 'browser', 'import', 'default'],
        modules: [fixtureModules, path.join(repositoryRoot, 'node_modules'), 'node_modules'],
      },
      target: ['web', 'es2022'],
    });
    compiler.run((error, stats) => {
      compiler.close((closeError) => {
        if (error) reject(error);
        else if (closeError) reject(closeError);
        else resolve(stats);
      });
    });
  });
}
