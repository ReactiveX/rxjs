#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { verifyCandidate } from './release-candidate.mjs';

const candidateRoot = path.resolve(process.argv[2]);
const manifest = await verifyCandidate(candidateRoot);
for (const entry of manifest.packages) {
  const url = `https://registry.npmjs.org/${encodeURIComponent(entry.name)}/${encodeURIComponent(entry.version)}`;
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (response.status === 404) {
    process.stdout.write(`${entry.name}@${entry.version} is not public yet.\n`);
    process.exitCode = 2;
    break;
  }
  if (!response.ok) throw new Error(`npm registry request failed for ${entry.name}: ${response.status}`);
  const metadata = await response.json();
  if (metadata.dist?.integrity !== entry.integrity) {
    throw new Error(`${entry.name}@${entry.version} is public but its registry integrity does not match the qualified tarball.`);
  }
  process.stdout.write(`Verified public ${entry.name}@${entry.version} at ${entry.integrity}.\n`);
}

if (!process.exitCode) {
  const auditRoot = await mkdtemp(path.join(tmpdir(), 'rxjs-release-signatures-'));
  try {
    await writeFile(
      path.join(auditRoot, 'package.json'),
      `${JSON.stringify(
        {
          name: 'rxjs-release-signature-audit',
          private: true,
          dependencies: Object.fromEntries(manifest.packages.map(({ name, version }) => [name, version])),
        },
        null,
        2
      )}\n`
    );
    run('npm', ['install', '--ignore-scripts', '--package-lock-only', '--no-audit', '--no-fund'], auditRoot);
    run('npm', ['audit', 'signatures'], auditRoot);
    process.stdout.write('Verified npm registry signatures and provenance for the public release train.\n');
  } finally {
    await rm(auditRoot, { recursive: true, force: true });
  }
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status}).\n${result.stdout}${result.stderr}`);
  return result;
}
