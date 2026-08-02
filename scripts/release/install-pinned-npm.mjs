#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { releaseToolchain } from './release-config.mjs';

export function verifyRegistryIntegrity(bytes, expectedIntegrity = releaseToolchain.npmIntegrity) {
  const actual = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
  if (actual !== expectedIntegrity)
    throw new Error(`npm registry tarball integrity mismatch: expected ${expectedIntegrity}, got ${actual}.`);
  return actual;
}

export async function installPinnedNpm(installRoot) {
  const metadataUrl = `https://registry.npmjs.org/npm/${releaseToolchain.npm}`;
  const metadataResponse = await fetch(metadataUrl, { headers: { accept: 'application/json' } });
  if (!metadataResponse.ok) throw new Error(`npm registry metadata request failed with HTTP ${metadataResponse.status}.`);
  const metadata = await metadataResponse.json();
  if (metadata.version !== releaseToolchain.npm || metadata.dist?.integrity !== releaseToolchain.npmIntegrity) {
    throw new Error('The npm registry metadata does not match the checked-in npm version and SHA-512.');
  }
  const tarballResponse = await fetch(metadata.dist.tarball);
  if (!tarballResponse.ok) throw new Error(`npm registry tarball request failed with HTTP ${tarballResponse.status}.`);
  const bytes = Buffer.from(await tarballResponse.arrayBuffer());
  verifyRegistryIntegrity(bytes);

  await mkdir(installRoot, { recursive: true });
  const tarball = path.join(installRoot, `npm-${releaseToolchain.npm}.tgz`);
  await writeFile(tarball, bytes);
  const result = spawnSync('npm', ['install', '--global', '--ignore-scripts', '--prefix', installRoot, tarball], {
    encoding: 'utf8',
    env: { ...process.env, NPM_CONFIG_AUDIT: 'false', NPM_CONFIG_FUND: 'false' },
  });
  if (result.status !== 0) throw new Error(`Installing the verified npm CLI failed (${result.status}).\n${result.stdout}${result.stderr}`);
  const executable = path.join(installRoot, 'bin', 'npm');
  await readFile(executable);
  return executable;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const installRoot = path.resolve(process.argv[2] ?? '.release/npm-cli');
  const executable = await installPinnedNpm(installRoot);
  process.stdout.write(`${executable}\n`);
}
