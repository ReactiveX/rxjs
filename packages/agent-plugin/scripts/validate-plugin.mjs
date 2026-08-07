import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import { readProperties, validate } from 'skills-ref';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const expectedSkills = [
  'analyze-rxjs-performance',
  'debug-rxjs-7',
  'debug-rxjs-9',
  'design-rxjs-library-apis',
  'integrate-rxjs-frameworks',
  'migrate-rxjs-7-to-9',
  'optimize-rxjs-bundles',
  'review-rxjs-7',
  'review-rxjs-9',
  'write-rxjs-7',
  'write-rxjs-7-tests',
  'write-rxjs-9',
  'write-rxjs-9-tests',
];
const parse = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const plugin = await parse('plugin.json');
const mcp = await parse('mcp.json');
const pluginSchema = await parse('schemas/plugin.schema.json');
const mcpSchema = await parse('schemas/mcp.schema.json');
const migrationSurfaceCatalog = await parse('dist/migration-surface-catalog.json');
const knowledgeDigests = await parse('dist/knowledge-digests.json');
const ajv = new Ajv2020({ allErrors: true, strict: false });
const errors = [];
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
for (const [path, expected] of [
  ['schemas/plugin.schema.json', '6386f27c3d6e77d95f25cb9ab266a8c8d7cb5e0a16d04a7a7e0c230e52fff0d7'],
  ['schemas/mcp.schema.json', 'e93c2f47f1eb970ed94ff2a2ec0ae0939312bb42af758d6545546bd087fb0602'],
]) {
  const actual = sha256(await readFile(resolve(root, path)));
  if (actual !== expected) errors.push(`${path}: pinned Agent Plugins 1.0 schema digest changed (${actual})`);
}

for (const [name, schema, value] of [
  ['plugin.json', pluginSchema, plugin],
  ['mcp.json', mcpSchema, mcp],
]) {
  const check = ajv.compile(schema);
  if (!check(value)) errors.push(`${name}: ${ajv.errorsText(check.errors)}`);
}
if (plugin.name !== 'rxjs' || plugin.version !== '9.0.0-beta.1')
  errors.push('plugin identity/version is not the synchronized beta.1 identity');

if (
  migrationSurfaceCatalog.source?.version !== '7.8.2' ||
  migrationSurfaceCatalog.target?.version !== plugin.version ||
  migrationSurfaceCatalog.lifecyclePolicy?.defaultConstructor !== 'ColdObservable'
) {
  errors.push('migration surface catalog must pin RxJS 7.8.2, target beta.1, and default to ColdObservable');
}
if (
  migrationSurfaceCatalog.counts?.operators !== 114 ||
  migrationSurfaceCatalog.counts?.total !== migrationSurfaceCatalog.surfaces?.length ||
  migrationSurfaceCatalog.counts?.mechanicallyProved !== 10
) {
  errors.push('migration surface catalog does not have the expected complete/operator/mechanical coverage');
}
for (const entrypoint of ['rxjs', 'rxjs/operators', 'rxjs/ajax', 'rxjs/fetch', 'rxjs/webSocket', 'rxjs/testing']) {
  if (!migrationSurfaceCatalog.source?.entrypoints?.includes(entrypoint)) {
    errors.push(`migration surface catalog is missing the ${entrypoint} entrypoint`);
  }
}
for (const surface of migrationSurfaceCatalog.surfaces ?? []) {
  if (!surface.migration?.disposition || !surface.migration?.coldTarget || !surface.migration?.platformTarget) {
    errors.push(`migration surface ${surface.id ?? '<unknown>'} lacks a complete disposition or lifecycle target`);
  }
}
const catalogBytes = await readFile(resolve(root, 'dist/migration-surface-catalog.json'));
if (
  knowledgeDigests.migrationSurfaceCatalog?.sha256 !== sha256(catalogBytes) ||
  knowledgeDigests.migrationSurfaceCatalog?.bytes !== catalogBytes.byteLength
) {
  errors.push('migration surface catalog does not match its generated knowledge digest');
}
const server = mcp.mcpServers?.['rxjs-migration'];
if (server?.command !== 'node' || server?.cwd !== '${PLUGIN_ROOT}' || server?.args?.[0] !== '${PLUGIN_ROOT}/dist/mcp-server.cjs') {
  errors.push('mcp.json must start the prebuilt bundle from PLUGIN_ROOT without a shell or installer');
}

const actualSkills = (await readdir(resolve(root, 'skills'), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
if (JSON.stringify(actualSkills) !== JSON.stringify(expectedSkills)) errors.push(`unexpected skill set: ${actualSkills.join(', ')}`);

for (const name of actualSkills) {
  const skillRoot = resolve(root, 'skills', name);
  const problems = await validate(skillRoot);
  if (problems.length) errors.push(`${name}: ${problems.map(String).join('; ')}`);
  const properties = await readProperties(skillRoot);
  if (properties.name !== name) errors.push(`${name}: frontmatter name must equal its directory`);
  const markdown = await readFile(resolve(skillRoot, 'SKILL.md'), 'utf8');
  const linkedReferences = new Set();
  for (const match of markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    if (!match[1].startsWith('references/')) continue;
    linkedReferences.add(match[1]);
    const target = resolve(skillRoot, match[1]);
    const rel = relative(skillRoot, target);
    if (rel.startsWith(`..${sep}`) || rel === '..') errors.push(`${name}: reference escapes the skill: ${match[1]}`);
    else await lstat(target).catch(() => errors.push(`${name}: missing reference ${match[1]}`));
  }
  const references = (await readdir(resolve(skillRoot, 'references'), { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => `references/${entry.name}`)
    .sort();
  if (references.length < 4) errors.push(`${name}: expected focused progressive-disclosure references, found ${references.length}`);
  for (const reference of references) {
    if (!linkedReferences.has(reference)) errors.push(`${name}: unlinked reference ${reference}`);
    if (reference.endsWith('/version-catalog.md')) errors.push(`${name}: duplicated version-catalog reference is prohibited`);
  }
}

for (const [path, requiredText] of [
  ['skills/write-rxjs-7/references/operator-concurrency.md', 'safest default'],
  ['skills/write-rxjs-9/references/fundamentals-and-lifecycle.md', 'Prefer platform methods'],
  ['skills/write-rxjs-9/references/custom-operators.md', 'Why `Symbol.for()` is dangerous'],
  ['skills/write-rxjs-7/references/synchronous-side-effects-and-feedback.md', 'Prime only after'],
  ['skills/write-rxjs-9/references/synchronous-side-effects-and-feedback.md', 'Prime only after'],
  ['skills/write-rxjs-9-tests/SKILL.md', 'Declare every marble string together'],
  ['skills/write-rxjs-7-tests/references/marbles-and-subscriptions.md', '--- 10s ---a'],
  ['skills/write-rxjs-9-tests/references/marbles-and-assertions.md', '--- 10s ---a'],
  ['skills/design-rxjs-library-apis/references/controller-api-shapes.md', 'Readonly tuple'],
  ['skills/integrate-rxjs-frameworks/references/angular-22.md', '^6.5.3 || ^7.4.0'],
  ['skills/optimize-rxjs-bundles/references/rxjs-9-platform-methods-and-symbol-modules.md', 'Prefer the platform surface'],
  ['skills/debug-rxjs-7/SKILL.md', 'A call stack is one synchronous slice'],
  ['skills/debug-rxjs-7/references/temporary-tap-instrumentation.md', 'Re-run with the probe disabled and then removed'],
  ['skills/debug-rxjs-7/references/call-stacks-and-error-signatures.md', 'reportUnhandledError'],
  ['skills/debug-rxjs-9/SKILL.md', 'logging itself takes time'],
  ['skills/debug-rxjs-9/references/temporary-inspect-and-tap-instrumentation.md', 'ColdObservable'],
  ['skills/debug-rxjs-9/references/call-stacks-and-error-signatures.md', 'Platform `subscribe()` returns'],
]) {
  const contents = await readFile(resolve(root, path), 'utf8');
  if (!contents.includes(requiredText)) errors.push(`${path}: missing required expert guidance: ${requiredText}`);
}

for (const skillName of ['write-rxjs-7-tests', 'write-rxjs-9-tests']) {
  const referenceRoot = resolve(root, 'skills', skillName, 'references');
  for (const entry of await readdir(referenceRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const contents = await readFile(resolve(referenceRoot, entry.name), 'utf8');
    if (/(?:cold|hot|observable)\(\s*['"]/.test(contents)) {
      errors.push(`${skillName}/${entry.name}: declare marble strings as aligned variables before creating sources`);
    }
    if (/\[[^\]\n]*['"][^'"\n]*[\^!][^'"\n]*['"][^\]\n]*,\s*['"]/.test(contents)) {
      errors.push(`${skillName}/${entry.name}: put each marble diagram in an array on its own line`);
    }
  }
}

const packageReal = await realpath(root);
async function inspect(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = resolve(path, entry.name);
    if (entry.isSymbolicLink()) {
      const target = await realpath(child);
      if (target !== packageReal && !target.startsWith(`${packageReal}${sep}`))
        errors.push(`symlink escapes package: ${relative(root, child)}`);
    } else if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'claude-adapter') await inspect(child);
  }
}
await inspect(root);

const adapterRoot = resolve(root, 'claude-adapter');
const adapterManifest = await readFile(resolve(adapterRoot, '.claude-plugin/plugin.json'), 'utf8')
  .then(JSON.parse)
  .catch(() => null);
const adapterMcp = await readFile(resolve(adapterRoot, '.mcp.json'), 'utf8')
  .then(JSON.parse)
  .catch(() => null);
const adapterDigests = await readFile(resolve(adapterRoot, 'artifact-digests.json'), 'utf8')
  .then(JSON.parse)
  .catch(() => null);
if (adapterManifest?.name !== plugin.name || adapterManifest?.version !== plugin.version)
  errors.push('Claude adapter identity/version differs from plugin.json');
if (adapterMcp?.mcpServers?.['rxjs-migration']?.args?.[0] !== '${CLAUDE_PLUGIN_ROOT}/dist/mcp-server.cjs') {
  errors.push('Claude adapter MCP does not use CLAUDE_PLUGIN_ROOT and the prebuilt bundle');
}
if (adapterDigests?.version !== plugin.version) errors.push('Claude adapter digest lock has the wrong version');
for (const [path, descriptor] of Object.entries(adapterDigests?.artifacts ?? {})) {
  const [universal, adapted] = await Promise.all([readFile(resolve(root, path)), readFile(resolve(adapterRoot, path))]);
  const digest = sha256(universal);
  if (digest !== descriptor.sha256 || digest !== sha256(adapted)) errors.push(`Claude adapter digest mismatch: ${path}`);
}
const claudeVersion = spawnSync('claude', ['--version'], { encoding: 'utf8' });
if (claudeVersion.status === 0) {
  const claudeValidation = spawnSync('claude', ['plugin', 'validate', adapterRoot], { encoding: 'utf8' });
  if (claudeValidation.status !== 0) errors.push(`claude plugin validate failed: ${claudeValidation.stderr || claudeValidation.stdout}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated Agent Plugins 1.0 manifests and ${actualSkills.length} Agent Skills.`);
}
