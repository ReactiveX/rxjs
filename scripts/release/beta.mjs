#!/usr/bin/env node

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url));

export const releasePackages = Object.freeze([
  { name: '@rxjs/observable-polyfill', directory: 'packages/observable-polyfill' },
  { name: '@rxjs/test', directory: 'packages/test' },
  { name: '@rxjs/migrate', directory: 'packages/migrate' },
  { name: 'rxjs', directory: 'packages/rxjs' },
]);

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await main(process.argv.slice(2));
}

export async function main(argv, options = {}) {
  const { version, dryRun } = parseArguments(argv);
  const root = options.root ?? repositoryRoot;
  const command = options.command ?? run;
  const interactiveCommand = options.interactiveCommand ?? runInteractive;
  const prompt = options.prompt ?? confirmVersion;

  validateBetaVersion(version);
  assertSupportedNode(process.versions.node);
  await assertSynchronizedVersion(root, version);
  assertRepositoryReady(root, { live: !dryRun, command });
  assertInteractivePublishingEnvironment({ dryRun, env: process.env, stdin: process.stdin, stdout: process.stdout });

  const outputRoot = await mkdtemp(path.join(tmpdir(), `rxjs-${version}-`));
  const npmCache = path.join(outputRoot, 'npm-cache');
  try {
    printHeading(`Preparing ${version}`);
    for (const args of localVerificationCommands()) command(args[0], args.slice(1), { cwd: root, stdio: 'inherit' });
    assertRepositoryReady(root, { live: false, command });

    const candidates = [];
    for (const releasePackage of releasePackages) {
      const result = command('npm', ['pack', '--json', '--pack-destination', outputRoot, '--cache', npmCache], {
        cwd: path.join(root, releasePackage.directory),
        encoding: 'utf8',
      });
      const [report] = JSON.parse(result.stdout);
      assert.equal(report.name, releasePackage.name, `Packed the wrong package from ${releasePackage.directory}.`);
      assert.equal(report.version, version, `${releasePackage.name} packed the wrong version.`);
      const tarballPath = path.join(outputRoot, report.filename);
      const bytes = await readFile(tarballPath);
      candidates.push({
        ...releasePackage,
        filename: report.filename,
        integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
        size: bytes.byteLength,
        tarballPath,
      });
    }

    printCandidateSummary(candidates, version);
    printHeading('npm publish dry runs');
    for (const candidate of candidates) {
      command('npm', publishArguments(candidate.tarballPath, { cache: npmCache, dryRun: true }), {
        cwd: root,
        stdio: 'inherit',
      });
    }

    if (dryRun) {
      process.stdout.write(`\nDry run complete. Nothing was published.\n`);
      return { candidates, published: false };
    }

    const confirmation = await prompt(version);
    if (confirmation !== version) throw new Error('Release cancelled: confirmation did not exactly match the beta version.');

    printHeading('Publishing to npm under the next tag');
    for (const candidate of candidates) {
      const currentIntegrity = registryIntegrity(candidate.name, version, { cache: npmCache, command, root });
      if (currentIntegrity !== null) {
        assert.equal(currentIntegrity, candidate.integrity, `${candidate.name}@${version} already exists with different bytes.`);
        process.stdout.write(`Already published and verified: ${candidate.name}@${version}\n`);
        continue;
      }

      process.stdout.write(`\nPublishing ${candidate.name}@${version}. npm may request OTP/WebAuthn.\n`);
      interactiveCommand('npm', publishArguments(candidate.tarballPath, { cache: npmCache }), { cwd: root });
      const publishedIntegrity = registryIntegrity(candidate.name, version, { cache: npmCache, command, root });
      assert.equal(
        publishedIntegrity,
        candidate.integrity,
        `${candidate.name}@${version} registry integrity did not match the local tarball.`
      );
      process.stdout.write(`Published and verified: ${candidate.name}@${version}\n`);
    }

    for (const candidate of candidates) {
      const nextVersion = npmView(`${candidate.name}@next`, 'version', { cache: npmCache, command, root });
      assert.equal(nextVersion, version, `${candidate.name}@next does not resolve to ${version}.`);
    }
    const latestVersion = npmView('rxjs@latest', 'version', { cache: npmCache, command, root });
    assert.match(latestVersion, /^7\./, `rxjs@latest unexpectedly resolves to ${latestVersion}; expected the maintained RxJS 7 line.`);

    process.stdout.write(`\n${version} is published and verified under npm's next tag. rxjs@latest remains ${latestVersion}.\n`);
    return { candidates, published: true };
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
}

export function parseArguments(argv) {
  const dryRun = argv.includes('--dry-run');
  const positional = argv.filter((value) => value !== '--dry-run');
  if (positional.length !== 1) throw new Error('Usage: pnpm release:beta <9.0.0-beta.N> [--dry-run]');
  return { dryRun, version: positional[0] };
}

export function validateBetaVersion(version) {
  if (!/^9\.0\.0-beta\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error(`Expected an RxJS 9 beta version such as 9.0.0-beta.0; received ${JSON.stringify(version)}.`);
  }
  return version;
}

export async function assertSynchronizedVersion(root, version) {
  const manifests = new Map();
  for (const releasePackage of releasePackages) {
    const manifest = JSON.parse(await readFile(path.join(root, releasePackage.directory, 'package.json'), 'utf8'));
    assert.equal(manifest.name, releasePackage.name, `${releasePackage.directory} has the wrong package name.`);
    assert.equal(manifest.version, version, `${releasePackage.name} must already be versioned as ${version} on master.`);
    manifests.set(releasePackage.name, manifest);
  }
  assert.equal(
    manifests.get('rxjs').dependencies?.['@rxjs/observable-polyfill'],
    version,
    `rxjs must depend on @rxjs/observable-polyfill@${version}.`
  );
}

export function assertRepositoryReady(root, { live, command = run }) {
  const status = command('git', ['status', '--porcelain', '--untracked-files=normal'], { cwd: root, encoding: 'utf8' }).stdout.trim();
  assert.equal(status, '', 'The release checkout must be clean. Commit or discard every change first.');
  if (!live) return;

  const branch = command('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).stdout.trim();
  assert.equal(branch, 'master', `Live beta publication must run from master, not ${branch || 'a detached checkout'}.`);
  const upstream = command('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'], {
    cwd: root,
    encoding: 'utf8',
  }).stdout.trim();
  assert.match(upstream, /(?:^|\/)master$/, `master must track a remote master branch; found ${upstream}.`);
  const divergence = command('git', ['rev-list', '--left-right', '--count', 'HEAD...@{upstream}'], {
    cwd: root,
    encoding: 'utf8',
  }).stdout.trim();
  assert.match(divergence, /^0\s+0$/, `master must exactly match ${upstream}; divergence was ${divergence}. Fetch and update first.`);
}

export function assertInteractivePublishingEnvironment({ dryRun, env, stdin, stdout }) {
  if (dryRun) return;
  assert.ok(!env.CI, 'Live beta publication is interactive and refuses to run in CI.');
  assert.ok(
    !env.NPM_TOKEN && !env.NODE_AUTH_TOKEN,
    'Unset NPM_TOKEN and NODE_AUTH_TOKEN; this command uses interactive npm authentication.'
  );
  assert.ok(stdin.isTTY && stdout.isTTY, 'Live beta publication requires an interactive terminal for confirmation and npm OTP/WebAuthn.');
}

export function localVerificationCommands() {
  return [['pnpm', 'run', 'release:check'], ...releasePackages.map(({ name }) => ['pnpm', '--filter', name, 'run', 'test:package'])];
}

export function publishArguments(tarballPath, { cache, dryRun = false } = {}) {
  return [
    'publish',
    tarballPath,
    '--tag',
    'next',
    '--access',
    'public',
    ...(cache ? ['--cache', cache] : []),
    ...(dryRun ? ['--dry-run'] : []),
  ];
}

function registryIntegrity(name, version, options) {
  const result = npmViewResult(`${name}@${version}`, 'dist.integrity', options);
  if (result.status === 0) return parseNpmView(result.stdout);
  if (/E404|404 Not Found|is not in this registry/i.test(`${result.stdout}\n${result.stderr}`)) return null;
  throw new Error(`Could not determine whether ${name}@${version} already exists.\n${result.stdout}${result.stderr}`);
}

function npmView(specifier, field, options) {
  const result = npmViewResult(specifier, field, options);
  if (result.status !== 0) throw new Error(`npm view ${specifier} ${field} failed.\n${result.stdout}${result.stderr}`);
  return parseNpmView(result.stdout);
}

function npmViewResult(specifier, field, { cache, command, root }) {
  return command('npm', ['view', specifier, field, '--json', ...(cache ? ['--cache', cache] : [])], {
    cwd: root,
    encoding: 'utf8',
    allowFailure: true,
  });
}

function parseNpmView(stdout) {
  const value = JSON.parse(stdout);
  assert.equal(typeof value, 'string', `Expected npm view to return a string; received ${stdout}.`);
  return value;
}

function assertSupportedNode(version) {
  const [major, minor] = version.split('.').map(Number);
  assert.ok(major > 22 || (major === 22 && minor >= 13), `Node 22.13.0 or newer is required; found ${version}.`);
}

async function confirmVersion(version) {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  try {
    process.stdout.write('\nThis is irreversible. The four packages above will become publicly installable.\n');
    return await readline.question(`Type ${version} to publish, or anything else to cancel: `);
  } finally {
    readline.close();
  }
}

function printCandidateSummary(candidates, version) {
  printHeading(`Exact ${version} tarballs`);
  for (const candidate of candidates) {
    process.stdout.write(`${candidate.name.padEnd(30)} ${String(candidate.size).padStart(8)} bytes  ${candidate.integrity}\n`);
  }
  process.stdout.write('\nPublication order is exactly the order above; rxjs is last.\n');
}

function printHeading(label) {
  process.stdout.write(`\n=== ${label} ===\n`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { ...options, encoding: options.encoding ?? 'utf8' });
  if (!options.allowFailure && result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed (${result.status}).\n${result.stdout ?? ''}${result.stderr ?? ''}`);
  }
  return result;
}

function runInteractive(command, args, { cwd }) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status}).`);
  return result;
}
