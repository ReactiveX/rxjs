#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(toolDirectory, '../../../../..');
const capabilityRegistry = JSON.parse(await readFile(resolve(toolDirectory, '../capability-registry.json'), 'utf8'));
const manifest = JSON.parse(await readFile(resolve(toolDirectory, '../manifest.generated.json'), 'utf8'));
const jsonPath = resolve(toolDirectory, '../migration-evidence-ledger.generated.json');
const markdownPath = resolve(repositoryRoot, 'docs/rxjs-next/MIGRATION_EVIDENCE_LEDGER.md');
const checkOnly = process.argv.includes('--check');

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
  const evidence = evidenceByRoleAndName.get(`${role}:${name}`) ?? {
    caseIds: [],
    classifications: [],
    sourceFiles: [],
  };
  const status = evidence.caseIds.length === 0 ? 'uncovered' : 'source-pinned';

  return {
    id: `${category}:${name}`,
    category,
    rxjs7: {
      name,
      importPath: category === 'operator' ? 'rxjs/operators' : 'rxjs',
    },
    evidence: {
      status,
      caseCount: evidence.caseIds.length,
      caseIds: evidence.caseIds,
      sourceFiles: evidence.sourceFiles,
      testClassifications: evidence.classifications,
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
  if (status.includes('Compatibility') || status.includes('compatibility') || status.includes('Partial')) return 'changed';
  if (status.includes('Platform mapping')) return 'changed';
  return 'deferred';
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

The complete case IDs and source files are retained in
\`packages/rxjs/test/ported/migration-evidence-ledger.generated.json\`. An
\`uncovered\` row is explicit missing behavioral evidence, not an implied pass.

Regenerate or verify the ledger with:

\`\`\`sh
pnpm --filter rxjs run test:unit:ledger:generate
pnpm --filter rxjs run test:unit:ledger:check
\`\`\`

${body}
`;
}

function markdownTable(sectionEntries) {
  const headers = ['RxJS 7 API', 'Next status', 'Cases', 'Classifications', 'Sharing', 'Cancellation', 'Types', 'Migration', 'Decisions'];
  const divider = headers.map(() => '---');
  const rows = sectionEntries.map((entry) => [
    `\`${entry.rxjs7.name}\``,
    entry.next.status,
    String(entry.evidence.caseCount),
    entry.evidence.testClassifications.length === 0 ? 'uncovered' : entry.evidence.testClassifications.join(', '),
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
