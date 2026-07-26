#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const [manifest, coldBaseline, polyfillBaseline] = await Promise.all(
  ['manifest.generated.json', 'verified-cold-passes.json', 'verified-polyfill-passes.json'].map(async (name) =>
    JSON.parse(await readFile(new URL(name, import.meta.url), 'utf8'))
  )
);
const dispositionFields = {
  active: 'active',
  'expected-failure': 'expectedFailure',
  'missing-api': 'missingApi',
  deduplicated: 'deduplicated',
  'unsupported-or-obsolete': 'unsupportedOrObsolete',
};
const computedTotals = {
  cases: manifest.cases.length,
  active: 0,
  expectedFailure: 0,
  missingApi: 0,
  deduplicated: 0,
  unsupportedOrObsolete: 0,
};
const caseIds = new Set(manifest.cases.map((testCase) => testCase.id));
const categories = new Map();
let executablePrograms = 0;
const modeRegistrations = {
  cold: 0,
  polyfill: 0,
  native: 0,
};

for (const testCase of manifest.cases) {
  const totalField = dispositionFields[testCase.disposition];
  if (!totalField) {
    throw new Error(`Case ${testCase.id} has an unknown disposition: ${String(testCase.disposition)}`);
  }
  computedTotals[totalField]++;
  if (testCase.source.commit !== manifest.sourceCommit || testCase.source.ref !== manifest.sourceRef) {
    throw new Error(`Case ${testCase.id} does not match the manifest source revision.`);
  }
  if (testCase.disposition === 'deduplicated' && !caseIds.has(testCase.duplicateOf)) {
    throw new Error(`Case ${testCase.id} points to a missing duplicate canonical case.`);
  }
  if (typeof testCase.migratedProgram !== 'string') {
    throw new Error(`Case ${testCase.id} is missing its migrated program.`);
  }
  executablePrograms++;
  for (const mode of Object.keys(modeRegistrations)) {
    if (testCase.modes.includes(mode)) {
      modeRegistrations[mode]++;
    }
  }

  const category = testCase.source.path.split('/')[1] ?? 'root';
  categories.set(category, (categories.get(category) ?? 0) + 1);
}

if (new Set(manifest.cases.map((testCase) => testCase.id)).size !== manifest.cases.length) {
  throw new Error('The port manifest contains duplicate case IDs.');
}
if (JSON.stringify(computedTotals) !== JSON.stringify(manifest.totals)) {
  throw new Error(`Manifest totals do not match its cases: ${JSON.stringify(computedTotals)}`);
}
for (const [mode, registrations] of Object.entries(modeRegistrations)) {
  if (registrations !== manifest.totals.cases) {
    throw new Error(`${mode} registers ${registrations} cases; expected ${manifest.totals.cases}.`);
  }
}

const manifestLocations = new Set(manifest.cases.map((testCase) => `${testCase.source.path}:${testCase.source.line}`));
for (const baseline of [coldBaseline, polyfillBaseline]) {
  if (baseline.sourceCommit !== manifest.sourceCommit || baseline.audit.total !== manifest.totals.cases) {
    throw new Error(`${baseline.mode} baseline does not match the complete manifest source revision.`);
  }
  if (baseline.audit.passed + baseline.audit.failed !== baseline.audit.total) {
    throw new Error(`${baseline.mode} baseline audit totals do not reconcile.`);
  }
  if (new Set(baseline.locations).size !== baseline.locations.length) {
    throw new Error(`${baseline.mode} baseline contains duplicate locations.`);
  }
  for (const location of baseline.locations) {
    if (!manifestLocations.has(location)) {
      throw new Error(`${baseline.mode} baseline contains an unknown location: ${location}`);
    }
  }
}

process.stdout.write(
  `${JSON.stringify(
    {
      sourceRef: manifest.sourceRef,
      sourceCommit: manifest.sourceCommit,
      totals: manifest.totals,
      executablePrograms,
      modeRegistrations,
      verifiedPasses: {
        cold: coldBaseline.audit.passed,
        polyfill: polyfillBaseline.audit.passed,
      },
      categories: Object.fromEntries([...categories].sort(([left], [right]) => left.localeCompare(right))),
    },
    null,
    2
  )}\n`
);
