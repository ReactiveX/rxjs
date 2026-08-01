#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import capabilityRegistry from '../capability-registry.json' with { type: 'json' };

const sourceRef = '7.x';
const toolDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(toolDirectory, '../../../../..');
const outputPath = resolve(repositoryRoot, 'docs/rxjs-next/RxJS-7-parity.md');
const checkOnly = process.argv.includes('--check');
const sourceCommit = execGit(['rev-parse', sourceRef]).trim();
const operatorIndex = execGit(['show', `${sourceRef}:src/operators/index.ts`]);
const rootIndex = execGit(['show', `${sourceRef}:src/index.ts`]);
const manifest = JSON.parse(await readFile(resolve(toolDirectory, '../manifest.generated.json'), 'utf8'));

const operatorNames = extractLowercaseExports(operatorIndex);
const creationNames = [
  'animationFrames',
  ...extractLowercaseExports(section(rootIndex, '/* Static observable creation exports */', '/* Constants */')),
];
const utilityNames = [
  ...extractLowercaseExports(section(rootIndex, '/* Utils */', '/* Promise Conversion */')),
  ...extractLowercaseExports(section(rootIndex, '/* Promise Conversion */', '/* Error types */')),
];
const operatorUsage = countUsage('operator');
const valueUsage = countUsage('value');

const platformAnalogues = {
  catchError: {
    mapping: 'source.catch(handler)',
    note: 'The platform string method is Observable-returning, but its handler contract is not an RxJS Symbol contract.',
  },
  every: {
    mapping: 'source.every(predicate)',
    note: 'The platform string method returns a Promise rather than the RxJS 7 operator Observable.',
  },
  filter: {
    mapping: 'source.filter(predicate)',
    note: 'D-003 still requires a separate RxJS Symbol even where the platform string contract is behaviorally close.',
  },
  finalize: {
    mapping: 'source.finally(callback)',
    note: 'The platform string method is Observable-returning, but cancellation and callback timing remain a distinct contract.',
  },
  find: {
    mapping: 'source.find(predicate)',
    note: 'The platform string method returns a Promise rather than the RxJS 7 operator Observable.',
  },
  map: {
    mapping: 'source.map(project)',
    note: 'D-003 still requires a separate RxJS Symbol even where the platform string contract is behaviorally close.',
  },
  reduce: {
    mapping: 'source.reduce(reducer, seed?)',
    note: 'The platform string method returns a Promise rather than the RxJS 7 operator Observable.',
  },
  skip: {
    mapping: 'source.drop(count)',
    note: 'The platform string method has a different name and does not satisfy the missing RxJS Symbol contract.',
  },
  take: {
    mapping: 'source.take(count)',
    note: 'The platform string method does not satisfy the missing RxJS Symbol contract.',
  },
  takeUntil: {
    mapping: 'source.takeUntil(notifier)',
    note: 'The platform string method does not satisfy the missing RxJS Symbol contract; notifier error semantics also differ.',
  },
  tap: {
    mapping: 'source.inspect(inspector)',
    note: 'The platform inspector uses subscribe/abort lifecycle hooks rather than the complete RxJS 7 tap contract.',
  },
};

const operatorRows = operatorNames.map((name) => {
  const capability = capabilityRegistry.operators[name];
  if (capability) {
    return [
      code(name),
      capability.status,
      code(capability.mapping),
      String(operatorUsage.get(name)?.size ?? 0),
      `${capability.note} Symbol source: \`packages/rxjs/src/${capability.module}.ts\`; executable adapter: \`${capability.adapter}\`.`,
    ];
  }
  const platformAnalogue = platformAnalogues[name];
  if (platformAnalogue) {
    return [
      code(name),
      'Missing RxJS Symbol; platform analogue only',
      code(platformAnalogue.mapping),
      String(operatorUsage.get(name)?.size ?? 0),
      platformAnalogue.note,
    ];
  }
  return [code(name), '**Missing**', '—', String(operatorUsage.get(name)?.size ?? 0), 'No current RxJS Next operator mapping.'];
});

const creationRows = creationNames.map((name) => {
  const capability = capabilityRegistry.staticFactories[name];
  if (capability) {
    const sourceNote =
      capability.kind === 'symbol'
        ? ` Symbol source: \`packages/rxjs/src/${capability.module}.ts\`.`
        : capability.kind === 'standalone'
          ? ` Standalone source: \`packages/rxjs/src/${capability.module}.ts\`.`
          : ' Uses the ambient platform Observable.';
    return [
      code(name),
      capability.status,
      code(capability.mapping),
      String(valueUsage.get(name)?.size ?? 0),
      `${capability.note}${sourceNote} Executable adapter: \`${capability.adapter}\`.`,
    ];
  }
  if (name === 'zip' && capabilityRegistry.values.zip) {
    const capability = capabilityRegistry.values.zip;
    return [
      code(name),
      capability.status,
      code(capability.mapping),
      String(valueUsage.get(name)?.size ?? 0),
      `${capability.note} Standalone source: \`packages/rxjs/src/${capability.module}.ts\`; executable adapter: \`${capability.adapter}\`.`,
    ];
  }
  return [code(name), '**Missing**', '—', String(valueUsage.get(name)?.size ?? 0), 'No current RxJS Next function mapping.'];
});

const utilityRows = utilityNames.map((name) => {
  const capability = capabilityRegistry.values[name];
  if (capability?.status) {
    const sourceNote =
      capability.module === 'global'
        ? 'Uses the ambient platform Observable.'
        : `Symbol source: \`packages/rxjs/src/${capability.module}.ts\`.`;
    return [
      code(name),
      capability.status,
      code(capability.mapping),
      String(valueUsage.get(name)?.size ?? 0),
      `${capability.note} ${sourceNote} Executable adapter: \`${capability.adapter}\`.`,
    ];
  }
  if (name === 'pipe') {
    return [
      code(name),
      'Partial mapping',
      code('source[pipe](...functions)'),
      String(valueUsage.get(name)?.size ?? 0),
      'A Symbol surface exists, but the RxJS 7 standalone pipeable-operator contract is not restored.',
    ];
  }
  return [code(name), '**Missing**', '—', String(valueUsage.get(name)?.size ?? 0), 'No current equivalent public function.'];
});

const otherRows = [
  valueRow('Observable', 'The active native or fallback platform constructor; semantics intentionally differ.'),
  valueRow('Subject', 'Exploratory class exists; RxJS 7 subject parity is not established.'),
  valueRow('BehaviorSubject', 'Current surface is a factory with an experimental compatibility contract.'),
  valueRow('ReplaySubject', 'Current surface is a factory with an experimental compatibility contract.'),
  otherRow('AsyncSubject', '**Missing**', '—', 'No current equivalent.'),
  otherRow('ConnectableObservable', '**Missing**', '—', 'No current equivalent.'),
  otherRow('GroupedObservable', '**Missing**', '—', 'No current equivalent.'),
  otherRow('Subscription', '**Missing**', '—', 'Platform cancellation is AbortSignal-based; a compatibility facade is undecided.'),
  otherRow('Subscriber', 'Platform-only', 'globalThis.Subscriber', 'Platform lifecycle type exists; it is not the RxJS 7 Subscriber class.'),
  otherRow('Notification', '**Missing**', '—', 'No current equivalent.'),
  valueRow('EMPTY', 'Current standalone singleton; lifecycle parity remains test-driven.'),
  valueRow('NEVER', 'Current standalone singleton; lifecycle parity remains test-driven.'),
  otherRow('Schedulers and scheduler classes', '**Missing**', '—', 'Host timing plus rxTest replaces the platform-layer scheduler abstraction.'),
  otherRow('RxJS 7 error classes', '**Missing**', '—', 'No current public parity set.'),
];

const presentOperators = operatorRows.filter((row) => !row[1].includes('Missing')).length;
const missingOperators = operatorRows.length - presentOperators;
const presentFunctions = [...creationRows, ...utilityRows].filter((row) => !row[1].includes('Missing')).length;
const missingFunctions = creationRows.length + utilityRows.length - presentFunctions;

const rawContent = `# RxJS 7 to RxJS Next parity map

This generated map tracks public RxJS 7 operators and functions against the
current exploratory RxJS Next source. It is an API-surface inventory, not a
claim that present entries already have behavioral, lifecycle, overload, or
type parity.

- **RxJS 7 source:** \`${sourceRef}\` at \`${sourceCommit}\`
- **Marble evidence:** \`${manifest.sourceCommit}\`
- **Operator entries:** ${operatorRows.length} total; ${presentOperators} present or partially mapped; ${missingOperators} missing
- **Creation/utility functions:** ${creationRows.length + utilityRows.length} total; ${presentFunctions} present or partially mapped; ${missingFunctions} missing

Regenerate after adding or changing capabilities:

\`\`\`sh
pnpm --filter rxjs run test:unit:parity:generate
pnpm --filter rxjs run test:unit:parity:check
\`\`\`

## Mapping rules

- RxJS 7 \`source.pipe(operator(arg1, arg2))\` maps to
  \`source[operator](arg1, arg2)\` when that exact RxJS Next Symbol exists.
- A root creation function maps to \`Observable[factory](...)\` when a static
  Symbol exists.
- Platform string methods are shown only as analogues. They do not satisfy
  RxJS Symbol parity.
- Unified mappings in the capability registry are executable adapters. They
  intentionally expose unsupported overloads and semantic differences as
  failing parity tests.
- Platform analogues are documentation only and are not substituted for a
  missing RxJS Symbol.
- “Present” means a current source surface can be invoked. Every behavioral
  claim remains governed by the ported tests.
- The “Marble cases” column counts inventoried cases that import the API in the
  indicated operator or value role. Counts overlap when one case uses several
  APIs.

## Pipeable operators

${markdownTable(['RxJS 7 API', 'RxJS Next status', 'Current mapping', 'Marble cases', 'Notes'], operatorRows)}

## Creation and combination functions

${markdownTable(['RxJS 7 API', 'RxJS Next status', 'Current mapping', 'Marble cases', 'Notes'], creationRows)}

## Utility and Promise-conversion functions

${markdownTable(['RxJS 7 API', 'RxJS Next status', 'Current mapping', 'Marble cases', 'Notes'], utilityRows)}

## Other parity-critical surfaces

${markdownTable(['RxJS 7 surface', 'RxJS Next status', 'Current mapping', 'Notes'], otherRows)}

## Test-harness relationship

The machine-readable capability mapping is
\`packages/rxjs/test/ported/capability-registry.json\`. The checked-in migration
evidence, generated migration-evidence ledger, and reusable \`@rxjs/migrate\`
tooling use the import's role:

- an operator import becomes a descriptor that invokes
  \`source[targetSymbol](...adaptedArgs)\`;
- a creation function invokes \`Observable[factorySymbol](...args)\`;
- a standalone value/function uses the registered value directly;
- an absent entry remains a registered test and fails with a source-linked
  \`missing-api\` diagnostic.

The complete per-case evidence remains in
\`packages/rxjs/test/ported/manifest.generated.json\`. Executable specs are
ordinary repository-owned files; \`migration-report.json\` retains their static
case-ID mapping for audits. The joined ledger is generated at
\`packages/rxjs/test/ported/migration-evidence-ledger.generated.json\` with its
readable view in \`packages/rxjs/docs/MIGRATION_EVIDENCE_LEDGER.md\`.
`;
const content = prettier.format(rawContent, { parser: 'markdown' });

if (checkOnly) {
  const existing = await readFile(outputPath, 'utf8').catch(() => '');
  if (existing !== content) {
    process.stderr.write(`Parity document is stale: ${outputPath}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`Parity document is current: ${outputPath}\n`);
  }
} else {
  await writeFile(outputPath, content, 'utf8');
  process.stdout.write(`Generated ${outputPath}\n`);
}

function countUsage(usage) {
  const counts = new Map();
  for (const testCase of manifest.cases) {
    for (const imported of testCase.imports) {
      if (imported.usage !== usage) {
        continue;
      }
      const cases = counts.get(imported.imported) ?? new Set();
      cases.add(testCase.id);
      counts.set(imported.imported, cases);
    }
  }
  return counts;
}

function extractLowercaseExports(source) {
  const names = new Set();
  for (const match of source.matchAll(/export\s+\{([^}]+)\}\s+from/g)) {
    for (const specifier of match[1].split(',')) {
      const name = specifier.trim().split(/\s+as\s+/)[0];
      if (/^[a-z][A-Za-z0-9]*$/.test(name)) {
        names.add(name);
      }
    }
  }
  return [...names].sort((left, right) => left.localeCompare(right));
}

function section(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start === -1 || end === -1) {
    throw new Error(`Could not find source section ${startMarker}`);
  }
  return source.slice(start, end);
}

function otherRow(name, status, mapping, note) {
  return [code(name), status, mapping === '—' ? mapping : code(mapping), note];
}

function valueRow(name, fallbackNote) {
  const capability = capabilityRegistry.values[name];
  if (!capability?.status || !capability.mapping) {
    return otherRow(name, '**Missing**', '—', fallbackNote);
  }
  return otherRow(name, capability.status, capability.mapping, capability.note ?? fallbackNote);
}

function markdownTable(headers, rows) {
  const header = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`).join('\n');
  return `${header}\n${divider}\n${body}`;
}

function code(value) {
  return `\`${value}\``;
}

function escapeCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function execGit(args) {
  return execFileSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
}
