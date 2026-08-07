#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const forbiddenReferences = [
  ['@rxjs', 'migrate'].join('/'),
  ['packages', 'migrate'].join('/'),
  ['rxjs', 'migrate'].join('-'),
];
const skippedDirectories = new Set(['.cache', '.git', '.nx', '.tshy-build', 'dist', 'node_modules']);

export function auditRetiredProductReferences(files) {
  const errors = [];
  for (const [file, source] of files) {
    for (const reference of forbiddenReferences) {
      if (source.includes(reference)) errors.push(`${file} contains retired product reference ${reference}.`);
    }
  }
  return errors;
}

export async function checkRetiredProductReferences(root = repositoryRoot) {
  const files = new Map();
  await visit('');
  const errors = auditRetiredProductReferences(files);
  if (errors.length > 0) throw new Error(`Retired product reference check failed:\n- ${errors.join('\n- ')}`);

  async function visit(relativeDirectory) {
    const entries = await readdir(path.join(root, relativeDirectory), { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
      const relativePath = path.posix.join(relativeDirectory, entry.name);
      if (entry.isDirectory()) {
        await visit(relativePath);
      } else if (entry.isFile()) {
        const bytes = await readFile(path.join(root, relativePath));
        if (!bytes.includes(0)) files.set(relativePath, bytes.toString('utf8'));
      }
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  checkRetiredProductReferences()
    .then(() => console.log('Retired product names, paths, and binaries are absent from the repository.'))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
