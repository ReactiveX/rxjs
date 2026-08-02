#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertNpmWebUrl, releasePackages, stagedPackagesVariable } from './release-config.mjs';
import { verifyCandidate } from './release-candidate.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [command, directory = '.release/candidate', outputFile = '.release/staged-release.json'] = process.argv.slice(2);
  const candidateRoot = path.resolve(root, directory);
  const outputPath = path.resolve(root, outputFile);
  if (command === 'publish') await stageCandidate(candidateRoot, outputPath);
  else if (command === 'comment') process.stdout.write(await renderStagingComment(outputPath, process.env[stagedPackagesVariable] ?? ''));
  else throw new Error('Usage: stage-release.mjs <publish|comment> [candidate-directory] [staged-result-file]');
}

async function stageCandidate(candidateRoot, outputPath) {
  const manifest = await verifyCandidate(candidateRoot, {
    expectedSourceCommit: process.env.RELEASE_EXPECTED_SOURCE_COMMIT,
  });
  const state = {
    schemaVersion: 1,
    version: manifest.version,
    channel: manifest.channel,
    sourceCommit: manifest.sourceCommit,
    status: 'staging',
    packages: [],
  };
  await persist();
  try {
    for (const expected of releasePackages) {
      const entry = manifest.packages.find(({ name }) => name === expected.name);
      const result = spawnSync('npm', ['stage', 'publish', path.join(candidateRoot, entry.filename), '--tag', manifest.channel, '--json'], {
        cwd: root,
        encoding: 'utf8',
        env: { ...process.env, NPM_CONFIG_PROVENANCE: 'true' },
      });
      if (result.status !== 0) throw new Error(`Staging ${entry.name} failed (${result.status}).\n${result.stdout}${result.stderr}`);
      const parsed = parseStageOutput(result.stdout);
      const stagedEntry = {
        name: entry.name,
        version: entry.version,
        distTag: manifest.channel,
        stageId: parsed.stageId,
        ...(parsed.url ? { url: assertNpmWebUrl(parsed.url, `${entry.name} staged-package URL`) } : {}),
        sha512: entry.sha512,
        integrity: entry.integrity,
        stagedDigestVerified: false,
      };
      state.packages.push(stagedEntry);
      await persist();
      stagedEntry.stagedSha512 = await downloadAndVerifyStage(parsed.stageId, entry);
      stagedEntry.stagedDigestVerified = true;
      await persist();
    }
    state.status = 'staged';
    await persist();
  } catch (error) {
    state.status = 'partial';
    state.error = error.message;
    await persist();
    throw error;
  }

  async function persist() {
    await writeFile(outputPath, `${JSON.stringify(state, null, 2)}\n`);
  }
}

async function downloadAndVerifyStage(stageId, entry) {
  const downloadRoot = await mkdtemp(path.join(tmpdir(), 'rxjs-npm-stage-download-'));
  try {
    const result = spawnSync('npm', ['stage', 'download', stageId], {
      cwd: downloadRoot,
      encoding: 'utf8',
      env: process.env,
    });
    if (result.status !== 0) {
      throw new Error(`Downloading npm stage ${stageId} failed (${result.status}).\n${result.stdout}${result.stderr}`);
    }
    return await verifyDownloadedStage(downloadRoot, entry);
  } finally {
    await rm(downloadRoot, { recursive: true, force: true });
  }
}

export async function verifyDownloadedStage(downloadRoot, entry) {
  const files = (await readdir(downloadRoot)).filter((file) => file.endsWith('.tgz'));
  if (files.length !== 1) throw new Error(`npm stage download produced ${files.length} tarballs; expected exactly one.`);
  const bytes = await readFile(path.join(downloadRoot, files[0]));
  const stagedSha512 = createHash('sha512').update(bytes).digest('hex');
  if (bytes.byteLength !== entry.size || stagedSha512 !== entry.sha512) {
    throw new Error(`${entry.name} npm-staged bytes do not match the qualified tarball. Reject every stage in this candidate.`);
  }
  return stagedSha512;
}

export function parseStageOutput(stdout) {
  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    parsed = null;
  }
  const values = parsed ? flatten(parsed) : [];
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const stageId =
    values.find(({ key, value }) => /^stage-?id$/i.test(key) && typeof value === 'string' && uuid.test(value))?.value ??
    values.find(({ key, value }) => /^id$/i.test(key) && typeof value === 'string' && uuid.test(value))?.value ??
    stdout.match(/\b(?:stage(?:\s+|[-_])?id)\s*[:=]\s*["']?([0-9a-f-]{36})/i)?.[1];
  if (!stageId || !uuid.test(stageId)) {
    throw new Error(`npm did not return a supported stage ID. Preserve this output and inspect npm staging:\n${stdout}`);
  }
  const returnedUrl = values.find(
    ({ key, value }) => /url|href|link/i.test(key) && typeof value === 'string' && value.startsWith('http')
  )?.value;
  let url;
  if (returnedUrl) {
    try {
      url = assertNpmWebUrl(returnedUrl, 'npm returned stage URL');
    } catch {
      // Registry/API links are not rendered. Stage IDs remain the supported fallback.
    }
  }
  return { stageId, ...(url ? { url } : {}) };
}

function flatten(value, key = '') {
  if (Array.isArray(value)) return value.flatMap((item) => flatten(item, key));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([childKey, child]) => flatten(child, childKey));
  return [{ key, value }];
}

export async function renderStagingComment(stagedResultPath, configuredUrl) {
  const state = JSON.parse(await readFile(stagedResultPath, 'utf8'));
  const stagedPackagesUrl = assertNpmWebUrl(configuredUrl, stagedPackagesVariable);
  const complete =
    state.status === 'staged' &&
    state.packages.length === releasePackages.length &&
    state.packages.every((entry, index) => entry.name === releasePackages[index].name && entry.stagedDigestVerified === true);
  const rows = state.packages
    .map(
      (entry, index) =>
        `| ${index + 1} | \`${entry.name}\` | \`${entry.version}\` | \`${entry.distTag}\` | \`${entry.stageId}\` | \`${entry.sha512}\` | ${
          entry.stagedDigestVerified ? 'verified' : '**not verified**'
        } |${entry.url ? ` [Open stage](${assertNpmWebUrl(entry.url, `${entry.name} stage URL`)}) |` : ' — |'}`
    )
    .join('\n');
  const command = complete ? 'approve' : 'reject';
  const commands = state.packages.map(({ name, stageId }) => `# ${name}\nnpm stage ${command} ${stageId}`).join('\n\n');
  return (
    `# ${complete ? 'npm approval required' : 'DO NOT APPROVE — reject partial staging'} for ${state.version}\n\n` +
    (complete
      ? `> [!CAUTION]\n> RxJS cannot be unpublished. Verify the package, version, channel, stage ID, and SHA-512 below before approving. Approve \`rxjs\` last.\n\n`
      : `> [!WARNING]\n> Staging or staged-digest verification did not complete. Approve nothing. Open npm and reject every stage for this candidate with TFA, including any stage missing from this receipt, then create a fresh candidate and version.\n\n`) +
    `[**Open npm Staged Packages**](${stagedPackagesUrl})\n\n` +
    `| Order | Package | Version | Dist-tag | Stage ID | Qualified and staged SHA-512 | Staged download | Direct stage |\n| ---: | --- | --- | --- | --- | --- | --- | --- |\n${rows}\n\n` +
    `## CLI fallback\n\n\`\`\`sh\n${commands}\n\`\`\`\n\n` +
    `Every command requires npm TFA. If any value differs from this comment, reject the stages and create a fresh candidate.\n`
  );
}
