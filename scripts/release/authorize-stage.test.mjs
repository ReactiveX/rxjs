import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import fc from 'fast-check';
import { validateDownloadedCandidate, validateStageAuthorization } from './authorize-stage.mjs';
import { releasePackages, releaseToolchain } from './release-config.mjs';

const digest = 'a'.repeat(128);
const head = 'b'.repeat(40);
const now = Date.parse('2026-08-02T12:00:00Z');

function valid() {
  return {
    run: {
      id: 123,
      name: 'Qualify RxJS 9 release',
      event: 'push',
      head_branch: 'master',
      head_sha: head,
      conclusion: 'success',
      created_at: '2026-08-02T00:00:00Z',
    },
    artifact: { name: 'rxjs-release-candidate-123', expired: false },
    currentHead: head,
    actor: 'benlesh',
    version: '9.0.0-beta.1',
    manifest: { sourceCommit: head, version: '9.0.0-beta.1', reproducible: true, independentBuilds: [{}, {}] },
    manifestSha512: digest,
    replayed: false,
    now,
  };
}

test('rejects every wrong manual-stage authorization dimension', () => {
  validateStageAuthorization(valid());
  for (const mutate of [
    (value) => (value.actor = 'attacker'),
    (value) => (value.run.id = '123'),
    (value) => (value.run.name = 'CI'),
    (value) => (value.run.event = 'workflow_dispatch'),
    (value) => (value.run.head_branch = 'feature'),
    (value) => (value.run.conclusion = 'failure'),
    (value) => (value.run.head_sha = 'c'.repeat(40)),
    (value) => (value.currentHead = 'c'.repeat(40)),
    (value) => (value.manifest.sourceCommit = 'c'.repeat(40)),
    (value) => (value.manifest.version = '9.0.0-beta.2'),
    (value) => (value.manifestSha512 = 'wrong'),
    (value) => (value.artifact.expired = true),
    (value) => (value.artifact.name = 'other'),
    (value) => (value.manifest.reproducible = false),
    (value) => (value.manifest.independentBuilds = [{}]),
    (value) => (value.run.created_at = '2026-06-01T00:00:00Z'),
    (value) => (value.replayed = true),
  ]) {
    const value = structuredClone(valid());
    mutate(value);
    assert.throws(() => validateStageAuthorization(value));
  }
});

test('manifest authorization is exact for arbitrary typed versions and digests', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'rxjs-stage-auth-'));
  try {
    const packages = [];
    for (const [index, { name }] of releasePackages.entries()) {
      const filename = `${index}.tgz`;
      const bytes = Buffer.from(name);
      await writeFile(path.join(root, filename), bytes);
      packages.push({
        name,
        version: '9.0.0-beta.1',
        filename,
        size: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        sha512: createHash('sha512').update(bytes).digest('hex'),
        integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
        contents: [],
      });
    }
    await writeFile(
      path.join(root, 'release-manifest.json'),
      JSON.stringify({
        schemaVersion: 2,
        sourceCommit: head,
        authorizingPullRequest: 123,
        version: '9.0.0-beta.1',
        channel: 'next',
        toolchain: releaseToolchain,
        build: { id: 'a', runner: 'ubuntu-24.04' },
        reproducible: true,
        independentBuilds: [{}, {}],
        packages,
      })
    );
    const bytes = await import('node:fs/promises').then(({ readFile }) => readFile(path.join(root, 'release-manifest.json')));
    const actual = createHash('sha512').update(bytes).digest('hex');
    await validateDownloadedCandidate(root, '9.0.0-beta.1', actual);
    await assert.rejects(() => validateDownloadedCandidate(root, '9.0.0-beta.1', 'b'.repeat(128)), /SHA-512/);
    await fc.assert(
      fc.asyncProperty(
        fc.string().filter((value) => value !== '9.0.0-beta.1'),
        async (value) => {
          await assert.rejects(() => validateDownloadedCandidate(root, value, actual), /Typed version/);
        }
      ),
      { numRuns: 50 }
    );
    await writeFile(path.join(root, packages[0].filename), 'changed bytes');
    await assert.rejects(() => validateDownloadedCandidate(root, '9.0.0-beta.1', actual), /size changed|SHA-256 changed/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
