#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recordEvidence, verifyCandidate } from './release-candidate.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const candidateRoot = path.resolve(root, process.argv[2] ?? '.release/candidate');
const manifest = await verifyCandidate(candidateRoot);
if (!manifest.reproducible || manifest.independentBuilds.length !== 2) {
  throw new Error('Release evidence requires two matching independent builds.');
}

const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'rxjs-release-evidence-'));
try {
  const dependencies = Object.fromEntries(
    manifest.packages.map(({ name, filename }) => [name, `file:${path.join(candidateRoot, filename)}`])
  );
  await writeFile(
    path.join(temporaryRoot, 'package.json'),
    `${JSON.stringify({ name: 'rxjs-release-train-evidence', version: manifest.version, private: true, dependencies }, null, 2)}\n`
  );
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock-only'], temporaryRoot);
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], temporaryRoot);
  const sbom = run('npm', ['sbom', '--sbom-format', 'cyclonedx', '--json'], temporaryRoot).stdout;
  const parsed = JSON.parse(sbom);
  delete parsed.serialNumber;
  parsed.metadata ??= {};
  delete parsed.metadata.timestamp;
  normalizeLocalPaths(parsed);
  const sbomFilename = `rxjs-${manifest.version}.cdx.json`;
  const lockFilename = `rxjs-${manifest.version}.release-lock.json`;
  await writeFile(path.join(candidateRoot, sbomFilename), `${JSON.stringify(parsed, null, 2)}\n`);
  const releaseLock = JSON.parse(await readFile(path.join(temporaryRoot, 'package-lock.json'), 'utf8'));
  normalizeLocalPaths(releaseLock);
  await writeFile(path.join(candidateRoot, lockFilename), `${JSON.stringify(releaseLock, null, 2)}\n`);
  await recordEvidence(candidateRoot, [sbomFilename, lockFilename]);
  process.stdout.write(`${JSON.stringify({ sbomFilename, lockFilename })}\n`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

function normalizeLocalPaths(value) {
  if (Array.isArray(value)) {
    for (const item of value) normalizeLocalPaths(item);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string') {
      value[key] = item.replaceAll(candidateRoot, '.').replaceAll(temporaryRoot, '.');
    } else {
      normalizeLocalPaths(item);
    }
  }
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status}).\n${result.stdout}${result.stderr}`);
  return result;
}
