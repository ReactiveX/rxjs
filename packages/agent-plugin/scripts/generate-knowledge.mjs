import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(packageRoot, '../..');
const skillsRoot = resolve(packageRoot, 'skills');
const outputPath = resolve(packageRoot, 'dist/knowledge-digests.json');
const skillNames = [
  'analyze-rxjs-performance',
  'debug-rxjs',
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

const sourcePaths = [
  'packages/rxjs/package.json',
  'packages/rxjs/src/index.ts',
  'packages/rxjs/MIGRATION.md',
  'packages/rxjs/docs/MIGRATION_EVIDENCE_LEDGER.md',
  'packages/agent-plugin/package.json',
  'packages/agent-plugin/src/migration/capabilities.ts',
  'packages/agent-plugin/src/migration/version.ts',
];

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const sources = Object.fromEntries(
  await Promise.all(
    sourcePaths.map(async (path) => {
      const contents = await readFile(resolve(repositoryRoot, path), 'utf8');
      return [path, { sha256: sha256(contents), bytes: Buffer.byteLength(contents) }];
    })
  )
);

const rxjsManifest = JSON.parse(await readFile(resolve(repositoryRoot, 'packages/rxjs/package.json'), 'utf8'));
const pluginManifest = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
const exportEntries = Object.entries(rxjsManifest.tshy.exports)
  .filter(([name]) => name !== './package.json')
  .map(([name, source]) => ({ name: name === '.' ? 'rxjs' : `rxjs/${name.slice(2)}`, source }))
  .sort((left, right) => left.name.localeCompare(right.name));
const capabilitySource = await readFile(resolve(packageRoot, 'src/migration/capabilities.ts'), 'utf8');
const exactOperatorBlock = capabilitySource.match(/const exactOperators = \[([\s\S]*?)\] as const;/)?.[1] ?? '';
const exactCapabilityIds = [...exactOperatorBlock.matchAll(/'([^']+)'/g)].map(([, name]) => `operator.${moduleName(name)}`);
const declaredCapabilityIds = [...capabilitySource.matchAll(/id:\s*'([^']+)'/g)].map((match) => match[1]);
const capabilityIds = [...exactCapabilityIds, ...declaredCapabilityIds];

function moduleName(name) {
  return name.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
}

const generatedReferences = {
  'skills/write-rxjs-9/references/api-surface.md': `# RxJS 9 public API surface

> Generated from the \`rxjs@9.0.0-beta.1\` export map. Do not edit by hand.

Use this list only to verify a public import path. Read the authored pattern and
lifecycle references to choose an API; presence here is not a recommendation.

${exportEntries.map(({ name, source }) => `- \`${name}\` — source \`${source}\``).join('\n')}
`,
  'skills/migrate-rxjs-7-to-9/references/migration-capabilities.md': `# Generated migration capabilities

> Generated from the beta.1 deterministic capability registry. Do not edit by hand.

The migration MCP currently proves these bounded rewrites:

${capabilityIds.map((id) => `- \`${id}\``).join('\n')}

Call \`migration_capabilities\` for the authoritative preconditions, arity,
argument adapter, evidence classification, and review notes. Anything absent
from that response requires an authored migration decision, not an inferred
mechanical rewrite.
`,
  'skills/integrate-rxjs-frameworks/references/framework-versions.md': `# Validated framework versions

> Generated from the plugin's exact development pins. Do not edit by hand.

- Angular: \`${pluginManifest.devDependencies['@angular/core']}\`
- React: \`${pluginManifest.devDependencies.react}\`
- Vue: \`${pluginManifest.devDependencies.vue}\`
- Svelte: \`${pluginManifest.devDependencies.svelte}\`
- SolidJS: \`${pluginManifest.devDependencies['solid-js']}\`
- RxJS 9 examples: \`${rxjsManifest.version}\`
- RxJS 7 examples: \`${pluginManifest.devDependencies.rxjs7.replace('npm:rxjs@', '')}\`

Angular 22.1 declares RxJS \`^6.5.3 || ^7.4.0\`; successful local type-checking
does not create an official Angular/RxJS 9 compatibility claim.
`,
  'skills/optimize-rxjs-bundles/references/entry-points.md': `# RxJS 9 bundle entry points

> Generated from the \`rxjs@9.0.0-beta.1\` export map. Do not edit by hand.

The root is intentionally operator-free. Import each required capability from
its exact subpath and confirm the resulting module graph with the consumer's
bundler.

${exportEntries.map(({ name }) => `- \`${name}\``).join('\n')}
`,
};

await rm(resolve(packageRoot, 'dist'), { recursive: true, force: true });
await Promise.all(skillNames.map((name) => rm(resolve(skillsRoot, name, 'references/version-catalog.md'), { force: true })));
await Promise.all(
  Object.entries(generatedReferences).map(async ([path, contents]) => {
    const target = resolve(packageRoot, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents);
  })
);

const manifest = {
  schemaVersion: 1,
  package: '@rxjs/agent-plugin',
  version: '9.0.0-beta.1',
  rxjs7: { version: '7.8.2', commit: 'e5351d02e225e275ac0e497c7b66eaa5f0c88791' },
  rxjs9: { version: '9.0.0-beta.1' },
  generatedReferences: Object.fromEntries(
    Object.entries(generatedReferences).map(([path, contents]) => [path, { sha256: sha256(contents), bytes: Buffer.byteLength(contents) }])
  ),
  sources,
};
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
