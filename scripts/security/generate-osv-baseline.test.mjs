import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const script = fileURLToPath(new URL('./generate-osv-baseline.mjs', import.meta.url));
const reviewed = new Date().toISOString().slice(0, 10);
const expiry = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
const osv = {
  results: [{ packages: [{ package: { name: 'example', version: '1.0.0' }, vulnerabilities: [{ id: 'GHSA-aaaa-bbbb-cccc' }] }] }],
};
const audit = {
  advisories: { one: { module_name: 'example', findings: [{ version: '1.0.0', paths: ['apps__rxjs.dev>example'] }] } },
  metadata: { totalDependencies: 1 },
};

async function run(t, scan = osv, paths = audit, dates = [reviewed, expiry]) {
  const dir = await mkdtemp(join(tmpdir(), 'rxjs-baseline-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const out = join(dir, 'baseline.toml');
  await writeFile(join(dir, 'osv.json'), JSON.stringify(scan));
  await writeFile(join(dir, 'audit.json'), JSON.stringify(paths));
  await writeFile(out, 'original');
  const result = spawnSync(process.execPath, [script, join(dir, 'osv.json'), join(dir, 'audit.json'), out, ...dates], { encoding: 'utf8' });
  return { ...result, output: await readFile(out, 'utf8') };
}

test('generates a dated baseline from complete docs-only evidence', async (t) => {
  const result = await run(t);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.output, new RegExp(`reviewed=${reviewed}`));
  assert.match(result.output, new RegExp(`ignoreUntil = ${expiry}`));
});

test('rejects incomplete npm audit without replacing the baseline', async (t) => {
  const result = await run(t, osv, {});
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /incomplete npm audit/);
  assert.equal(result.output, 'original');
});

test('rejects incomplete OSV evidence', async (t) => {
  const result = await run(t, {});
  assert.notEqual(result.status, 0);
  assert.equal(result.output, 'original');
});

test('rejects release-reachable paths', async (t) => {
  const paths = structuredClone(audit);
  paths.advisories.one.findings[0].paths.push('.>example');
  const result = await run(t, osv, paths);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /release-reachable/);
  assert.equal(result.output, 'original');
});

test('rejects omitted, invalid, expired, future-review and overlong dates', async (t) => {
  const future = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
  const overlong = new Date(Date.now() + 100 * 86400000).toISOString().slice(0, 10);
  for (const dates of [[], ['2026-02-30', expiry], ['2026-08-03', '2026-10-31'], [future, expiry], [reviewed, overlong]]) {
    const result = await run(t, osv, audit, dates);
    assert.notEqual(result.status, 0);
    assert.equal(result.output, 'original');
  }
});

test('rejects OSV findings not covered by the docs-only path audit', async (t) => {
  const scan = structuredClone(osv);
  scan.results[0].packages[0].package.name = 'unreviewed';
  const result = await run(t, scan);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /outside the reviewed docs inventory/);
  assert.equal(result.output, 'original');
});
