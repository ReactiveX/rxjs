import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(packageRoot, '../..');
const skillsRoot = resolve(packageRoot, 'skills');
const outputPath = resolve(packageRoot, 'dist/knowledge-digests.json');
const surfaceCatalogPath = resolve(packageRoot, 'dist/migration-surface-catalog.json');
const skillNames = [
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

const sourcePaths = [
  'packages/rxjs/package.json',
  'packages/rxjs/src/index.ts',
  'packages/rxjs/MIGRATION.md',
  'packages/rxjs/docs/MIGRATION_EVIDENCE_LEDGER.md',
  'packages/rxjs/test/ported/capability-registry.json',
  'packages/rxjs/test/ported/unsupported-surface-catalog.json',
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
const mechanicalCapabilityByName = new Map(
  [...capabilitySource.matchAll(/(?:legacyName,|legacyName:\s*'([^']+)')/g)].map((match) => {
    const legacyName = match[1];
    return legacyName ? [legacyName, `operator.${moduleName(legacyName)}`] : ['', ''];
  })
);
for (const name of [...exactOperatorBlock.matchAll(/'([^']+)'/g)].map((match) => match[1])) {
  mechanicalCapabilityByName.set(name, `operator.${moduleName(name)}`);
}

const parityRegistry = JSON.parse(
  await readFile(resolve(repositoryRoot, 'packages/rxjs/test/ported/capability-registry.json'), 'utf8')
);
const unsupportedSurfaceCatalog = JSON.parse(
  await readFile(resolve(repositoryRoot, 'packages/rxjs/test/ported/unsupported-surface-catalog.json'), 'utf8')
);
const rxjs7TypesRoot = resolve(packageRoot, 'node_modules/rxjs7/dist/types');
const declarationEntrypoints = {
  rxjs: 'index.d.ts',
  'rxjs/operators': 'operators/index.d.ts',
  'rxjs/ajax': 'ajax/index.d.ts',
  'rxjs/fetch': 'fetch/index.d.ts',
  'rxjs/webSocket': 'webSocket/index.d.ts',
  'rxjs/testing': 'testing/index.d.ts',
};
const declarationSources = Object.fromEntries(
  await Promise.all(
    Object.entries(declarationEntrypoints).map(async ([entrypoint, path]) => [
      entrypoint,
      await readFile(resolve(rxjs7TypesRoot, path), 'utf8'),
    ])
  )
);
const publicTypesSource = await readFile(resolve(rxjs7TypesRoot, 'internal/types.d.ts'), 'utf8');
const surfaceCatalog = await buildSurfaceCatalog({
  declarationSources,
  publicTypesSource,
  parityRegistry,
  unsupportedSurfaceCatalog,
  mechanicalCapabilityByName,
  rxjs7TypesRoot,
});

function moduleName(name) {
  return name.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`).replace(/^-/, '');
}

const generatedReferences = {
  'skills/write-rxjs-9/references/api-surface.md': `# RxJS 9 public API surface

> Generated from the \`rxjs@9.0.0-beta.1\` export map. Do not edit by hand.

Use this list only to verify a public import path. Read the authored pattern and
lifecycle references to choose an API; presence here is not a recommendation.

${exportEntries.map(({ name, source }) => `- \`${name}\` — source \`${source}\``).join('\n')}
`,
  'skills/migrate-rxjs-7-to-9/references/migration-capabilities.md': `# Generated migration capabilities

> Generated from the pinned RxJS 7 public declarations, migration-evidence
> registry, unsupported-surface catalog, and beta.1 deterministic engine. Do
> not edit by hand.

The catalog covers every public export from \`rxjs\`, \`rxjs/operators\`,
\`rxjs/ajax\`, \`rxjs/fetch\`, \`rxjs/webSocket\`, and \`rxjs/testing\` at RxJS
\`7.8.2\`: ${surfaceCatalog.counts.total} surfaces, including
${surfaceCatalog.counts.operators} operators and
${surfaceCatalog.counts.nonOperatorFunctions} other functions. Call
\`migration_capabilities\` for every surface's target, disposition, lifecycle
rule, platform-method candidate, and evidence status.

RxJS 7 Observable-producing code defaults to \`ColdObservable\` and exact
Symbols so direct subscriptions retain producer-per-subscription behavior.
Promote a unit to the platform lifecycle only after proving intentional RxJS 7
sharing or a single-subscriber topology. Platform-mode migration then prefers
proved native methods to avoid unnecessary extension imports.

Only these bounded rewrites are mechanically fixture-proved:

${capabilityIds.map((id) => `- \`${id}\``).join('\n')}

Every other catalog entry is still covered, but requires the stated guided,
manual-review, replacement, or unsupported path. Catalog coverage is not a
claim that all surfaces can be transformed mechanically.
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

The root is intentionally operator-free. Prefer platform methods when their
contracts fit; they need no RxJS extension subpath. For a required exact Symbol
or factory, verify its public subpath below and confirm the resulting module
graph with the consumer's bundler. Presence here is not a recommendation.

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
await mkdir(dirname(surfaceCatalogPath), { recursive: true });
await writeFile(surfaceCatalogPath, `${JSON.stringify(surfaceCatalog, null, 2)}\n`);

const manifest = {
  schemaVersion: 1,
  package: '@rxjs/agent-plugin',
  version: '9.0.0-beta.1',
  rxjs7: { version: '7.8.2', commit: 'e5351d02e225e275ac0e497c7b66eaa5f0c88791' },
  rxjs9: { version: '9.0.0-beta.1' },
  generatedReferences: Object.fromEntries(
    Object.entries(generatedReferences).map(([path, contents]) => [path, { sha256: sha256(contents), bytes: Buffer.byteLength(contents) }])
  ),
  migrationSurfaceCatalog: {
    path: 'dist/migration-surface-catalog.json',
    sha256: sha256(`${JSON.stringify(surfaceCatalog, null, 2)}\n`),
    bytes: Buffer.byteLength(`${JSON.stringify(surfaceCatalog, null, 2)}\n`),
    counts: surfaceCatalog.counts,
  },
  sources,
};
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);

async function buildSurfaceCatalog({
  declarationSources,
  publicTypesSource,
  parityRegistry,
  unsupportedSurfaceCatalog,
  mechanicalCapabilityByName,
  rxjs7TypesRoot,
}) {
  const reexports = Object.fromEntries(
    Object.entries(declarationSources).map(([entrypoint, contents]) => [entrypoint, parseReexports(contents)])
  );
  const rootTypes = parseExportedDeclarations(publicTypesSource).map((name) => ({ name, target: './internal/types' }));
  reexports.rxjs.push(...rootTypes.filter(({ name }) => !reexports.rxjs.some((entry) => entry.name === name)));

  const unsupportedEntries = Object.values(unsupportedSurfaceCatalog.categories).flat();
  const operatorRecords = new Map();
  for (const entry of reexports['rxjs/operators']) {
    if (!startsLowercase(entry.name)) continue;
    operatorRecords.set(entry.name, {
      name: entry.name,
      target: entry.target,
      importPaths: ['rxjs/operators'],
    });
  }
  for (const entry of reexports.rxjs) {
    if (!entry.target.includes('/operators/') || !startsLowercase(entry.name)) continue;
    const record = operatorRecords.get(entry.name);
    if (record) {
      record.importPaths.push('rxjs');
    } else {
      // Some operator functions are public only from the root barrel (for
      // example onErrorResumeNextWith) and still need operator treatment.
      operatorRecords.set(entry.name, {
        name: entry.name,
        target: entry.target,
        importPaths: ['rxjs'],
      });
    }
  }

  const surfaces = [];
  for (const record of operatorRecords.values()) {
    const parity = parityRegistry.operators[record.name] ?? aliasOperator(record.name);
    const mechanicalCapabilityId = mechanicalCapabilityByName.get(record.name);
    surfaces.push({
      id: `operator.${moduleName(record.name)}`,
      name: record.name,
      kind: 'operator',
      declarationKind: 'function',
      importPaths: record.importPaths.sort(),
      sourceDeclaration: record.target,
      migration: migrationForOperator(record.name, parity, mechanicalCapabilityId),
    });
  }

  for (const entry of reexports.rxjs) {
    if (entry.target.includes('/operators/') && startsLowercase(entry.name)) continue;
    const parity = parityRegistry.staticFactories[entry.name] ?? parityRegistry.values[entry.name];
    const declarationKind = await declarationKindFor(resolve(rxjs7TypesRoot, entry.target.replace(/^\.\//, '')), entry.name);
    const unsupported = findUnsupportedEntry(unsupportedEntries, entry.name);
    const importPaths = ['rxjs'];
    if (reexports['rxjs/operators'].some(({ name }) => name === entry.name)) importPaths.push('rxjs/operators');
    surfaces.push({
      id: `rxjs.${moduleName(entry.name)}`,
      name: entry.name,
      kind: parityRegistry.staticFactories[entry.name]
        ? 'creation-function'
        : declarationKind === 'function'
          ? 'function'
          : declarationKind === 'type'
            ? 'type'
            : 'value',
      declarationKind,
      importPaths,
      sourceDeclaration: entry.target,
      migration: migrationForRoot(entry.name, parity, unsupported, declarationKind),
    });
  }

  for (const entrypoint of ['rxjs/ajax', 'rxjs/fetch', 'rxjs/webSocket', 'rxjs/testing']) {
    for (const entry of reexports[entrypoint]) {
      const declarationKind = await declarationKindFor(
        resolve(rxjs7TypesRoot, dirname(declarationEntrypoints[entrypoint]), entry.target),
        entry.name
      );
      const unsupported = findUnsupportedEntry(unsupportedEntries, entry.name) ??
        findUnsupportedEntry(unsupportedEntries, entrypoint.replace('rxjs/', ''));
      surfaces.push({
        id: `${entrypoint.replace('rxjs/', '').toLowerCase()}.${moduleName(entry.name)}`,
        name: entry.name,
        kind: declarationKind === 'function' ? 'function' : declarationKind === 'type' ? 'type' : 'value',
        declarationKind,
        importPaths: [entrypoint],
        sourceDeclaration: entry.target,
        migration: migrationForRoot(entry.name, undefined, unsupported, declarationKind),
      });
    }
  }

  surfaces.sort((left, right) => left.id.localeCompare(right.id));
  const counts = {
    total: surfaces.length,
    operators: surfaces.filter(({ kind }) => kind === 'operator').length,
    functions: surfaces.filter(({ declarationKind }) => declarationKind === 'function').length,
    nonOperatorFunctions: surfaces.filter(({ kind, declarationKind }) => kind !== 'operator' && declarationKind === 'function').length,
    types: surfaces.filter(({ declarationKind }) => declarationKind === 'type').length,
    values: surfaces.filter(({ declarationKind }) => declarationKind !== 'function' && declarationKind !== 'type').length,
    mechanicallyProved: surfaces.filter(({ migration }) => migration.automation === 'fixture-proved').length,
  };

  return {
    schemaVersion: 1,
    catalogVersion: '1.0.0',
    source: {
      package: 'rxjs',
      version: '7.8.2',
      revision: 'e5351d02e225e275ac0e497c7b66eaa5f0c88791',
      entrypoints: Object.keys(declarationEntrypoints),
    },
    target: { package: 'rxjs', version: '9.0.0-beta.1' },
    lifecyclePolicy: {
      defaultTarget: 'producer-per-direct-subscription',
      defaultConstructor: 'ColdObservable',
      rationale: 'An ordinary RxJS 7 Observable creates producer work per direct subscription, so ColdObservable is the behavior-preserving default.',
      platformPromotionRequires: [
        'Characterized RxJS 7 sharing or multicasting whose reset, replay, and ref-count rules fit the platform lifecycle.',
        'Repository-wide proof that the unit has only one subscriber at a time, including framework, template, helper, retry, and exported consumers.',
        'An explicit product decision that shared active producer work is the intended RxJS 9 contract.',
      ],
      platformMethodPolicy: 'Use a platform string method only for a platform-promoted receiver and a proved semantic match. Exact Symbols preserve ColdObservable construction.',
    },
    counts,
    surfaces,
    crossCutting: unsupportedSurfaceCatalog.categories,
  };
}

function parseReexports(contents) {
  return [...contents.matchAll(/^export \{ ([^}]+) \} from ['"]([^'"]+)['"];$/gm)].flatMap((match) =>
    match[1].split(',').map((part) => {
      const [sourceName, exportedName] = part.trim().split(/\s+as\s+/);
      return { name: exportedName ?? sourceName, target: match[2] };
    })
  );
}

function parseExportedDeclarations(contents) {
  return [...contents.matchAll(/^export (?:declare )?(?:interface|type|class|const|function|enum) ([A-Za-z_$][\w$]*)/gm)].map(
    (match) => match[1]
  );
}

async function declarationKindFor(targetWithoutExtension, name) {
  const candidates = [`${targetWithoutExtension}.d.ts`, resolve(targetWithoutExtension, 'index.d.ts')];
  for (const candidate of candidates) {
    const contents = await readFile(candidate, 'utf8').catch(() => '');
    if (!contents) continue;
    if (new RegExp(`(?:export\\s+)?declare\\s+function\\s+${name}\\b`).test(contents)) return 'function';
    if (new RegExp(`(?:export\\s+)?declare\\s+class\\s+${name}\\b`).test(contents)) return 'class';
    if (new RegExp(`(?:export\\s+)?(?:declare\\s+)?(?:interface|type)\\s+${name}\\b`).test(contents)) return 'type';
    if (new RegExp(`(?:export\\s+)?declare\\s+(?:const|let|var)\\s+${name}\\b`).test(contents)) {
      // RxJS 7's ajax entry point declares a callable interface instance rather
      // than a function declaration. It remains a public creation function for
      // migration-inventory purposes.
      return name === 'ajax' ? 'function' : 'value';
    }
  }
  return startsLowercase(name) ? 'function' : 'type';
}

function migrationForOperator(name, parity, mechanicalCapabilityId) {
  const platformMethods = {
    map: 'map',
    filter: 'filter',
    take: 'take',
    skip: 'drop',
    concatMap: 'flatMap',
    concatAll: 'flatMap',
    switchMap: 'switchMap',
    switchAll: 'switchMap',
  };
  const sharing = new Set(['share', 'shareReplay', 'multicast', 'publish', 'publishBehavior', 'publishLast', 'publishReplay', 'refCount', 'connect']);
  const exactTarget = parity?.mapping ?? 'No accepted automatic target; use the documented replacement after review.';
  const platformMethod = platformMethods[name] ?? null;
  return {
    disposition: parity?.status?.includes('Compatibility-only') ? 'manual-review' : mechanicalCapabilityId ? 'guided' : 'manual-review',
    automation: mechanicalCapabilityId ? 'fixture-proved' : 'manual',
    mechanicalCapabilityId: mechanicalCapabilityId ?? null,
    target: exactTarget,
    coldTarget: exactTarget,
    platformTarget: platformMethod ? platformOperatorTarget(name, platformMethod) : exactTarget,
    status: parity?.status ?? 'Deprecated alias; manual replacement required',
    note: parity?.note ?? 'Preserve the behavioral claim and replace the alias with its accepted RxJS 9 surface.',
    lifecycle: sharing.has(name) ? 'platform-promotion-candidate' : 'inherit-cold-default',
    platformMethod,
  };
}

function migrationForRoot(name, parity, unsupported, declarationKind) {
  const subjectNames = new Set(['Subject', 'AsyncSubject', 'BehaviorSubject', 'ReplaySubject']);
  const defaultTarget = declarationKind === 'type'
    ? 'Replace with the target API public type or an application-owned structural type.'
    : 'No one-to-one automatic target; preserve behavior and migrate manually.';
  const target = parity?.mapping ?? unsupported?.replacement ?? defaultTarget;
  const coldTarget = coldTargetForRoot(name, target, declarationKind);
  return {
    disposition: unsupported?.disposition ?? (parity ? 'guided' : 'manual-review'),
    automation: 'manual',
    mechanicalCapabilityId: null,
    target,
    coldTarget,
    platformTarget: target,
    status: parity?.status ?? (unsupported ? `Cataloged ${unsupported.disposition}` : 'Manual review required'),
    note: parity?.note ?? unsupported?.rationale ?? 'No fixture-proved automatic rewrite is claimed.',
    lifecycle: declarationKind === 'type'
      ? 'not-applicable'
      : subjectNames.has(name)
        ? 'subject-hot'
        : name === 'Observable'
          ? 'cold-default'
          : 'inherit-cold-default',
    platformMethod: null,
  };
}

function aliasOperator(name) {
  if (name === 'combineAll') {
    return {
      mapping: 'source[combineLatestAll]()',
      status: 'Deprecated alias; manual replacement required',
      note: 'Replace combineAll with the exact combineLatestAll Symbol after preserving higher-order completion behavior.',
    };
  }
  if (name === 'partition') {
    return {
      mapping: 'Observable[partition](source, predicate)',
      status: 'Deprecated pipeable alias; manual replacement required',
      note: 'Move the source into the exact static partition Symbol and preserve the two independent predicate/index states.',
    };
  }
  if (name === 'onErrorResumeNextWith') {
    return {
      mapping: 'source[onErrorResumeNext]([otherSources])',
      status: 'Legacy root-only operator; exact replacement required',
      note: 'Replace the legacy With-form pipeable function with the exact onErrorResumeNext Symbol and adapt its sources to the accepted array form.',
    };
  }
  return undefined;
}

function findUnsupportedEntry(entries, name) {
  return entries.find(({ surfaces }) =>
    surfaces.some((surface) => surface === name || surface === `rxjs:${name}` || surface.split(/[():]/).includes(name))
  );
}

function startsLowercase(value) {
  return /^[a-z]/.test(value);
}

function coldTargetForRoot(name, target, declarationKind) {
  if (declarationKind === 'type') return target;
  if (name === 'Observable') return 'ColdObservable by default; use the ambient Observable only after platform promotion.';
  if (name === 'from') {
    return 'Wrap Observable.from(input) in a ColdObservable activation so each direct subscription preserves the RxJS 7 producer boundary.';
  }
  if (name === 'of' || name === 'pairs' || name === 'range') {
    return `Create the values through a ColdObservable boundary; ${target} is the smaller platform-promoted form.`;
  }
  return target.replace(/^Observable\[/, 'ColdObservable[').replace(/^new Observable\(/, 'new ColdObservable(');
}

function platformOperatorTarget(name, method) {
  switch (name) {
    case 'concatAll':
      return 'source.flatMap(inner => inner)';
    case 'concatMap':
      return 'source.flatMap(project)';
    case 'switchAll':
      return 'source.switchMap(inner => inner)';
    case 'skip':
      return 'source.drop(count)';
    default:
      return `source.${method}(...)`;
  }
}
