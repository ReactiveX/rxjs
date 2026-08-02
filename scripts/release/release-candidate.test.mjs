import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { verifyCandidate } from './release-candidate.mjs';
import { releasePackages } from './release-config.mjs';

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
      JSON.stringify({ schemaVersion: 1, sourceCommit: 'a'.repeat(40), version: '9.0.0-beta.2', channel: 'next', packages })
    );
    await verifyCandidate(root);
    await writeFile(path.join(root, packages[0].filename), 'changed');
    await assert.rejects(() => verifyCandidate(root), /size changed|SHA-256 changed/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
