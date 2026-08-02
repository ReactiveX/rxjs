#!/usr/bin/env node

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { auditPackedPackage } from '../prerelease-adoption-lib.mjs';
import { channelForVersion, releasePackages } from './release-config.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [command, directory = '.release/candidate'] = process.argv.slice(2);
  const candidateRoot = path.resolve(root, directory);
  if (command === 'build') await buildCandidate(candidateRoot);
  else if (command === 'verify') await verifyCandidate(candidateRoot);
  else if (command === 'hydrate') await hydrateCandidate(candidateRoot);
  else throw new Error('Usage: release-candidate.mjs <build|verify|hydrate> [candidate-directory]');
}

async function buildCandidate(outputRoot) {
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
    schemaVersion: 1,
    sourceCommit: process.env.GITHUB_SHA ?? run('git', ['rev-parse', 'HEAD'], root).stdout.trim(),
    version,
    channel: channelForVersion(version),
    generatedAt: new Date().toISOString(),
    packages,
  };
  await writeFile(path.join(outputRoot, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await verifyCandidate(outputRoot);
  process.stdout.write(`${JSON.stringify({ version, channel: manifest.channel, packages: packages.length })}\n`);
}

export async function verifyCandidate(outputRoot) {
  const manifest = JSON.parse(await readFile(path.join(outputRoot, 'release-manifest.json'), 'utf8'));
  assert.equal(manifest.schemaVersion, 1);
  if (process.env.GITHUB_SHA) assert.equal(manifest.sourceCommit, process.env.GITHUB_SHA, 'Candidate source commit changed.');
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
  process.stdout.write(`Verified exact candidate ${manifest.version} (${manifest.sourceCommit}).\n`);
  return manifest;
}

async function hydrateCandidate(outputRoot) {
  const manifest = await verifyCandidate(outputRoot);
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
