import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  BUNDLE_CONFIGURATION,
  DEFAULT_RXJS_VERSION,
  combineWebpackStats,
  createConfigurationFingerprint,
  createNextBarrelSource,
  discoverNextSourceFiles,
  isExactVersion,
  normalizeRegistryManifest,
  parseArgs,
  publishedArtifactLabel,
  publishedCacheDirectory,
  validateRxjsVersionRequest,
} from './analyze-bundles.mjs';

test('parseArgs uses the default published version and opens the report', () => {
  assert.deepEqual(parseArgs([]), {
    help: false,
    openReport: true,
    refresh: false,
    requestedVersions: [DEFAULT_RXJS_VERSION],
  });
});

test('parseArgs accepts repeated versions, refresh, and no-open', () => {
  assert.deepEqual(
    parseArgs(['--', '--rxjs-version', '7.8.1', '--rxjs-version=next', '--rxjs-version', '7.8.1', '--refresh', '--no-open']),
    {
      help: false,
      openReport: false,
      refresh: true,
      requestedVersions: ['7.8.1', 'next'],
    }
  );
});

test('version validation accepts exact releases and tags but rejects package specs', () => {
  assert.equal(isExactVersion('9.0.0-alpha.1'), true);
  assert.equal(validateRxjsVersionRequest('next'), 'next');
  assert.throws(() => validateRxjsVersionRequest('rxjs@7.8.2'), /Invalid RxJS version/);
  assert.throws(() => parseArgs(['--rxjs-version']), /requires a version/);
  assert.throws(() => parseArgs(['--wat']), /Unknown option/);
});

test('registry metadata normalizes an npm tag to an exact immutable target', () => {
  assert.deepEqual(
    normalizeRegistryManifest('next', [
      {
        version: '8.0.0-alpha.14',
        dist: { integrity: 'sha512-test-integrity' },
      },
    ]),
    {
      integrity: 'sha512-test-integrity',
      requested: 'next',
      version: '8.0.0-alpha.14',
    }
  );
  assert.throws(() => normalizeRegistryManifest('next', { version: 'next', dist: {} }), /exact version and integrity/);
});

test('configuration fingerprints are stable and change with compilation settings', () => {
  const first = createConfigurationFingerprint();
  assert.equal(first, createConfigurationFingerprint());
  assert.notEqual(
    first,
    createConfigurationFingerprint(undefined, {
      ...BUNDLE_CONFIGURATION,
      minimize: false,
    })
  );
});

test('published labels and cache paths are filesystem-safe', () => {
  assert.equal(publishedArtifactLabel('9.0.0-alpha.1+build.2'), 'rxjs-9.0.0-alpha.1-build.2');
  assert.equal(publishedCacheDirectory('/cache', '7.8.2', 'abc123'), path.join('/cache', 'published', 'rxjs', '7.8.2', 'abc123'));
  assert.throws(() => publishedCacheDirectory('/cache', '../latest', 'abc123'), /invalid version/);
});

test('source discovery includes only top-level runtime TypeScript modules', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'rxjs-source-discovery-'));
  try {
    await Promise.all([
      writeFile(path.join(directory, 'operator.ts'), 'export const operator = 1;\n'),
      writeFile(path.join(directory, 'operator.spec.ts'), 'throw new Error();\n'),
      writeFile(path.join(directory, 'ambient.d.ts'), 'declare const ambient: true;\n'),
      writeFile(path.join(directory, 'index.ts'), "export * from './operator';\n"),
      writeFile(path.join(directory, 'notes.md'), '# Notes\n'),
      mkdir(path.join(directory, 'testing')),
    ]);
    await writeFile(path.join(directory, 'testing', 'helper.ts'), 'export const helper = 1;\n');

    const files = await discoverNextSourceFiles(directory);
    assert.deepEqual(files, [path.join(directory, 'operator.ts')]);
    assert.match(createNextBarrelSource(files), /@rxjs\/observable-polyfill/);
    assert.match(createNextBarrelSource(files), /operator\.ts/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('combined stats flatten independent compilations without child stats', () => {
  const first = {
    hash: 'one',
    time: 10,
    assets: [{ name: 'one.js', chunks: ['one'] }],
    assetsByChunkName: { one: ['one.js'] },
    chunks: [{ id: 'one' }],
    modules: [{ id: 'one:module', chunks: ['one'] }],
    entrypoints: { one: { name: 'one' } },
    namedChunkGroups: { one: { name: 'one' } },
    errors: [],
    warnings: [],
  };
  const second = {
    hash: 'two',
    time: 20,
    assets: [{ name: 'two.js', chunks: ['two'] }],
    assetsByChunkName: { two: ['two.js'] },
    chunks: [{ id: 'two' }],
    modules: [{ id: 'two:module', chunks: ['two'] }],
    entrypoints: { two: { name: 'two' } },
    namedChunkGroups: { two: { name: 'two' } },
    errors: [],
    warnings: [],
  };

  const combined = combineWebpackStats(
    [
      { label: 'first', stats: first },
      { label: 'second', stats: second },
    ],
    '5.test'
  );

  assert.equal(combined.version, '5.test');
  assert.equal(combined.time, 30);
  assert.deepEqual(
    combined.assets.map(({ name }) => name),
    ['one.js', 'two.js']
  );
  assert.deepEqual(
    combined.modules.map(({ id }) => id),
    ['one:module', 'two:module']
  );
  assert.equal('children' in combined, false);
  assert.deepEqual(Object.keys(combined.entrypoints), ['first:one', 'second:two']);
});
