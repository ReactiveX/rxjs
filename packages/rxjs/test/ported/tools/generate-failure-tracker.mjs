#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const packageDirectory = resolve(toolDirectory, '../../..');
const repositoryRoot = resolve(packageDirectory, '../..');
const manifestPath = resolve(toolDirectory, '../manifest.generated.json');
const migrationReportPath = resolve(toolDirectory, '../migration-report.json');
const defaultLedgerPath = resolve(toolDirectory, '../failure-tracker-ledger.json');
const defaultOutputPath = resolve(repositoryRoot, 'docs/rxjs-next/RXJS_7_PORTED_FAILURES.md');
const allowedStatuses = new Set(['TODO', 'IN-PROCESS', 'FIXED', 'BLOCKED']);
const options = parseArguments(process.argv.slice(2));

if (!options.coldReport || !options.polyfillReport) {
  throw new Error(
    'Both --cold-report=<path> and --polyfill-report=<path> are required. ' +
      'Create them with the complete test:unit:audit and test:unit:audit:polyfill commands.'
  );
}

const ledgerPath = resolve(options.ledger ?? defaultLedgerPath);
const outputPath = resolve(options.output ?? defaultOutputPath);
const capturedAt = options.capturedAt ?? new Date().toISOString().slice(0, 10);
const [manifest, migrationReport, coldReport, polyfillReport, existingLedger] = await Promise.all([
  readJson(manifestPath),
  readJson(migrationReportPath),
  readJson(resolve(options.coldReport)),
  readJson(resolve(options.polyfillReport)),
  readOptionalJson(ledgerPath),
]);
const casesById = new Map(manifest.cases.map((testCase) => [testCase.id, testCase]));

const cold = validateReport(coldReport, 'cold', casesById, migrationReport);
const polyfill = validateReport(polyfillReport, 'polyfill', casesById, migrationReport);
const nextLedger = mergeLedger({
  capturedAt,
  cold,
  existingLedger,
  manifest,
  polyfill,
});
const prettierConfig = (await prettier.resolveConfig(outputPath)) ?? {};
const markdown = prettier.format(
  renderTracker({
    capturedAt,
    cold,
    ledger: nextLedger,
    manifest,
    outputPath,
    polyfill,
  }),
  { ...prettierConfig, filepath: outputPath }
);
const serializedLedger = `${JSON.stringify(nextLedger, null, 2)}\n`;

validateTracker(nextLedger, markdown, casesById, cold, polyfill);

if (options.check) {
  const [currentLedger, currentMarkdown] = await Promise.all([readFile(ledgerPath, 'utf8'), readFile(outputPath, 'utf8')]);
  if (currentLedger !== serializedLedger) {
    throw new Error(`${relative(repositoryRoot, ledgerPath)} is stale; regenerate the failure tracker.`);
  }
  if (currentMarkdown !== markdown) {
    throw new Error(`${relative(repositoryRoot, outputPath)} is stale; regenerate the failure tracker.`);
  }
  process.stdout.write(
    `Validated ${nextLedger.cases.length.toLocaleString('en-US')} tracked failures across ` +
      `${new Set(nextLedger.cases.map((item) => item.group)).size.toLocaleString('en-US')} work packets.\n`
  );
} else {
  await Promise.all([writeFile(ledgerPath, serializedLedger, 'utf8'), writeFile(outputPath, markdown, 'utf8')]);
  process.stdout.write(
    `Generated ${relative(repositoryRoot, outputPath)} with ` +
      `${nextLedger.cases.length.toLocaleString('en-US')} tracked failures across ` +
      `${new Set(nextLedger.cases.map((item) => item.group)).size.toLocaleString('en-US')} work packets.\n`
  );
}

function parseArguments(arguments_) {
  const parsed = {
    capturedAt: undefined,
    check: false,
    coldReport: undefined,
    ledger: undefined,
    output: undefined,
    polyfillReport: undefined,
  };
  for (const argument of arguments_) {
    if (argument === '--') {
      continue;
    }
    if (argument === '--check') {
      parsed.check = true;
      continue;
    }
    const match = argument.match(/^--([^=]+)=(.+)$/);
    if (!match) {
      throw new Error(`Unknown argument: ${argument}`);
    }
    const [, name, value] = match;
    if (name === 'captured-at') {
      parsed.capturedAt = value;
    } else if (name === 'cold-report') {
      parsed.coldReport = value;
    } else if (name === 'ledger') {
      parsed.ledger = value;
    } else if (name === 'output') {
      parsed.output = value;
    } else if (name === 'polyfill-report') {
      parsed.polyfillReport = value;
    } else {
      throw new Error(`Unknown argument: --${name}`);
    }
  }
  if (parsed.capturedAt && !/^\d{4}-\d{2}-\d{2}$/.test(parsed.capturedAt)) {
    throw new Error(`--captured-at must use YYYY-MM-DD; received ${parsed.capturedAt}.`);
  }
  return parsed;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function readOptionalJson(path) {
  try {
    return await readJson(path);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

function validateReport(report, mode, casesById, migrationReport) {
  const suiteMode = mode === 'cold' ? 'cold' : 'platform';
  const migratedFiles = new Map(migrationReport.modes[suiteMode].map((entry) => [entry.file, entry]));
  const mappedAssertions = [];
  for (const testResult of report.testResults) {
    const file = relative(packageDirectory, testResult.name).replaceAll('\\', '/');
    const migratedFile = migratedFiles.get(file);
    if (!migratedFile) {
      throw new Error(`${mode} report contains an unexpected test file: ${file}`);
    }
    if (testResult.assertionResults.length !== migratedFile.caseIds.length) {
      throw new Error(
        `${mode} result count does not match the migration report for ${file}: ` +
          `${testResult.assertionResults.length} results, ${migratedFile.caseIds.length} case IDs.`
      );
    }
    for (const [index, assertion] of testResult.assertionResults.entries()) {
      mappedAssertions.push({ assertion, caseId: migratedFile.caseIds[index] });
    }
  }
  const assertions = mappedAssertions.map(({ assertion }) => assertion);
  const passed = assertions.filter((assertion) => assertion.status === 'passed');
  const failed = assertions.filter((assertion) => assertion.status === 'failed');
  const incomplete = assertions.filter((assertion) => assertion.status !== 'passed' && assertion.status !== 'failed');
  if (
    report.numTotalTests !== assertions.length ||
    report.numPassedTests !== passed.length ||
    report.numFailedTests !== failed.length ||
    report.numPendingTests !== 0 ||
    report.numTodoTests !== 0 ||
    incomplete.length !== 0
  ) {
    throw new Error(
      `${mode} report is incomplete: report totals ${report.numTotalTests}/${report.numPassedTests}/` +
        `${report.numFailedTests}/${report.numPendingTests}, assertion totals ` +
        `${assertions.length}/${passed.length}/${failed.length}/${incomplete.length}.`
    );
  }
  if (assertions.length !== casesById.size) {
    throw new Error(`${mode} report covers ${assertions.length}/${casesById.size} manifest cases.`);
  }

  const assertionsById = new Map();
  for (const { assertion, caseId } of mappedAssertions) {
    if (!caseId || !casesById.has(caseId)) {
      throw new Error(`${mode} report contains an assertion without a known case ID: ${String(caseId)}`);
    }
    if (assertionsById.has(caseId)) {
      throw new Error(`${mode} report contains duplicate case ID: ${caseId}`);
    }
    assertionsById.set(caseId, assertion);
  }
  if (assertionsById.size !== casesById.size) {
    throw new Error(`${mode} report contains ${assertionsById.size}/${casesById.size} unique manifest case IDs.`);
  }
  return {
    assertionsById,
    failed: new Set(mappedAssertions.filter(({ assertion }) => assertion.status === 'failed').map(({ caseId }) => caseId)),
    failedCount: failed.length,
    passedCount: passed.length,
    total: assertions.length,
  };
}

function mergeLedger({ capturedAt, cold, existingLedger, manifest, polyfill }) {
  if (existingLedger && existingLedger.schemaVersion !== 1) {
    throw new Error(`Unsupported failure tracker ledger schema: ${String(existingLedger.schemaVersion)}`);
  }
  if (existingLedger && existingLedger.sourceCommit !== manifest.sourceCommit) {
    throw new Error(
      `Existing failure tracker uses RxJS 7 ${existingLedger.sourceCommit}; ` +
        `review the source revision change before replacing it with ${manifest.sourceCommit}.`
    );
  }

  const existingCases = new Map((existingLedger?.cases ?? []).map((item) => [item.id, item]));
  const currentFailures = new Set([...cold.failed, ...polyfill.failed]);
  const cohort = new Set([...existingCases.keys(), ...currentFailures]);
  const cases = [];

  for (const testCase of manifest.cases) {
    if (!cohort.has(testCase.id)) {
      continue;
    }
    const existing = existingCases.get(testCase.id);
    if (existing && !allowedStatuses.has(existing.status)) {
      throw new Error(`Case ${testCase.id} has invalid status: ${String(existing.status)}`);
    }
    if (existing?.status === 'BLOCKED' && !existing.blocker?.trim()) {
      throw new Error(`Blocked case ${testCase.id} must name its blocker.`);
    }
    const failingModes = modesFor(testCase.id, cold.failed, polyfill.failed);
    const firstObservedModes = existing?.firstObservedModes ?? failingModes;
    const status =
      failingModes.length === 0 && testCase.disposition !== 'missing-api'
        ? 'FIXED'
        : existing?.status === 'FIXED' || !existing
        ? 'TODO'
        : existing.status;
    cases.push({
      id: testCase.id,
      group: groupFor(testCase),
      status,
      blocker: status === 'BLOCKED' ? existing.blocker : null,
      firstObservedAt: existing?.firstObservedAt ?? capturedAt,
      firstObservedModes,
      lastObservedAt: capturedAt,
      failingModes,
      diagnostic:
        failingModes.length > 0 ? diagnosticFor(testCase, cold, polyfill) : existing?.diagnostic ?? truncate(testCase.reason, 260),
    });
  }

  const missingManifestCases = [...cohort].filter((caseId) => !manifest.cases.some((testCase) => testCase.id === caseId));
  if (missingManifestCases.length > 0) {
    throw new Error(`Tracked cases are absent from the current manifest: ${missingManifestCases.slice(0, 10).join(', ')}`);
  }

  return {
    schemaVersion: 1,
    sourceRef: manifest.sourceRef,
    sourceCommit: manifest.sourceCommit,
    initialCapturedAt: existingLedger?.initialCapturedAt ?? capturedAt,
    lastCapturedAt: capturedAt,
    cases,
  };
}

function modesFor(caseId, coldFailures, polyfillFailures) {
  return [...(coldFailures.has(caseId) ? ['cold'] : []), ...(polyfillFailures.has(caseId) ? ['polyfill'] : [])];
}

function groupFor(testCase) {
  const file = basename(testCase.source.path);
  const group = file
    .replace(/-spec\.ts$/, '')
    .replace(/\.spec\.ts$/, '')
    .replace(/\.ts$/, '');
  if (testCase.source.path === 'spec/testing/index-spec.ts') {
    return '@rxjs/test';
  }
  return group;
}

function diagnosticFor(testCase, cold, polyfill) {
  const diagnostics = [];
  for (const [mode, report] of [
    ['cold', cold],
    ['polyfill', polyfill],
  ]) {
    if (!report.failed.has(testCase.id)) {
      continue;
    }
    const assertion = report.assertionsById.get(testCase.id);
    diagnostics.push([mode, conciseDiagnostic(assertion?.failureMessages?.[0], testCase.reason)]);
  }
  const unique = new Set(diagnostics.map(([, diagnostic]) => diagnostic));
  if (unique.size === 1) {
    return diagnostics[0][1];
  }
  return diagnostics.map(([mode, diagnostic]) => `${mode}: ${diagnostic}`).join('; ');
}

function conciseDiagnostic(failureMessage, fallback) {
  if (!failureMessage) {
    return truncate(fallback, 260);
  }
  const marker = 'Converted-program diagnostic:';
  const markerIndex = failureMessage.indexOf(marker);
  const diagnostic = markerIndex >= 0 ? failureMessage.slice(markerIndex + marker.length) : failureMessage;
  const line = diagnostic
    .split('\n')
    .map((item) => item.trim())
    .find(Boolean);
  return truncate(line ?? fallback, 260);
}

function truncate(value, length) {
  const normalized = String(value).replace(/\s+/g, ' ').trim();
  return normalized.length <= length ? normalized : `${normalized.slice(0, length - 1)}…`;
}

function renderTracker({ capturedAt, cold, ledger, manifest, outputPath, polyfill }) {
  const manifestById = new Map(manifest.cases.map((testCase) => [testCase.id, testCase]));
  const groups = groupCases(ledger.cases, manifestById);
  const failingNow = ledger.cases.filter((item) => item.failingModes.length > 0);
  const fixed = ledger.cases.filter((item) => item.status === 'FIXED');
  const coldOnly = failingNow.filter((item) => item.failingModes.length === 1 && item.failingModes[0] === 'cold').length;
  const polyfillOnly = failingNow.filter((item) => item.failingModes.length === 1 && item.failingModes[0] === 'polyfill').length;
  const both = failingNow.filter((item) => item.failingModes.length === 2).length;
  const firstPacket = orderedWorkPackets(groups, manifestById).find(
    (group) =>
      group.status !== 'FIXED' &&
      group.cases.some(
        (item) =>
          item.status !== 'FIXED' && !isSchedulerLastCase(manifestById.get(item.id)) && !isMissingCapabilityDiagnostic(item.diagnostic)
      )
  );
  const recommendedPacketLine = firstPacket
    ? `- **Recommended next work packet:** [${packetId(firstPacket.name)}](#${packetAnchor(firstPacket.name)}) (\`${firstPacket.name}\`)`
    : '- **Recommended next work packet:** None; every tracked row is `FIXED`.';
  const auditStateLine =
    failingNow.length > 0
      ? 'The audit commands intentionally exit nonzero while parity failures remain:'
      : 'The authoritative audit commands now exit successfully:';
  const lines = [
    '# RxJS 7 ported-test failure tracker',
    '',
    '## Purpose and evidence',
    '',
    'This ledger records every RxJS 7 ported test that failed in the authoritative cold or polyfill audit. ' +
      'Rows remain after repair and move to `FIXED`, so the document preserves the original failure cohort.',
    '',
    `- **RxJS 7 source:** \`${manifest.sourceRef}\` at \`${manifest.sourceCommit}\``,
    `- **Evidence captured:** ${capturedAt}`,
    `- **Manifest coverage:** ${formatCount(manifest.cases.length)} cases in each mode`,
    `- **Cold:** ${formatCount(cold.passedCount)} passed; ${formatCount(cold.failedCount)} failed`,
    `- **Polyfill:** ${formatCount(polyfill.passedCount)} passed; ${formatCount(polyfill.failedCount)} failed`,
    `- **Unique tracked failures:** ${formatCount(ledger.cases.length)} across ${formatCount(groups.length)} owner groups`,
    `- **Current failure overlap:** ${formatCount(both)} both modes; ${formatCount(coldOnly)} cold only; ` +
      `${formatCount(polyfillOnly)} polyfill only`,
    `- **Fixed since first capture:** ${formatCount(fixed.length)}`,
    recommendedPacketLine,
    '',
    auditStateLine,
    '',
    '```sh',
    'pnpm --filter rxjs run test:unit:audit --reporter=json --outputFile=/tmp/rxjs-next-ported-cold.json',
    'pnpm --filter rxjs run test:unit:audit:polyfill --reporter=json --outputFile=/tmp/rxjs-next-ported-polyfill.json',
    'pnpm --filter rxjs run test:unit:failures:generate ' +
      '--cold-report=/tmp/rxjs-next-ported-cold.json ' +
      '--polyfill-report=/tmp/rxjs-next-ported-polyfill.json',
    '```',
    '',
    '## Status protocol',
    '',
    '| Status | Meaning |',
    '| --- | --- |',
    '| `TODO` | The test is still failing and is not actively assigned. |',
    '| `IN-PROCESS` | A contributor or delegated task is actively investigating or repairing the test. |',
    '| `FIXED` | The represented claim passes in both cold and polyfill modes in the latest complete audits. |',
    '| `BLOCKED` | A named architectural decision, prerequisite, or external dependency prevents the next concrete step. |',
    '',
    'Statuses are preserved in `packages/rxjs/test/ported/failure-tracker-ledger.json` by stable case ID. ' +
      'Set a case to `BLOCKED` only with a non-empty `blocker`; regeneration rejects unnamed blockers.',
    '',
    '## Failure ledger',
    '',
    'Each case appears exactly once under the RxJS 7 spec file that owns the behavior. A case that imports helper ' +
      'operators remains owned by its source spec rather than being duplicated across helpers.',
    '',
  ];

  for (const group of groups) {
    lines.push(
      `### \`${group.name}\``,
      '',
      `Owner source${group.paths.length === 1 ? '' : 's'}: ${group.paths.map((path) => `\`${path}\``).join(', ')}`,
      '',
      '| Case ID | Behavioral test | Source | Failing mode | Classification | Disposition | Concise failure | Status |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |'
    );
    for (const item of group.cases) {
      const testCase = manifestById.get(item.id);
      lines.push(
        `| ${code(item.id)} | ${escapeCell(testCase.behavioralClaim)} | ${code(
          `${testCase.source.path}:${testCase.source.line}`
        )} | ${escapeCell(formatModes(item.failingModes))} | ${code(testCase.classification)} | ` +
          `${code(testCase.disposition)} | ${escapeCell(item.diagnostic)} | ${code(item.status)} |`
      );
    }
    lines.push('');
  }

  lines.push(
    '## Actionable work packets',
    '',
    'Work packets are ordered for delegation: the small portable `never` harness correction first, then groups with ' +
      'portable or harness-rewrite evidence, mixed groups, and finally compatibility-only groups whose final surface ' +
      'may depend on the package and compatibility decisions. Claim a packet by changing its unresolved ledger rows ' +
      'to `IN-PROCESS`; do not introduce another project-level `NEXT` marker.',
    ''
  );

  for (const group of orderedWorkPackets(groups, manifestById)) {
    const counts = summarizeGroup(group, manifestById);
    lines.push(
      `### ${packetId(group.name)} — \`${group.name}\``,
      '',
      `- **Packet status:** \`${group.status}\``,
      `- **Evidence:** ${formatCount(group.cases.length)} tracked case(s); ${formatCount(counts.cold)} cold failures; ` +
        `${formatCount(counts.polyfill)} polyfill failures; ${formatCount(counts.fixed)} fixed.`,
      `- **Current surface/gap:** ${surfaceGap(counts)}`,
      `- **Required classification review:** ${classificationReview(counts)}`,
      `- **Implementation objective:** ${implementationObjective(group.name, counts)}`,
      `- **Dependencies or blocker:** ${dependencyText(counts)}`,
      '- **Verification:** Run both complete audit modes, regenerate this tracker, and run the normal strict ' +
        '`pnpm --filter rxjs run test:unit` gate. Confirm no unrelated owner group regresses.',
      '- **Completion bar:** Every affected case passes in both authoritative modes and is `FIXED`; any changed ' +
        'expectation has the required compatibility or intentional-divergence decision recorded.',
      '',
      `<details><summary>Affected case IDs (${formatCount(group.cases.length)})</summary>`,
      ''
    );
    for (const item of group.cases) {
      lines.push(`- ${code(item.id)}`);
    }
    lines.push('', '</details>', '');
  }

  lines.push(
    '## Tracker validation',
    '',
    `The generator validates that both reports cover all ${formatCount(manifest.cases.length)} unique manifest case IDs, ` +
      'that passed and failed totals reconcile, that every tracked row maps to a manifest case, that every row belongs ' +
      'to exactly one work packet, and that status and blocker rules hold.',
    '',
    'After generating, verify the committed files without rewriting them:',
    '',
    '```sh',
    'pnpm --filter rxjs run test:unit:failures:generate ' +
      '--cold-report=/tmp/rxjs-next-ported-cold.json ' +
      '--polyfill-report=/tmp/rxjs-next-ported-polyfill.json --check',
    '```',
    ''
  );
  return `${lines.join('\n')}`;
}

function groupCases(items, manifestById) {
  const grouped = new Map();
  for (const item of items) {
    const testCase = manifestById.get(item.id);
    const group = grouped.get(item.group) ?? {
      name: item.group,
      cases: [],
      paths: new Set(),
    };
    group.cases.push(item);
    group.paths.add(testCase.source.path);
    grouped.set(item.group, group);
  }
  return [...grouped.values()]
    .map((group) => ({
      ...group,
      paths: [...group.paths].sort(),
      cases: group.cases.sort((left, right) => left.id.localeCompare(right.id)),
      status: groupStatus(group.cases),
    }))
    .sort((left, right) => left.name.localeCompare(right.name, 'en', { sensitivity: 'base' }));
}

function groupStatus(cases) {
  if (cases.every((item) => item.status === 'FIXED')) {
    return 'FIXED';
  }
  if (cases.some((item) => item.status === 'IN-PROCESS')) {
    return 'IN-PROCESS';
  }
  if (cases.every((item) => item.status === 'FIXED' || item.status === 'BLOCKED')) {
    return 'BLOCKED';
  }
  return 'TODO';
}

function isSchedulerLastCase(testCase) {
  const schedulerMarkers =
    /(?:SchedulerLike|TestScheduler|VirtualTimeScheduler|asyncScheduler|asapScheduler|queueScheduler|animationFrameScheduler|subscribeOn|observeOn|scheduled)/;
  const importedSurface = testCase.imports.map((item) => `${item.module} ${item.imported} ${item.local}`).join(' ');
  return (
    testCase.source.path.startsWith('spec/schedulers/') ||
    testCase.source.path.startsWith('spec/testing/') ||
    schedulerMarkers.test(`${testCase.behavioralClaim} ${importedSurface}`)
  );
}

function isMissingCapabilityDiagnostic(diagnostic) {
  return /(?:Missing (?:operator )?capability| is not a function|not a constructor|Cannot read properties of undefined| is not defined|Required runtime capabilities are unavailable)/.test(
    diagnostic
  );
}

function orderedWorkPackets(groups, manifestById) {
  return [...groups].sort((left, right) => {
    if (left.name === 'never') {
      return -1;
    }
    if (right.name === 'never') {
      return 1;
    }
    const leftCounts = summarizeGroup(left, manifestById);
    const rightCounts = summarizeGroup(right, manifestById);
    const leftRank = packetRank(leftCounts);
    const rightRank = packetRank(rightCounts);
    return leftRank - rightRank || left.cases.length - right.cases.length || left.name.localeCompare(right.name);
  });
}

function packetRank(counts) {
  if (counts.compatibilityOnly === 0 && counts.unsupportedOrObsolete === 0) {
    return 0;
  }
  if (counts.portable + counts.harnessRewrite + counts.intentionalDivergence > 0) {
    return 1;
  }
  if (counts.unsupportedOrObsolete > 0 && counts.compatibilityOnly === 0) {
    return 2;
  }
  return 3;
}

function summarizeGroup(group, manifestById) {
  const summary = {
    active: 0,
    blocked: 0,
    cold: 0,
    compatibilityOnly: 0,
    deduplicated: 0,
    expectedFailure: 0,
    fixed: 0,
    harnessRewrite: 0,
    intentionalDivergence: 0,
    missingApi: 0,
    polyfill: 0,
    portable: 0,
    unsupportedDisposition: 0,
    unsupportedOrObsolete: 0,
  };
  for (const item of group.cases) {
    const testCase = manifestById.get(item.id);
    if (item.failingModes.includes('cold')) summary.cold++;
    if (item.failingModes.includes('polyfill')) summary.polyfill++;
    if (item.status === 'FIXED') summary.fixed++;
    if (item.status === 'BLOCKED') summary.blocked++;
    if (testCase.disposition === 'active') summary.active++;
    if (testCase.disposition === 'expected-failure') summary.expectedFailure++;
    if (testCase.disposition === 'missing-api') summary.missingApi++;
    if (testCase.disposition === 'deduplicated') summary.deduplicated++;
    if (testCase.disposition === 'unsupported-or-obsolete') summary.unsupportedDisposition++;
    if (testCase.classification === 'portable') summary.portable++;
    if (testCase.classification === 'harness-rewrite') summary.harnessRewrite++;
    if (testCase.classification === 'compatibility-only') summary.compatibilityOnly++;
    if (testCase.classification === 'intentional-divergence') summary.intentionalDivergence++;
    if (testCase.classification === 'unsupported-or-obsolete') summary.unsupportedOrObsolete++;
  }
  return summary;
}

function surfaceGap(counts) {
  const parts = [];
  if (counts.missingApi) parts.push(`${formatCount(counts.missingApi)} missing-capability case(s)`);
  if (counts.expectedFailure) parts.push(`${formatCount(counts.expectedFailure)} known mapped mismatch(es)`);
  if (counts.active) parts.push(`${formatCount(counts.active)} active-registration failure(s)`);
  if (counts.unsupportedDisposition) {
    parts.push(`${formatCount(counts.unsupportedDisposition)} unsupported/obsolete disposition(s)`);
  }
  if (counts.deduplicated) parts.push(`${formatCount(counts.deduplicated)} duplicate registration(s)`);
  return `${parts.join('; ') || 'No unresolved runtime gap recorded'}.`;
}

function classificationReview(counts) {
  const parts = [];
  if (counts.portable) parts.push(`${formatCount(counts.portable)} portable`);
  if (counts.harnessRewrite) parts.push(`${formatCount(counts.harnessRewrite)} harness rewrite`);
  if (counts.compatibilityOnly) parts.push(`${formatCount(counts.compatibilityOnly)} compatibility-only`);
  if (counts.intentionalDivergence) parts.push(`${formatCount(counts.intentionalDivergence)} intentional divergence`);
  if (counts.unsupportedOrObsolete) {
    parts.push(`${formatCount(counts.unsupportedOrObsolete)} unsupported/obsolete`);
  }
  return `${parts.join(
    '; '
  )}. Reconfirm each classification before changing production behavior; preserve the original claim in any harness rewrite.`;
}

function implementationObjective(groupName, counts) {
  if (groupName === 'never') {
    return (
      'Repair the migrated NEVER test by adding an explicit observation/unsubscription boundary so `rxTest` can ' +
      'finish while preserving the claim that the source emits and completes neither; do not change NEVER runtime semantics.'
    );
  }
  const actions = [];
  if (counts.harnessRewrite) {
    actions.push('correct converted harness programs while preserving their original behavioral claims');
  }
  if (counts.missingApi) {
    actions.push('define and implement each absent capability at the approved platform or compatibility boundary');
  }
  if (counts.expectedFailure || counts.active) {
    actions.push('reproduce and repair mapped runtime mismatches without weakening assertions');
  }
  if (counts.intentionalDivergence) {
    actions.push('record the accepted divergence and replace the old expectation with the approved platform behavior');
  }
  if (counts.unsupportedOrObsolete) {
    actions.push('review unsupported evidence and record rationale plus user impact before removal or replacement');
  }
  return `${capitalize(actions.join('; ') || `review and resolve the ${groupName} evidence`)}.`;
}

function dependencyText(counts) {
  const parts = [];
  if (counts.compatibilityOnly) {
    parts.push(
      'Compatibility-only cases must not be implemented in the platform layer; P0.2 and compatibility questions 10–13 may constrain their final package and surface'
    );
  }
  if (counts.unsupportedOrObsolete) {
    parts.push('unsupported/obsolete cases require rationale and user-impact review');
  }
  if (counts.blocked) {
    parts.push(`${formatCount(counts.blocked)} case(s) have named blockers in the ledger`);
  }
  return `${
    parts.join('; ') || 'None recorded'
  }. Mark individual rows \`BLOCKED\` only when a named dependency prevents the next concrete step.`;
}

function capitalize(value) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}

function packetId(groupName) {
  return `RX7-${groupName
    .replace(/@/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toUpperCase()}`;
}

function packetAnchor(groupName) {
  return `${packetId(groupName).toLowerCase()}--${groupName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/-+$/g, '');
}

function formatModes(modes) {
  return modes.length === 0 ? '—' : modes.join(' + ');
}

function formatCount(value) {
  return value.toLocaleString('en-US');
}

function code(value) {
  return `\`${String(value).replace(/`/g, '\\`')}\``;
}

function escapeCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function validateTracker(ledger, markdown, casesById, cold, polyfill) {
  const trackedIds = new Set();
  for (const item of ledger.cases) {
    if (!casesById.has(item.id)) {
      throw new Error(`Tracked case is absent from the manifest: ${item.id}`);
    }
    if (trackedIds.has(item.id)) {
      throw new Error(`Tracked case appears more than once: ${item.id}`);
    }
    if (!allowedStatuses.has(item.status)) {
      throw new Error(`Tracked case ${item.id} has invalid status: ${item.status}`);
    }
    if (item.status === 'BLOCKED' && !item.blocker?.trim()) {
      throw new Error(`Blocked case ${item.id} must name its blocker.`);
    }
    trackedIds.add(item.id);
  }
  const expectedFailures = new Set([...cold.failed, ...polyfill.failed]);
  for (const caseId of expectedFailures) {
    if (!trackedIds.has(caseId)) {
      throw new Error(`Current failure is missing from the tracker: ${caseId}`);
    }
  }
  const groups = new Set(ledger.cases.map((item) => item.group));
  for (const group of groups) {
    if (!markdown.includes(`### ${packetId(group)} — \`${group}\``)) {
      throw new Error(`Work packet is missing for group: ${group}`);
    }
  }
}
