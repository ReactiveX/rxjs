#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { verifyCandidate } from './release-candidate.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));

export function buildNpmDryRunCommands(manifest, candidateRoot) {
  return manifest.packages.flatMap((entry) => {
    const tarball = path.join(candidateRoot, entry.filename);
    return [
      { packageName: entry.name, operation: 'pack', args: ['pack', tarball, '--dry-run', '--json', '--ignore-scripts'] },
      {
        packageName: entry.name,
        operation: 'publish',
        args: ['publish', tarball, '--dry-run', '--json', '--ignore-scripts', '--tag', manifest.channel],
      },
      {
        packageName: entry.name,
        operation: 'stage publish',
        args: ['stage', 'publish', tarball, '--dry-run', '--json', '--ignore-scripts', '--tag', manifest.channel],
      },
      {
        packageName: entry.name,
        operation: 'trust github',
        args: [
          'trust',
          'github',
          entry.name,
          '--file',
          'release-stage.yml',
          '--repository',
          'ReactiveX/rxjs',
          '--environment',
          'npm-stage',
          '--allow-stage-publish',
          '--dry-run',
          '--json',
          '--yes',
        ],
      },
    ];
  });
}

export async function verifyNpmDryRuns(candidateRoot, { npmBin = process.env.NPM_DRY_RUN_BIN ?? 'npm', run = spawnSync } = {}) {
  const manifest = await verifyCandidate(candidateRoot, { expectedSourceCommit: process.env.RELEASE_EXPECTED_SOURCE_COMMIT });
  const cache = await mkdtemp(path.join(tmpdir(), 'rxjs-release-dry-run-cache-'));
  const env = {
    ...process.env,
    NPM_CONFIG_CACHE: cache,
    NPM_CONFIG_DRY_RUN: 'true',
    NPM_CONFIG_FUND: 'false',
    NPM_CONFIG_PROVENANCE: 'false',
    NPM_CONFIG_UPDATE_NOTIFIER: 'false',
  };
  delete env.NODE_AUTH_TOKEN;
  delete env.NPM_TOKEN;
  try {
    for (const command of buildNpmDryRunCommands(manifest, candidateRoot)) {
      if (!command.args.includes('--dry-run')) throw new Error(`Refusing non-dry-run npm ${command.operation} for ${command.packageName}.`);
      const result = run(npmBin, command.args, { cwd: root, encoding: 'utf8', env });
      if (result.status !== 0) {
        throw new Error(
          `npm ${command.operation} --dry-run failed for ${command.packageName} (${result.status}).\n${result.stdout ?? ''}${
            result.stderr ?? ''
          }`
        );
      }
      process.stdout.write(`Verified npm ${command.operation} --dry-run for ${command.packageName}@${manifest.version}.\n`);
    }
  } finally {
    await rm(cache, { recursive: true, force: true });
  }
  return manifest;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const candidateRoot = path.resolve(root, process.argv[2] ?? '.release/candidate');
  verifyNpmDryRuns(candidateRoot).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
