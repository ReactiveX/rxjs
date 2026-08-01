import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
const cacheDirectory = await mkdtemp(join(tmpdir(), 'rxjs-migrate-npm-cache-'));
let output;
try {
  output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: new URL('../..', import.meta.url),
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: cacheDirectory },
  });
} finally {
  await rm(cacheDirectory, { recursive: true, force: true });
}
const [packResult] = JSON.parse(output);
const packedFiles = new Set(packResult.files.map(({ path }) => path));

for (const target of declaredPackageTargets(packageJson)) {
  assert.ok(packedFiles.has(target), `Declared package target is missing from the packed artifact: ${target}`);
}

assert.ok(packedFiles.has('skill/SKILL.md'), 'The canonical migration Skill must be included in the packed artifact.');
assert.ok(
  [...packedFiles].some((path) => path.startsWith('skill/references/')),
  'The packed Skill must include its references.'
);
assert.ok(
  [...packedFiles].some((path) => path.startsWith('skill/assets/')),
  'The packed Skill must include its assets.'
);
assert.deepEqual(Object.keys(packageJson.bin), ['rxjs-migrate', 'rxjs-migrate-skill']);
assert.ok(!Object.keys(packageJson.exports).includes('./mcp'), 'The rejected MCP subpath must not be exported.');
assert.ok(![...packedFiles].some((path) => /(^|\/)mcp(?:\.|\/)/i.test(path)), 'The packed artifact must not contain MCP files.');

function declaredPackageTargets(manifest) {
  const targets = new Set([manifest.main, manifest.types, ...Object.values(manifest.bin)]);
  collectExportTargets(manifest.exports, targets);
  return [...targets].filter(Boolean).map((target) => target.replace(/^\.\//, ''));
}

function collectExportTargets(value, targets) {
  if (typeof value === 'string') {
    targets.add(value);
    return;
  }
  for (const child of Object.values(value)) collectExportTargets(child, targets);
}
