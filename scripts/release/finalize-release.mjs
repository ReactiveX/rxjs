#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(process.argv[2], 'utf8'));
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
