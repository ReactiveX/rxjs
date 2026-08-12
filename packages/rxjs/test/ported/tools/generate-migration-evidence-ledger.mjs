#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(toolDirectory, '../../../../..');
const [capabilityRegistry, manifest, verifiedColdPasses, verifiedPolyfillPasses] = await Promise.all(
  ['../capability-registry.json', '../manifest.generated.json', '../verified-cold-passes.json', '../verified-polyfill-passes.json'].map(
    (path) => readFile(resolve(toolDirectory, path), 'utf8').then(JSON.parse)
  )
);
const jsonPath = resolve(toolDirectory, '../migration-evidence-ledger.generated.json');
const markdownPath = resolve(repositoryRoot, 'packages/rxjs/docs/MIGRATION_EVIDENCE_LEDGER.md');
const checkOnly = process.argv.includes('--check');
const verifiedPasses = {
  cold: new Set(verifiedColdPasses.caseIds),
  polyfill: new Set(verifiedPolyfillPasses.caseIds),
};
const manifestByCaseId = new Map(manifest.cases.map((testCase) => [testCase.id, testCase]));
const evidenceAliases = new Map([
  ['factory:never', 'value:NEVER'],
  ['operator:exhaust', 'operator:exhaustAll'],
  ['operator:flatMap', 'operator:mergeMap'],
  ['value:TimeInterval', 'operator:timeInterval'],
]);
const supplementalEvidence = new Map([
  [
    'value:ColdObservable',
    {
      sourceFiles: [],
      localEvidence: ['packages/rxjs/src/cold-observable.spec.ts', 'packages/rxjs/test/types/intentional-apis.ts'],
      note: 'Intentional Next API evidence is local because RxJS 7 did not publish this class as a public migration source.',
    },
  ],
  [
    'value:firstValueFrom',
    {
      sourceFiles: ['spec/firstValueFrom-spec.ts'],
      localEvidence: ['packages/observable-polyfill/src/index.spec.ts', 'packages/rxjs/src/cold-observable.spec.ts'],
      note: 'The pinned non-marble source defines RxJS 7 Promise conversion; focused Next evidence covers the partial platform first() mapping.',
    },
  ],
  [
    'value:lastValueFrom',
    {
      sourceFiles: ['spec/lastValueFrom-spec.ts'],
      localEvidence: ['packages/observable-polyfill/src/index.spec.ts', 'packages/rxjs/src/cold-observable.spec.ts'],
      note: 'The pinned non-marble source defines RxJS 7 Promise conversion; focused Next evidence covers the partial platform last() mapping.',
    },
  ],
]);

const evidenceByRoleAndName = collectEvidence();
const entries = [
  ...Object.entries(capabilityRegistry.operators).map(([name, capability]) => createEntry('operator', name, capability)),
  ...Object.entries(capabilityRegistry.staticFactories).map(([name, capability]) => createEntry('factory', name, capability)),
  ...Object.entries(capabilityRegistry.values).map(([name, capability]) => createEntry('value', name, capability)),
].sort((left, right) => left.id.localeCompare(right.id));

validate(entries);

const ledger = {
  schemaVersion: 1,
  source: {
    ref: manifest.sourceRef,
    commit: manifest.sourceCommit,
    manifest: 'packages/rxjs/test/ported/manifest.generated.json',
    capabilityRegistry: 'packages/rxjs/test/ported/capability-registry.json',
  },
  totals: {
    entries: entries.length,
    operators: entries.filter(({ category }) => category === 'operator').length,
    factories: entries.filter(({ category }) => category === 'factory').length,
    values: entries.filter(({ category }) => category === 'value').length,
    evidenceCases: new Set(entries.flatMap(({ evidence }) => evidence.caseIds)).size,
    uncoveredEntries: entries.filter(({ evidence }) => evidence.status === 'uncovered').length,
    aliasedEvidenceEntries: entries.filter(({ evidence }) => evidence.status === 'source-pinned-alias').length,
    supplementalEvidenceEntries: entries.filter(({ evidence }) => evidence.status === 'supplemental').length,
  },
  entries,
};

const json = `${JSON.stringify(ledger, null, 2)}\n`;
const markdown = await prettier.format(renderMarkdown(ledger), { parser: 'markdown' });

if (checkOnly) {
  await checkFile(jsonPath, json, 'Migration evidence JSON ledger');
  await checkFile(markdownPath, markdown, 'Migration evidence Markdown ledger');
} else {
  await writeFile(jsonPath, json, 'utf8');
  await writeFile(markdownPath, markdown, 'utf8');
  process.stdout.write(`Generated ${jsonPath}\nGenerated ${markdownPath}\n`);
}

function createEntry(category, name, capability) {
  const role = category === 'operator' ? 'operator' : 'value';
  const id = `${category}:${name}`;
  const aliasEvidenceKey = evidenceAliases.get(id);
  const evidence = evidenceByRoleAndName.get(aliasEvidenceKey ?? `${role}:${name}`) ?? {
    caseIds: [],
    classifications: [],
    sourceFiles: [],
  };
  const supplemental = supplementalEvidence.get(id);
  const status =
    evidence.caseIds.length > 0
      ? aliasEvidenceKey
        ? 'source-pinned-alias'
        : 'source-pinned'
      : supplemental
      ? 'supplemental'
      : 'uncovered';

  return {
    id,
    category,
    rxjs7: {
      name,
      importPath: category === 'operator' ? 'rxjs/operators' : 'rxjs',
    },
    evidence: {
      status,
      caseCount: evidence.caseIds.length,
      caseIds: evidence.caseIds,
      sourceFiles: supplemental?.sourceFiles ?? evidence.sourceFiles,
      localEvidence: supplemental?.localEvidence ?? [],
      testClassifications: evidence.classifications,
      modeResults: {
        cold: modeResult(evidence.caseIds, verifiedPasses.cold),
        polyfill: modeResult(evidence.caseIds, verifiedPasses.polyfill),
      },
      note:
        supplemental?.note ??
        (aliasEvidenceKey
          ? `Uses the canonical executable evidence for ${aliasEvidenceKey}; the RxJS 7 public name is an alias or equivalent surface.`
          : undefined),
    },
    next: {
      surface: surfaceFor(category, capability),
      module: capability.module,
      mapping: capability.mapping,
      status: capability.status,
      sharingModel: sharingModelFor(category, name, capability),
      cancellationModel: cancellationModelFor(category, name, capability),
      typeStatus: typeStatusFor(capability.status),
    },
    migration: {
      action: migrationActionFor(capability.status),
      semanticReviewRequired: semanticReviewRequired(capability.status),
      adapter: capability.adapter,
      note: capability.note,
    },
    decisions: decisionsFor(category, name, capability),
  };
}

function collectEvidence() {
  const collected = new Map();
  for (const testCase of manifest.cases) {
    for (const imported of testCase.imports) {
      if (imported.module !== 'rxjs' && imported.module !== 'rxjs/operators') {
        continue;
      }

      const key = `${imported.usage}:${imported.imported}`;
      const evidence = collected.get(key) ?? {
        caseIds: new Set(),
        classifications: new Set(),
        sourceFiles: new Set(),
      };
      evidence.caseIds.add(testCase.id);
      evidence.classifications.add(testCase.classification);
      evidence.sourceFiles.add(testCase.source.path);
      collected.set(key, evidence);
    }
  }

  return new Map(
    [...collected].map(([key, evidence]) => [
      key,
      {
        caseIds: [...evidence.caseIds].sort(),
        classifications: [...evidence.classifications].sort(),
        sourceFiles: [...evidence.sourceFiles].sort(),
      },
    ])
  );
}

function surfaceFor(category, capability) {
  if (category === 'operator') return 'instance-symbol';
  if (category === 'factory') return capability.kind === 'symbol' ? 'static-symbol' : capability.kind;
  if (capability.module === 'global') return 'platform-or-type-adapter';
  return 'intentional-next-value';
}

function sharingModelFor(category, name, capability) {
  if (category !== 'value') return 'shared-active-platform';
  if (['AsyncSubject', 'BehaviorSubject', 'ConnectableObservable', 'ReplaySubject', 'Subject', 'connectable'].includes(name)) {
    return 'subject-hot';
  }
  if (name === 'ColdObservable') return 'producer-per-direct-subscription';
  if (name === 'pipe') return 'receiver-selected';
  if (['EMPTY', 'NEVER', 'Observable', 'firstValueFrom', 'fromEventPattern', 'lastValueFrom', 'zip'].includes(name)) {
    return 'shared-active-platform';
  }
  if (capability.status.includes('Type-only') || capability.status.includes('compatibility fixture')) return 'not-applicable';
  return 'not-applicable';
}

function cancellationModelFor(category, name, capability) {
  const sharingModel = sharingModelFor(category, name, capability);
  if (sharingModel === 'not-applicable') {
    return capability.status.includes('compatibility fixture') ? 'test-local-adapter' : 'not-applicable';
  }
  if (name === 'Subscription') return 'unsupported';
  return 'AbortSignal';
}

function typeStatusFor(status) {
  if (status.includes('parity verified')) return 'preserved';
  if (status.includes('Type-only')) return 'compatibility-only';
  return 'changed';
}

function modeResult(caseIds, passingCaseIds) {
  const passed = caseIds.filter((caseId) => passingCaseIds.has(caseId)).length;
  const failureClassifications = [
    ...new Set(
      caseIds
        .filter((caseId) => !passingCaseIds.has(caseId))
        .map((caseId) => manifestByCaseId.get(caseId)?.classification)
        .filter(Boolean)
    ),
  ].sort();
  return {
    total: caseIds.length,
    passed,
    failed: caseIds.length - passed,
    failureClassifications,
  };
}

function migrationActionFor(status) {
  if (status.includes('compatibility fixture')) return 'adapter';
  if (status.includes('Compatibility') || status.includes('compatibility')) return 'semantic-review';
  if (status.includes('Partial') || status.includes('scheduler') || status.includes('review required')) {
    return 'mechanical-change-and-semantic-review';
  }
  return 'mechanical-change';
}

function semanticReviewRequired(status) {
  return !status.includes('parity verified');
}

function decisionsFor(category, name, capability) {
  const decisions = new Set();
  if (category === 'operator' || capability.kind === 'symbol' || name === 'pipe') {
    decisions.add('D-003');
    decisions.add('D-048');
    decisions.add('D-049');
  }
  if (category === 'factory' || category === 'value') decisions.add('D-040');
  if (
    capability.status.includes('scheduler') ||
    ['animationFrames', 'bufferTime', 'delay', 'observeOn', 'sampleTime', 'subscribeOn', 'timeout', 'windowTime'].includes(name)
  ) {
    decisions.add('D-033');
    decisions.add('D-034');
  }
  if (
    ['AsyncSubject', 'BehaviorSubject', 'ColdObservable', 'ConnectableObservable', 'ReplaySubject', 'Subject', 'connectable'].includes(name)
  ) {
    decisions.add('D-035');
    decisions.add('D-039');
  }
  if (name === 'ColdObservable') decisions.add('D-037');
  if (['AsyncSubject', 'BehaviorSubject', 'ColdObservable', 'ReplaySubject', 'Subject', 'pipe'].includes(name)) {
    decisions.add('D-050');
  }
  if (capability.status.includes('Compatibility') || capability.status.includes('compatibility')) decisions.add('D-039');
  if (decisions.size === 0) decisions.add('D-039');
  return [...decisions].sort();
}

function validate(generatedEntries) {
  const expectedCount =
    Object.keys(capabilityRegistry.operators).length +
    Object.keys(capabilityRegistry.staticFactories).length +
    Object.keys(capabilityRegistry.values).length;
  if (generatedEntries.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} ledger entries, received ${generatedEntries.length}`);
  }

  const ids = new Set();
  for (const entry of generatedEntries) {
    if (ids.has(entry.id)) throw new Error(`Duplicate migration ledger entry: ${entry.id}`);
    ids.add(entry.id);
    if (!entry.next.mapping || !entry.next.status || !entry.migration.adapter || !entry.migration.note) {
      throw new Error(`Incomplete migration ledger entry: ${entry.id}`);
    }
    if (entry.decisions.length === 0) throw new Error(`Missing controlling decision: ${entry.id}`);
    if (entry.evidence.caseCount !== entry.evidence.caseIds.length) throw new Error(`Evidence count mismatch: ${entry.id}`);
    for (const result of Object.values(entry.evidence.modeResults)) {
      if (result.passed + result.failed !== result.total || result.total !== entry.evidence.caseCount) {
        throw new Error(`Mode-result mismatch: ${entry.id}`);
      }
      if (
        result.failureClassifications.some((classification) => !['compatibility-only', 'intentional-divergence'].includes(classification))
      ) {
        throw new Error(`Unclassified failing migration evidence: ${entry.id}`);
      }
    }
    if (entry.evidence.status === 'uncovered') throw new Error(`Uncovered prioritized migration entry: ${entry.id}`);
    if (entry.next.typeStatus === 'deferred') throw new Error(`Deferred prioritized type status: ${entry.id}`);
  }
}

function renderMarkdown(generatedLedger) {
  const sections = [
    ['Operators', generatedLedger.entries.filter(({ category }) => category === 'operator')],
    ['Creation and static functions', generatedLedger.entries.filter(({ category }) => category === 'factory')],
    ['Values, types, and standalone functions', generatedLedger.entries.filter(({ category }) => category === 'value')],
  ];
  const body = sections.map(([title, sectionEntries]) => `## ${title}\n\n${markdownTable(sectionEntries)}`).join('\n\n');

  return `# RxJS 7 migration-evidence ledger

This generated ledger joins the versioned RxJS Next capability registry to the
source-pinned RxJS 7 executable manifest. It records migration status and
evidence; it does not promise an RxJS 7 runtime compatibility surface.

- **RxJS 7 source:** \`${generatedLedger.source.ref}\` at \`${generatedLedger.source.commit}\`
- **Entries:** ${generatedLedger.totals.entries} (${generatedLedger.totals.operators} operators, ${generatedLedger.totals.factories} creation/static functions, ${generatedLedger.totals.values} values/types)
- **Distinct evidence cases:** ${generatedLedger.totals.evidenceCases}
- **Entries without source-pinned cases:** ${generatedLedger.totals.uncoveredEntries}
- **Rows using canonical alias evidence:** ${generatedLedger.totals.aliasedEvidenceEntries}
- **Rows using pinned non-marble or focused Next evidence:** ${generatedLedger.totals.supplementalEvidenceEntries}

The complete case IDs and source files are retained in
\`packages/rxjs/test/ported/migration-evidence-ledger.generated.json\`. Every
prioritized row has direct, canonical-alias, or supplemental evidence. Cold and
fallback totals account for every linked executable case; supplemental rows
name their pinned non-marble or focused Next sources explicitly.

Regenerate or verify the ledger with:

\`\`\`sh
pnpm --filter rxjs run test:unit:ledger:generate
pnpm --filter rxjs run test:unit:ledger:check
\`\`\`

${body}
`;
}

function markdownTable(sectionEntries) {
  const headers = [
    'RxJS 7 API',
    'Next status',
    'Evidence',
    'Cases',
    'Cold',
    'Fallback',
    'Classifications',
    'Sharing',
    'Cancellation',
    'Types',
    'Migration',
    'Decisions',
  ];
  const divider = headers.map(() => '---');
  const rows = sectionEntries.map((entry) => [
    `\`${entry.rxjs7.name}\``,
    entry.next.status,
    entry.evidence.status,
    String(entry.evidence.caseCount),
    formatModeResult(entry.evidence.modeResults.cold),
    formatModeResult(entry.evidence.modeResults.polyfill),
    entry.evidence.testClassifications.length === 0 ? 'supplemental' : entry.evidence.testClassifications.join(', '),
    entry.next.sharingModel,
    entry.next.cancellationModel,
    entry.next.typeStatus,
    entry.migration.action,
    entry.decisions.join(', '),
  ]);
  return [`| ${headers.join(' | ')} |`, `| ${divider.join(' | ')} |`, ...rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`)].join(
    '\n'
  );
}

function formatModeResult(result) {
  return result.total === 0 ? 'supplemental' : `${result.passed}/${result.total}`;
}

function escapeCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

async function checkFile(path, expected, label) {
  const existing = await readFile(path, 'utf8').catch(() => '');
  if (existing !== expected) {
    process.stderr.write(`${label} is stale: ${path}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`${label} is current: ${path}\n`);
  }
}
