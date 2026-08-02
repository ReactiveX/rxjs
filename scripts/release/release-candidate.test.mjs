import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { compareCandidates, verifyCandidate } from './release-candidate.mjs';
import { releasePackages, releaseToolchain } from './release-config.mjs';

test('verifies every byte and the fixed approval order', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'rxjs-candidate-test-'));
  try {
    const packages = [];
    for (const [index, { name }] of releasePackages.entries()) {
      const filename = `package-${index}.tgz`;
      const bytes = Buffer.from(`exact bytes ${name}`);
      await writeFile(path.join(root, filename), bytes);
      packages.push({
        name,
        version: '9.0.0-beta.2',
        filename,
        size: bytes.byteLength,
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
        sourceCommit: 'a'.repeat(40),
        authorizingPullRequest: 123,
        version: '9.0.0-beta.2',
        channel: 'next',
        toolchain: releaseToolchain,
        build: { id: 'a', runner: 'ubuntu-24.04' },
        reproducible: false,
        independentBuilds: [],
        packages,
      })
    );
    const ambientGitHubSha = process.env.GITHUB_SHA;
    process.env.GITHUB_SHA = 'b'.repeat(40);
    try {
      await verifyCandidate(root);
    } finally {
      if (ambientGitHubSha === undefined) delete process.env.GITHUB_SHA;
      else process.env.GITHUB_SHA = ambientGitHubSha;
    }
    await verifyCandidate(root, { expectedSourceCommit: 'a'.repeat(40) });
    await assert.rejects(() => verifyCandidate(root, { expectedSourceCommit: 'b'.repeat(40) }), /Candidate source commit changed/);
    await writeFile(path.join(root, packages[0].filename), 'changed');
    await assert.rejects(() => verifyCandidate(root), /size changed|SHA-256 changed/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('requires two byte-identical independent builds and rejects inventory drift', async () => {
  const first = await mkdtemp(path.join(tmpdir(), 'rxjs-candidate-first-'));
  const second = await mkdtemp(path.join(tmpdir(), 'rxjs-candidate-second-'));
  const output = await mkdtemp(path.join(tmpdir(), 'rxjs-candidate-output-'));
  try {
    for (const [directory, id] of [
      [first, 'a'],
      [second, 'b'],
    ]) {
      const packages = [];
      for (const [index, { name }] of releasePackages.entries()) {
        const filename = `package-${index}.tgz`;
        const bytes = Buffer.from(`exact bytes ${name}`);
        await writeFile(path.join(directory, filename), bytes);
        packages.push({
          name,
          version: '9.0.0-beta.2',
          filename,
          size: bytes.length,
          sha256: createHash('sha256').update(bytes).digest('hex'),
          sha512: createHash('sha512').update(bytes).digest('hex'),
          integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
          contents: [],
        });
      }
      await writeFile(
        path.join(directory, 'release-manifest.json'),
        JSON.stringify({
          schemaVersion: 2,
          sourceCommit: 'a'.repeat(40),
          authorizingPullRequest: 123,
          version: '9.0.0-beta.2',
          channel: 'next',
          toolchain: releaseToolchain,
          build: { id, runner: 'ubuntu-24.04' },
          reproducible: false,
          independentBuilds: [],
          packages,
        })
      );
    }
    const manifest = await compareCandidates(first, second, output);
    assert.equal(manifest.reproducible, true);
    assert.deepEqual(
      manifest.independentBuilds.map(({ id }) => id),
      ['a', 'b']
    );
    await writeFile(path.join(second, 'package-0.tgz'), 'changed');
    await assert.rejects(() => compareCandidates(first, second, output), /size changed|SHA-256 changed|byte-identical/);
    await writeFile(path.join(first, 'unexpected'), 'unexpected');
    await assert.rejects(() => verifyCandidate(first), /missing or additional files/);
  } finally {
    await Promise.all([first, second, output].map((directory) => rm(directory, { recursive: true, force: true })));
  }
});
