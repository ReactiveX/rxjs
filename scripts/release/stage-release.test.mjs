import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parseStageOutput, renderStagingComment, verifyDownloadedStage } from './stage-release.mjs';
import { releasePackages } from './release-config.mjs';

test('extracts supported stage IDs and validates returned npm links', () => {
  const stageId = '123e4567-e89b-42d3-a456-426614174000';
  assert.deepEqual(parseStageOutput(`{"id":"rxjs@9.0.0","stageId":"${stageId}","url":"https://www.npmjs.com/example"}`), {
    stageId,
    url: 'https://www.npmjs.com/example',
  });
  assert.deepEqual(parseStageOutput(`{"stageId":"${stageId}","url":"https://registry.npmjs.org/internal"}`), {
    stageId,
  });
  assert.throws(() => parseStageOutput('{"ok":true}'), /supported stage ID/);
});

test('requires the downloaded npm stage to match the qualified bytes', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'rxjs-stage-download-'));
  try {
    const bytes = Buffer.from('exact staged tarball');
    const sha512 = createHash('sha512').update(bytes).digest('hex');
    await writeFile(path.join(root, 'download.tgz'), bytes);
    assert.equal(await verifyDownloadedStage(root, { name: 'rxjs', size: bytes.byteLength, sha512 }), sha512);
    await writeFile(path.join(root, 'download.tgz'), 'changed');
    await assert.rejects(() => verifyDownloadedStage(root, { name: 'rxjs', size: bytes.byteLength, sha512 }), /do not match/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('renders the exact approval order, hashes, links, and CLI fallbacks', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'rxjs-stage-comment-'));
  try {
    const file = path.join(root, 'state.json');
    await writeFile(
      file,
      JSON.stringify({
        status: 'staged',
        version: '9.0.0-beta.3',
        packages: releasePackages.map(({ name }, index) => ({
          name,
          version: '9.0.0-beta.3',
          distTag: 'next',
          stageId: `stage_${index}`,
          sha512: `digest_${index}`,
          stagedDigestVerified: true,
        })),
      })
    );
    const comment = await renderStagingComment(file, 'https://www.npmjs.com/settings/example/packages');
    assert.ok(comment.indexOf('`@rxjs/observable-polyfill`') < comment.indexOf('| `rxjs` |'));
    assert.match(comment, /npm stage approve stage_3/);
    assert.match(comment, /Approve `rxjs` last/);
    assert.match(comment, /Qualified and staged SHA-512/);
    await assert.rejects(() => renderStagingComment(file, 'https://npmjs.com/not-exact'), /exact https:\/\/www\.npmjs\.com/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('turns a partial staging receipt into rejection instructions', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'rxjs-stage-reject-'));
  try {
    const file = path.join(root, 'state.json');
    await writeFile(
      file,
      JSON.stringify({
        status: 'partial',
        version: '9.0.0-beta.3',
        packages: [
          {
            name: '@rxjs/observable-polyfill',
            version: '9.0.0-beta.3',
            distTag: 'next',
            stageId: 'stage_polyfill',
            sha512: 'abc',
          },
        ],
      })
    );
    const comment = await renderStagingComment(file, 'https://www.npmjs.com/settings/example/packages');
    assert.match(comment, /DO NOT APPROVE/);
    assert.match(comment, /npm stage reject stage_polyfill/);
    assert.doesNotMatch(comment, /npm stage approve/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
