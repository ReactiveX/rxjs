import fs from 'node:fs/promises';
import path from 'node:path';
import { approvedImportPaths } from './config.mjs';
import { verifyRequiredSupportFiles } from './dependency-closure.mjs';
import { gitBlobSha1, hashBuffer } from './hash.mjs';
import { deriveTestUrls } from './inventory.mjs';
import { listFiles } from './files.mjs';
import { verifyRealmPatterns } from './realm-patterns.mjs';

export function validateCommit(commit) {
  if (!/^[0-9a-f]{40}$/.test(commit)) {
    throw new Error(`WPT commit must be a lowercase 40-character SHA: ${commit}`);
  }
}

export function validateUpstreamPath(filePath, importPaths) {
  if (
    filePath.length === 0 ||
    path.posix.isAbsolute(filePath) ||
    filePath.includes('\\') ||
    filePath.split('/').includes('..')
  ) {
    throw new Error(`Unsafe WPT path: ${filePath}`);
  }

  const included = importPaths.some((importPath) => filePath === importPath || filePath.startsWith(`${importPath}/`));
  if (!included) {
    throw new Error(`WPT path is outside the approved import closure: ${filePath}`);
  }
}

export async function createProvenance({ checkoutRoot, commit, importPaths, fileEntries }) {
  const files = [];
  for (const entry of fileEntries) {
    validateUpstreamPath(entry.path, importPaths);
    if (entry.mode !== '100644' && entry.mode !== '100755') {
      throw new Error(`Unsupported Git mode ${entry.mode} for ${entry.path}`);
    }

    const contents = await fs.readFile(path.join(checkoutRoot, entry.path));
    const actualGitBlob = gitBlobSha1(contents);
    if (actualGitBlob !== entry.gitBlob) {
      throw new Error(`Git blob mismatch while importing ${entry.path}`);
    }

    files.push({
      path: entry.path,
      mode: entry.mode,
      gitBlob: entry.gitBlob,
      sha256: hashBuffer('sha256', contents),
      bytes: contents.byteLength,
    });
  }

  return {
    schemaVersion: 1,
    repository: 'https://github.com/web-platform-tests/wpt.git',
    commit,
    imports: [...importPaths],
    files,
  };
}

export async function verifyVendoredImport({
  config,
  provenance,
  inventory,
  upstreamRoot,
  expectationsRoot,
}) {
  const problems = [];
  let approvedImports = [];
  try {
    approvedImports = approvedImportPaths(config);
  } catch (error) {
    problems.push(error.message);
  }

  try {
    validateCommit(provenance.commit);
  } catch (error) {
    problems.push(error.message);
  }

  if (provenance.commit !== config.wpt.commit) {
    problems.push(`config pins ${config.wpt.commit}, but provenance records ${provenance.commit}`);
  }

  if (JSON.stringify(provenance.imports) !== JSON.stringify(approvedImports)) {
    problems.push('provenance import closure differs from config.json');
  }

  const actualFiles = await listFiles(upstreamRoot);
  const expectedFiles = provenance.files.map((entry) => entry.path);
  if (JSON.stringify(actualFiles) !== JSON.stringify([...expectedFiles].sort())) {
    const expectedSet = new Set(expectedFiles);
    const actualSet = new Set(actualFiles);
    for (const filePath of actualFiles) {
      if (!expectedSet.has(filePath)) {
        problems.push(`unrecorded vendored file: ${filePath}`);
      }
    }
    for (const filePath of expectedFiles) {
      if (!actualSet.has(filePath)) {
        problems.push(`missing vendored file: ${filePath}`);
      }
    }
  }

  const realmFiles = new Map();
  for (const entry of provenance.files) {
    const absolutePath = path.join(upstreamRoot, entry.path);
    let contents;
    try {
      contents = await fs.readFile(absolutePath);
    } catch {
      continue;
    }

    if (contents.byteLength !== entry.bytes) {
      problems.push(`${entry.path}: expected ${entry.bytes} bytes, found ${contents.byteLength}`);
    }
    if (gitBlobSha1(contents) !== entry.gitBlob) {
      problems.push(`${entry.path}: Git blob hash differs from pinned WPT`);
    }
    if (hashBuffer('sha256', contents) !== entry.sha256) {
      problems.push(`${entry.path}: SHA-256 differs from provenance`);
    }

    if (
      entry.path.startsWith('dom/observable/tentative/') &&
      (entry.path.endsWith('.js') || entry.path.endsWith('.html'))
    ) {
      realmFiles.set(entry.path, contents.toString('utf8'));
    }
  }

  problems.push(...verifyRealmPatterns(realmFiles, config.reviewedIframeFiles));
  if (config.wpt.verifyDependencyClosure === true) {
    problems.push(...verifyRequiredSupportFiles(realmFiles, config.wpt.supportFiles));
  }

  const derivedInventory = deriveTestUrls(expectedFiles);
  if (JSON.stringify(inventory) !== JSON.stringify(derivedInventory)) {
    problems.push('expected-test-urls.json does not match the pinned source inventory');
  }

  for (const expectationFile of await listFiles(expectationsRoot)) {
    const contents = await fs.readFile(path.join(expectationsRoot, expectationFile), 'utf8');
    if (
      contents.includes(config.attestation.namePrefix) ||
      contents.includes(config.attestation.functionKey) ||
      contents.includes(config.attestation.installationKey)
    ) {
      problems.push(`${expectationFile}: expectation metadata may not mention attestation`);
    }
  }

  return problems;
}
