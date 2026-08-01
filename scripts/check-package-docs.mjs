#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageRequirements = {
  'packages/rxjs/package.json': ['README.md', 'MIGRATION.md', 'CONTRIBUTING.md', 'docs'],
  'packages/observable-polyfill/package.json': ['README.md'],
  'packages/test/package.json': ['README.md'],
  'packages/migrate/package.json': ['README.md', 'docs', 'skill'],
};

export function auditPackageDocs({ documents, existingPaths, manifests }) {
  const errors = [];

  for (const [manifestPath, requiredFiles] of Object.entries(packageRequirements)) {
    const publishedFiles = manifests[manifestPath]?.files ?? [];
    for (const requiredFile of requiredFiles) {
      if (!publishedFiles.includes(requiredFile)) {
        errors.push(`${manifestPath} must publish package documentation path ${requiredFile}.`);
      }
    }
  }

  for (const [documentPath, source] of documents) {
    if (/rxjs\.dev|apps\/rxjs\.dev/i.test(source)) {
      errors.push(`${documentPath} must not depend on the separate documentation-site workstream.`);
    }

    for (const target of markdownLinkTargets(source)) {
      if (/^(?:https?:|mailto:|#)/.test(target)) continue;
      if (!target.includes('/') && !/\.[a-z0-9]+(?:#|$)/i.test(target)) continue;
      const [targetPath] = target.split('#');
      if (!targetPath) continue;
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(documentPath), decodeURIComponent(targetPath)));
      if (!existingPaths.has(resolved)) errors.push(`${documentPath} has a missing local link: ${target}.`);
      const packageMatch = documentPath.match(/^(packages\/[^/]+)\//);
      if (packageMatch && resolved !== packageMatch[1] && !resolved.startsWith(`${packageMatch[1]}/`)) {
        errors.push(`${documentPath} has a local link outside its package container: ${target}.`);
      }
    }
  }

  return errors;
}

function markdownLinkTargets(source) {
  return [...source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)]
    .map((match) => match[1].trim())
    .map((target) => (target.startsWith('<') && target.endsWith('>') ? target.slice(1, -1) : target))
    .map((target) => target.split(/\s+["']/)[0]);
}

export async function checkPackageDocs(root = repositoryRoot) {
  const documentPaths = [
    'README.md',
    'packages/rxjs/README.md',
    'packages/rxjs/MIGRATION.md',
    'packages/rxjs/CONTRIBUTING.md',
    ...(await markdownFiles(root, 'packages/rxjs/docs')),
    'packages/observable-polyfill/README.md',
    'packages/observable-polyfill/test/wpt/README.md',
    'packages/test/README.md',
    'packages/migrate/README.md',
    ...(await markdownFiles(root, 'packages/migrate/docs')),
    ...(await markdownFiles(root, 'packages/migrate/skill')),
  ];
  const documents = await Promise.all(
    documentPaths.map(async (documentPath) => [documentPath, await readFile(path.join(root, documentPath), 'utf8')])
  );
  const manifestEntries = await Promise.all(
    Object.keys(packageRequirements).map(async (manifestPath) => [
      manifestPath,
      JSON.parse(await readFile(path.join(root, manifestPath), 'utf8')),
    ])
  );
  const existingPaths = new Set(await allPaths(root));
  const errors = auditPackageDocs({ documents, existingPaths, manifests: Object.fromEntries(manifestEntries) });
  if (errors.length > 0) throw new Error(`Package documentation check failed:\n- ${errors.join('\n- ')}`);
}

async function markdownFiles(root, relativeDirectory) {
  const entries = await readdir(path.join(root, relativeDirectory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) files.push(...(await markdownFiles(root, relativePath)));
    else if (entry.name.endsWith('.md')) files.push(relativePath);
  }
  return files.sort();
}

async function allPaths(root) {
  const paths = [];
  async function visit(relativeDirectory) {
    const entries = await readdir(path.join(root, relativeDirectory), { withFileTypes: true });
    for (const entry of entries) {
      if (['.git', '.cache', '.tshy-build', 'dist', 'node_modules'].includes(entry.name)) continue;
      const relativePath = path.posix.join(relativeDirectory, entry.name);
      paths.push(relativePath);
      if (entry.isDirectory()) await visit(relativePath);
    }
  }
  await visit('');
  return paths;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  checkPackageDocs()
    .then(() => console.log('Package documentation, publication paths, and local links are current.'))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
