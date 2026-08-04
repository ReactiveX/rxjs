import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  assertInteractivePublishingEnvironment,
  assertRepositoryReady,
  assertSynchronizedVersion,
  localVerificationCommands,
  parseArguments,
  publishArguments,
  releasePackages,
  validateBetaVersion,
} from './beta.mjs';

test('accepts one explicit RxJS 9 beta and an optional dry run', () => {
  assert.deepEqual(parseArguments(['9.0.0-beta.0']), { dryRun: false, version: '9.0.0-beta.0' });
  assert.deepEqual(parseArguments(['9.0.0-beta.12', '--dry-run']), { dryRun: true, version: '9.0.0-beta.12' });
  assert.equal(validateBetaVersion('9.0.0-beta.0'), '9.0.0-beta.0');
  for (const invalid of ['9.0.0', '9.0.1-beta.0', '8.0.0-beta.0', '9.0.0-beta.01', 'next']) {
    assert.throws(() => validateBetaVersion(invalid), /Expected an RxJS 9 beta version/);
  }
  assert.throws(() => parseArguments([]), /Usage/);
  assert.throws(() => parseArguments(['9.0.0-beta.0', 'extra']), /Usage/);
});

test('publishes the three scoped packages before rxjs and always uses next', () => {
  assert.deepEqual(
    releasePackages.map(({ name }) => name),
    ['@rxjs/observable-polyfill', '@rxjs/test', '@rxjs/migrate', 'rxjs']
  );
  const live = publishArguments('/tmp/rxjs.tgz');
  assert.deepEqual(live, ['publish', '/tmp/rxjs.tgz', '--tag', 'next', '--access', 'public']);
  assert.deepEqual(publishArguments('/tmp/rxjs.tgz', { cache: '/tmp/cache', dryRun: true }), [
    ...live,
    '--cache',
    '/tmp/cache',
    '--dry-run',
  ]);
});

test('runs repository checks and all four package gates before packing', () => {
  assert.deepEqual(localVerificationCommands(), [
    ['pnpm', 'run', 'release:check'],
    ['pnpm', '--filter', '@rxjs/observable-polyfill', 'run', 'test:package'],
    ['pnpm', '--filter', '@rxjs/test', 'run', 'test:package'],
    ['pnpm', '--filter', '@rxjs/migrate', 'run', 'test:package'],
    ['pnpm', '--filter', 'rxjs', 'run', 'test:package'],
  ]);
});

test('requires synchronized package versions and the exact internal runtime dependency', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'rxjs-beta-test-'));
  try {
    for (const releasePackage of releasePackages) {
      const directory = path.join(root, releasePackage.directory);
      await mkdir(directory, { recursive: true });
      const manifest = { name: releasePackage.name, version: '9.0.0-beta.0' };
      if (releasePackage.name === 'rxjs') manifest.dependencies = { '@rxjs/observable-polyfill': '9.0.0-beta.0' };
      await writeFile(path.join(directory, 'package.json'), JSON.stringify(manifest));
    }
    await assertSynchronizedVersion(root, '9.0.0-beta.0');
    const rxjsPath = path.join(root, 'packages/rxjs/package.json');
    await writeFile(
      rxjsPath,
      JSON.stringify({ name: 'rxjs', version: '9.0.0-beta.0', dependencies: { '@rxjs/observable-polyfill': '^9.0.0-beta.0' } })
    );
    await assert.rejects(() => assertSynchronizedVersion(root, '9.0.0-beta.0'), /must depend/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('live publication requires clean synchronized master while dry runs require only a clean checkout', () => {
  const responses = new Map([
    ['status --porcelain --untracked-files=normal', ''],
    ['branch --show-current', 'master\n'],
    ['rev-parse --abbrev-ref --symbolic-full-name @{upstream}', 'upstream/master\n'],
    ['rev-list --left-right --count HEAD...@{upstream}', '0\t0\n'],
  ]);
  const command = (_command, args) => ({ status: 0, stdout: responses.get(args.join(' ')) ?? '' });
  assert.doesNotThrow(() => assertRepositoryReady('/repo', { live: true, command }));
  assert.doesNotThrow(() => assertRepositoryReady('/repo', { live: false, command }));

  responses.set('status --porcelain --untracked-files=normal', ' M package.json\n');
  assert.throws(() => assertRepositoryReady('/repo', { live: false, command }), /must be clean/);
  responses.set('status --porcelain --untracked-files=normal', '');
  responses.set('branch --show-current', 'feature\n');
  assert.throws(() => assertRepositoryReady('/repo', { live: true, command }), /must run from master/);
});

test('live publication refuses CI, environment tokens, and non-interactive terminals', () => {
  const terminal = { isTTY: true };
  assert.doesNotThrow(() => assertInteractivePublishingEnvironment({ dryRun: false, env: {}, stdin: terminal, stdout: terminal }));
  assert.throws(
    () => assertInteractivePublishingEnvironment({ dryRun: false, env: { CI: 'true' }, stdin: terminal, stdout: terminal }),
    /refuses to run in CI/
  );
  assert.throws(
    () => assertInteractivePublishingEnvironment({ dryRun: false, env: { NPM_TOKEN: 'secret' }, stdin: terminal, stdout: terminal }),
    /Unset NPM_TOKEN/
  );
  assert.throws(
    () => assertInteractivePublishingEnvironment({ dryRun: false, env: {}, stdin: { isTTY: false }, stdout: terminal }),
    /interactive terminal/
  );
  assert.doesNotThrow(() =>
    assertInteractivePublishingEnvironment({ dryRun: true, env: { CI: 'true', NPM_TOKEN: 'secret' }, stdin: {}, stdout: {} })
  );
});
