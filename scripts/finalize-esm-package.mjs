#!/usr/bin/env node

import { readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const legacyDialectDirectories = ['browser', 'commonjs', 'webpack'];

export function finalizeEsmManifest(manifest, { browserConditions = false } = {}) {
  if (JSON.stringify(manifest.tshy?.dialects) !== JSON.stringify(['esm'])) {
    throw new Error(`${manifest.name} must configure tshy.dialects as ["esm"].`);
  }
  if (manifest.tshy?.esmDialects || manifest.tshy?.commonjsDialects) {
    throw new Error(`${manifest.name} must not generate target-specific distribution dialects.`);
  }

  const exports = {};
  for (const [subpath, value] of Object.entries(manifest.exports ?? {})) {
    if (typeof value === 'string') {
      exports[subpath] = value;
      continue;
    }

    const esmTarget = value.import;
    if (!esmTarget || typeof esmTarget !== 'object') {
      throw new Error(`${manifest.name} export ${subpath} is missing its generated ESM import target.`);
    }
    for (const target of Object.values(esmTarget)) {
      if (typeof target !== 'string' || !target.startsWith('./dist/esm/')) {
        throw new Error(`${manifest.name} export ${subpath} has a non-ESM target: ${String(target)}.`);
      }
    }

    exports[subpath] = {
      ...(browserConditions ? { browser: esmTarget, webpack: esmTarget } : {}),
      import: esmTarget,
      require: esmTarget,
    };
  }

  const finalized = { ...manifest, exports };
  delete finalized.main;
  delete finalized.types;
  return finalized;
}

export async function finalizeEsmPackage(packageRoot, options = {}) {
  const manifestPath = resolve(packageRoot, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const finalized = finalizeEsmManifest(manifest, options);

  await Promise.all(
    legacyDialectDirectories.map((directory) => rm(resolve(packageRoot, 'dist', directory), { recursive: true, force: true }))
  );
  await writeFile(manifestPath, `${JSON.stringify(finalized, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  finalizeEsmPackage(process.cwd(), { browserConditions: process.argv.includes('--browser') }).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
