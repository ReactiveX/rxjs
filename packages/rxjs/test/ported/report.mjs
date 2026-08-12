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

const baselineSummary = {};
for (const [expectedMode, baseline] of [
  ['cold', coldBaseline],
  ['polyfill', polyfillBaseline],
]) {
  if (baseline.mode !== expectedMode || baseline.sourceCommit !== manifest.sourceCommit || baseline.audit.total !== manifest.totals.cases) {
    throw new Error(`${expectedMode} baseline does not match the complete manifest source revision.`);
  }
  if (baseline.audit.passed + baseline.audit.failed !== baseline.audit.total) {
    throw new Error(`${expectedMode} baseline audit totals do not reconcile.`);
  }
  const resolution = resolveBaselineCaseIds(baseline, expectedMode);
  if (resolution.caseIds.size !== baseline.audit.passed) {
    throw new Error(`${expectedMode} baseline contains duplicate or incomplete passing case IDs.`);
  }
  baselineSummary[expectedMode] = summarizeBaseline(baseline, expectedMode, resolution);
}
baselineSummary.native = {
  status: 'unverified-raw',
  detail: 'Native-if-present mode runs every definition with ordinary test semantics until a dedicated native pass baseline is reviewed.',
};

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
      baselines: baselineSummary,
      categories: Object.fromEntries([...categories].sort(([left], [right]) => left.localeCompare(right))),
    },
    null,
    2
  )}\n`
);

function summarizeBaseline(baseline, expectedMode, resolution) {
  return {
    status: baseline.mode === expectedMode ? 'verified' : 'invalid',
    identity: resolution.identity,
    sourceCommit: baseline.sourceCommit,
    passed: baseline.audit.passed,
    failed: baseline.audit.failed,
    caseIds: resolution.caseIds.size,
  };
}

function resolveBaselineCaseIds(baseline, expectedMode) {
  if (Array.isArray(baseline.caseIds)) {
    const resolved = new Set(baseline.caseIds);
    for (const caseId of resolved) {
      if (!caseIds.has(caseId)) {
        throw new Error(`${expectedMode} baseline contains an unknown case ID: ${caseId}`);
      }
    }
    return { identity: 'caseIds', caseIds: resolved };
  }
  if (!Array.isArray(baseline.locations)) {
    throw new Error(`${expectedMode} baseline contains neither caseIds nor legacy locations.`);
  }

  const caseIdsByLocation = new Map();
  for (const testCase of manifest.cases) {
    const location = `${testCase.source.path}:${testCase.source.line}`;
    const ids = caseIdsByLocation.get(location) ?? [];
    ids.push(testCase.id);
    caseIdsByLocation.set(location, ids);
  }
  const resolved = new Set();
  for (const location of baseline.locations) {
    const ids = caseIdsByLocation.get(location) ?? [];
    if (ids.length === 0) {
      throw new Error(`${expectedMode} legacy baseline contains an unknown manifest location: ${location}`);
    }
    if (ids.length > 1) {
      throw new Error(
        `${expectedMode} legacy baseline location ${location} is ambiguous across ${ids.length} cases; run the audit and record a caseIds baseline.`
      );
    }
    resolved.add(ids[0]);
  }
  return { identity: 'legacy-locations', caseIds: resolved };
}
