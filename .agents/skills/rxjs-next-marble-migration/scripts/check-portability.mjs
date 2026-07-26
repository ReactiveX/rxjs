#!/usr/bin/env node

import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const checkedExtensions = new Set(['.md', '.js', '.mjs', '.json', '.ts']);
const forbidden = [
  { label: 'absolute user path', pattern: /\/(?:Users|home)\/[^/\s]+/ },
  { label: 'repository package path', pattern: /\bpackages\/rxjs\b/ },
  { label: 'repository source-test path', pattern: /\bspec\/operators\b/ },
  { label: 'repository branch name', pattern: /\bplatform-observable\b|\borigin\/[A-Za-z0-9._/-]+/ },
  { label: 'commit identifier', pattern: /\b[0-9a-f]{40}\b/i },
  { label: 'source-control command', pattern: /\bgit\s+(?:show|checkout|switch|branch|merge|rebase|commit|push|fetch|pull)\b/i },
];

export async function checkPortability(rootPath) {
  const files = [];
  await collect(resolve(rootPath), files);
  const findings = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const rule of forbidden) {
      const match = source.match(rule.pattern);
      if (match) {
        findings.push({
          file,
          label: rule.label,
          match: match[0],
        });
      }
    }
  }

  return { files: files.length, findings };
}

async function collect(path, files) {
  const pathStat = await stat(path);
  if (pathStat.isFile()) {
    if (checkedExtensions.has(extname(path))) {
      files.push(path);
    }
    return;
  }

  const entries = await readdir(path, { withFileTypes: true });
  for (const entry of entries) {
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) {
      await collect(child, files);
    } else if (entry.isFile() && checkedExtensions.has(extname(child))) {
      files.push(child);
    }
  }
}

async function main() {
  const rootPath = process.argv[2];
  if (!rootPath) {
    throw new Error('Usage: check-portability.mjs <skill-directory>');
  }
  const result = await checkPortability(rootPath);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.findings.length > 0) {
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
