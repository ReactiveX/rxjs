import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { approvedImportPaths } from './config.mjs';
import { createProvenance, validateCommit } from './provenance.mjs';
import { deriveTestUrls } from './inventory.mjs';
import { replaceDirectory } from './files.mjs';
import { runProcess } from './process.mjs';
import { harnessRoot, inventoryPath, provenancePath, upstreamRoot } from './paths.mjs';

async function checkoutPinnedWpt(config) {
  const importPaths = approvedImportPaths(config);
  const sparsePatterns = importPaths.map((importPath) =>
    importPath === config.wpt.testRoot ? `/${importPath}/` : `/${importPath}`
  );
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'rxjs-wpt-import-'));
  const checkoutRoot = path.join(temporaryRoot, 'wpt');
  await fs.mkdir(checkoutRoot);

  await runProcess('git', ['init', '--quiet'], { cwd: checkoutRoot });
  await runProcess('git', ['remote', 'add', 'origin', config.wpt.repository], { cwd: checkoutRoot });
  await runProcess('git', ['sparse-checkout', 'init', '--no-cone'], { cwd: checkoutRoot });
  await runProcess('git', ['sparse-checkout', 'set', '--no-cone', ...sparsePatterns], { cwd: checkoutRoot });
  await runProcess(
    'git',
    ['fetch', '--quiet', '--depth=1', '--filter=blob:none', 'origin', config.wpt.commit],
    { cwd: checkoutRoot }
  );
  await runProcess('git', ['checkout', '--quiet', '--detach', 'FETCH_HEAD'], { cwd: checkoutRoot });

  return { temporaryRoot, checkoutRoot };
}

async function readTreeEntries({ checkoutRoot, commit, importPaths }) {
  const { stdout } = await runProcess(
    'git',
    ['ls-tree', '-r', '-z', '--full-tree', commit, '--', ...importPaths],
    { cwd: checkoutRoot, capture: true }
  );

  const entries = [];
  for (const record of stdout.split('\0')) {
    if (!record) {
      continue;
    }
    const match = /^(?<mode>\d+) blob (?<gitBlob>[0-9a-f]{40})\t(?<path>.+)$/.exec(record);
    if (!match?.groups) {
      throw new Error(`Could not parse git ls-tree record: ${record}`);
    }
    entries.push(match.groups);
  }
  entries.sort((left, right) => left.path.localeCompare(right.path));
  return entries;
}

export async function assertCheckoutClean({ checkoutRoot, importPaths }) {
  const { stdout } = await runProcess(
    'git',
    ['status', '--porcelain=v1', '--untracked-files=all', '--', ...importPaths],
    { cwd: checkoutRoot, capture: true }
  );
  if (stdout.trim()) {
    throw new Error(
      `WPT checkout has uncommitted changes inside the approved import closure:\n${stdout.trim()}`
    );
  }
}

export async function importWpt({ config, commit, existingCheckout }) {
  const importPaths = approvedImportPaths(config);
  validateCommit(commit);
  if (commit !== config.wpt.commit) {
    throw new Error(
      `config.json pins ${config.wpt.commit}. Update the pin and review the realm allowlist before importing ${commit}.`
    );
  }

  let temporaryRoot;
  let checkoutRoot = existingCheckout;
  if (checkoutRoot) {
    const { stdout } = await runProcess('git', ['rev-parse', 'HEAD'], { cwd: checkoutRoot, capture: true });
    if (stdout.trim() !== commit) {
      throw new Error(`Existing checkout is at ${stdout.trim()}, expected ${commit}`);
    }
  } else {
    const checkout = await checkoutPinnedWpt(config);
    temporaryRoot = checkout.temporaryRoot;
    checkoutRoot = checkout.checkoutRoot;
  }

  const stagingRoot = await fs.mkdtemp(path.join(harnessRoot, '.upstream-import-'));
  try {
    await assertCheckoutClean({ checkoutRoot, importPaths });
    const entries = await readTreeEntries({
      checkoutRoot,
      commit,
      importPaths,
    });
    const provenance = await createProvenance({
      checkoutRoot,
      commit,
      importPaths,
      fileEntries: entries,
    });

    for (const entry of entries) {
      const targetPath = path.join(stagingRoot, entry.path);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(path.join(checkoutRoot, entry.path), targetPath);
      if (entry.mode === '100755') {
        await fs.chmod(targetPath, 0o755);
      }
    }

    await replaceDirectory(stagingRoot, upstreamRoot);
    await fs.writeFile(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
    await fs.writeFile(inventoryPath, `${JSON.stringify(deriveTestUrls(entries.map((entry) => entry.path)), null, 2)}\n`);

    return provenance;
  } finally {
    await fs.rm(stagingRoot, { recursive: true, force: true });
    if (temporaryRoot) {
      await fs.rm(temporaryRoot, { recursive: true, force: true });
    }
  }
}
