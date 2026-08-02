#!/usr/bin/env node

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { auditPackedPackage } from '../prerelease-adoption-lib.mjs';
import { channelForVersion, releasePackages, releaseToolchain } from './release-config.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [command, directory = '.release/candidate'] = process.argv.slice(2);
  const candidateRoot = path.resolve(root, directory);
  const expectedSourceCommit = process.env.RELEASE_EXPECTED_SOURCE_COMMIT;
  if (command === 'build') await buildCandidate(candidateRoot, { expectedSourceCommit });
  else if (command === 'verify') await verifyCandidate(candidateRoot, { expectedSourceCommit });
  else if (command === 'hydrate') await hydrateCandidate(candidateRoot, { expectedSourceCommit });
  else if (command === 'record-evidence') await recordEvidence(candidateRoot, process.argv.slice(4));
  else if (command === 'manifest-digest') process.stdout.write(`${await manifestDigest(candidateRoot)}\n`);
  else throw new Error('Usage: release-candidate.mjs <build|verify|hydrate|record-evidence|manifest-digest> [candidate-directory]');
}

async function buildCandidate(outputRoot, { expectedSourceCommit } = {}) {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  const budgets = JSON.parse(await readFile(path.join(root, 'packages/rxjs/test/release/budgets.json'), 'utf8'));
  const packages = [];
  const npmCache = await mkdtemp(path.join(tmpdir(), 'rxjs-release-npm-cache-'));
  try {
    for (const releasePackage of releasePackages) {
      const result = run(
        'npm',
        ['pack', '--json', '--pack-destination', outputRoot, '--cache', npmCache],
        path.join(root, releasePackage.directory)
      );
      const [report] = JSON.parse(result.stdout);
      assert.equal(report.name, releasePackage.name);
      const auditErrors = auditPackedPackage(report, budgets);
      assert.deepEqual(auditErrors, [], auditErrors.join('\n'));
      const tarball = path.join(outputRoot, report.filename);
      const bytes = await readFile(tarball);
      packages.push({
        name: report.name,
        version: report.version,
        filename: report.filename,
        size: bytes.byteLength,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        sha512: createHash('sha512').update(bytes).digest('hex'),
        integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
        contents: report.files.map(({ path: filePath, size }) => ({ path: filePath, size })),
      });
    }
  } finally {
    await rm(npmCache, { recursive: true, force: true });
  }
  const versions = new Set(packages.map(({ version }) => version));
  assert.equal(versions.size, 1, 'Candidate packages must have one synchronized version.');
  const [version] = versions;
  const manifest = {
    schemaVersion: 2,
    sourceCommit: run('git', ['rev-parse', 'HEAD'], root).stdout.trim(),
    authorizingPullRequest: Number(process.env.RELEASE_AUTHORIZING_PR ?? 0),
    version,
    channel: channelForVersion(version),
    toolchain: releaseToolchain,
    build: {
      id: process.env.RELEASE_BUILD_ID ?? 'local',
      runner: process.env.RELEASE_RUNNER_IMAGE ?? process.platform,
    },
    reproducible: false,
    independentBuilds: [],
    packages,
  };
  await writeFile(path.join(outputRoot, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await verifyCandidate(outputRoot, { expectedSourceCommit });
  process.stdout.write(`${JSON.stringify({ version, channel: manifest.channel, packages: packages.length })}\n`);
}

export async function verifyCandidate(outputRoot, { expectedSourceCommit } = {}) {
  const manifest = JSON.parse(await readFile(path.join(outputRoot, 'release-manifest.json'), 'utf8'));
  assert.equal(manifest.schemaVersion, 2);
  assert.deepEqual(manifest.toolchain, releaseToolchain, 'Candidate toolchain drifted.');
  if (expectedSourceCommit) assert.equal(manifest.sourceCommit, expectedSourceCommit, 'Candidate source commit changed.');
  assert.ok(
    Number.isSafeInteger(manifest.authorizingPullRequest) && manifest.authorizingPullRequest >= 0,
    'Authorizing pull request is invalid.'
  );
  assert.equal(manifest.packages.length, releasePackages.length);
  assert.deepEqual(
    manifest.packages.map(({ name }) => name),
    releasePackages.map(({ name }) => name),
    'Candidate approval order or package inventory changed.'
  );
  assert.equal(manifest.channel, channelForVersion(manifest.version));
  for (const entry of manifest.packages) {
    assert.equal(entry.version, manifest.version);
    const tarballPath = path.join(outputRoot, entry.filename);
    const info = await stat(tarballPath);
    const bytes = await readFile(tarballPath);
    assert.equal(info.size, entry.size, `${entry.name} size changed.`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, `${entry.name} SHA-256 changed.`);
    assert.equal(createHash('sha512').update(bytes).digest('hex'), entry.sha512, `${entry.name} SHA-512 changed.`);
    assert.equal(`sha512-${createHash('sha512').update(bytes).digest('base64')}`, entry.integrity, `${entry.name} integrity changed.`);
  }
  const expectedFiles = new Set(['release-manifest.json', ...manifest.packages.map(({ filename }) => filename)]);
  for (const evidence of manifest.evidence ?? []) {
    const evidencePath = path.join(outputRoot, evidence.filename);
    const bytes = await readFile(evidencePath);
    assert.equal(createHash('sha512').update(bytes).digest('hex'), evidence.sha512, `${evidence.filename} SHA-512 changed.`);
    expectedFiles.add(evidence.filename);
  }
  const actualFiles = new Set(await readdir(outputRoot));
  assert.deepEqual(actualFiles, expectedFiles, 'Candidate contains missing or additional files.');
  process.stdout.write(`Verified exact candidate ${manifest.version} (${manifest.sourceCommit}).\n`);
  return manifest;
}

export async function compareCandidates(firstRoot, secondRoot, outputRoot) {
  const first = await verifyCandidate(firstRoot);
  const second = await verifyCandidate(secondRoot);
  const normalized = (manifest) => ({
    schemaVersion: manifest.schemaVersion,
    sourceCommit: manifest.sourceCommit,
    authorizingPullRequest: manifest.authorizingPullRequest,
    version: manifest.version,
    channel: manifest.channel,
    toolchain: manifest.toolchain,
    packages: manifest.packages,
  });
  assert.deepEqual(normalized(second), normalized(first), 'Independent build manifest or inventory drifted.');
  for (const entry of first.packages) {
    assert.deepEqual(
      await readFile(path.join(secondRoot, entry.filename)),
      await readFile(path.join(firstRoot, entry.filename)),
      `${entry.name} was not byte-identical across independent builds.`
    );
  }
  await rm(outputRoot, { recursive: true, force: true });
  await cp(firstRoot, outputRoot, { recursive: true });
  first.reproducible = true;
  first.independentBuilds = [first, second].map((manifest) => ({ id: manifest.build.id, runner: manifest.build.runner }));
  await writeFile(path.join(outputRoot, 'release-manifest.json'), `${JSON.stringify(first, null, 2)}\n`);
  return verifyCandidate(outputRoot);
}

export async function recordEvidence(outputRoot, filenames) {
  assert.ok(filenames.length > 0, 'At least one evidence filename is required.');
  const manifestPath = path.join(outputRoot, 'release-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const packageFiles = new Set(manifest.packages.map(({ filename }) => filename));
  const evidence = new Map((manifest.evidence ?? []).map((entry) => [entry.filename, entry]));
  for (const filename of filenames) {
    assert.equal(path.basename(filename), filename, 'Evidence filenames must not contain a path.');
    assert.ok(!packageFiles.has(filename) && filename !== 'release-manifest.json', `${filename} is not an evidence filename.`);
    const bytes = await readFile(path.join(outputRoot, filename));
    evidence.set(filename, { filename, size: bytes.length, sha512: createHash('sha512').update(bytes).digest('hex') });
  }
  manifest.evidence = [...evidence.values()].sort((a, b) => a.filename.localeCompare(b.filename));
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return verifyCandidate(outputRoot);
}

export async function manifestDigest(outputRoot) {
  const bytes = await readFile(path.join(outputRoot, 'release-manifest.json'));
  return createHash('sha512').update(bytes).digest('hex');
}

async function hydrateCandidate(outputRoot, { expectedSourceCommit } = {}) {
  const manifest = await verifyCandidate(outputRoot, { expectedSourceCommit });
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'rxjs-release-hydrate-'));
  try {
    for (const entry of manifest.packages) {
      const config = releasePackages.find(({ name }) => name === entry.name);
      const extractionRoot = path.join(temporaryRoot, entry.name.replaceAll('/', '-'));
      await mkdir(extractionRoot, { recursive: true });
      run('tar', ['-xzf', path.join(outputRoot, entry.filename), '-C', extractionRoot], root);
      const target = path.join(root, config.directory);
      await rm(path.join(target, 'dist'), { recursive: true, force: true });
      await cp(path.join(extractionRoot, 'package', 'dist'), path.join(target, 'dist'), { recursive: true });
      await cp(path.join(extractionRoot, 'package', 'package.json'), path.join(target, 'package.json'));
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
  process.stdout.write(`Hydrated workspace package entry points from exact candidate ${manifest.version}.\n`);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status}).\n${result.stdout}${result.stderr}`);
  return result;
}
