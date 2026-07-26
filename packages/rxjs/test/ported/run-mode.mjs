#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const requested = process.argv[2] ?? 'all';
const vitestArguments = process.argv.slice(3);
const supportedModes = new Set(['cold', 'polyfill', 'native', 'audit', 'audit-polyfill']);
const modes = requested === 'all' ? ['cold', 'polyfill'] : [requested];
const shardCount = parsePositiveIntegerEnvironment('RXJS_NEXT_SHARD_COUNT', 16);
const maxConcurrentShards = parsePositiveIntegerEnvironment('RXJS_NEXT_SHARD_CONCURRENCY', 8);
const packageDirectory = resolve(import.meta.dirname, '../..');
const workspaceDirectory = resolve(packageDirectory, '../..');
const vitest = resolve(workspaceDirectory, 'node_modules/vitest/vitest.mjs');
const manifestPath = resolve(import.meta.dirname, 'manifest.generated.json');
let exitCode = 0;

for (const mode of modes) {
  if (!supportedModes.has(mode)) {
    throw new Error(`Unknown ported-test mode: ${mode}`);
  }
  const modeExitCode = await runMode(mode);
  if (modeExitCode !== 0) {
    exitCode = modeExitCode;
  }
}

process.exitCode = exitCode;

async function runMode(mode) {
  // Native implementations have no reviewed pass baseline yet. When present,
  // exercise every port as raw evidence instead of silently reusing the
  // polyfill baseline. When absent, each isolated shard reports an explicit
  // skip and shard zero also reports the lifecycle skips.
  const requestedAudit = mode === 'audit' || mode === 'audit-polyfill';
  const audit = requestedAudit || mode === 'native';
  const activeMode = mode === 'audit' ? 'cold' : mode === 'audit-polyfill' ? 'polyfill' : mode;
  const jsonOutput = parseJsonOutputArguments(vitestArguments);
  if (!audit && jsonOutput.requested) {
    throw new Error('Sharded JSON output is supported only for audit and explicit native modes.');
  }
  if (audit && jsonOutput.partial) {
    throw new Error('Sharded audit JSON output requires both --reporter=json and --outputFile.');
  }

  let evidenceDirectory;
  if (jsonOutput.requested) {
    evidenceDirectory = await mkdtemp(join(tmpdir(), `rxjs-ported-${activeMode}-shards-`));
  }

  const children = Array.from({ length: shardCount }, (_, shardIndex) => {
    const files = ['test/ported/ported.spec.ts'];
    if (activeMode !== 'cold' && !requestedAudit && shardIndex === 0) {
      files.push('test/ported/platform-lifecycle.spec.ts');
    }
    const childArguments = [
      ...jsonOutput.childArguments,
      '--no-file-parallelism',
      '--maxWorkers=1',
      '--minWorkers=1',
    ];
    let shardReportPath;
    if (evidenceDirectory) {
      shardReportPath = join(evidenceDirectory, `shard-${shardIndex + 1}-of-${shardCount}.json`);
      childArguments.push(`--outputFile=${shardReportPath}`);
    }
    return {
      reportPath: shardReportPath,
      run: () =>
        runChild([vitest, '--run', ...files, ...childArguments], {
          ...process.env,
          RXJS_NEXT_AUDIT: audit ? 'true' : 'false',
          RXJS_NEXT_SHARD_COUNT: String(shardCount),
          RXJS_NEXT_SHARD_INDEX: String(shardIndex),
          RXJS_NEXT_TEST_MODE: activeMode,
        }),
    };
  });

  const results = await runBounded(children, maxConcurrentShards);
  if (jsonOutput.requested) {
    const requestedOutputPath = resolve(packageDirectory, jsonOutput.outputFile);
    await mergeAuditReports(
      children.map((child) => child.reportPath),
      requestedOutputPath,
      activeMode
    );
    process.stdout.write(
      `Merged ${shardCount} complete ${activeMode} shard reports into ${requestedOutputPath}\nRetained shard evidence in ${evidenceDirectory}\n`
    );
  }

  return results.reduce((code, result) => (result === 0 ? code : result), 0);
}

function runChild(arguments_, environment) {
  return new Promise((resolvePromise) => {
    const child = spawn(process.execPath, arguments_, {
      cwd: packageDirectory,
      env: environment,
      stdio: 'inherit',
    });
    child.once('error', (error) => {
      process.stderr.write(`Could not start ported-test shard: ${error.message}\n`);
      resolvePromise(1);
    });
    child.once('exit', (code, signal) => {
      if (signal) {
        process.stderr.write(`Ported-test shard terminated by signal ${signal}; its evidence is incomplete.\n`);
        resolvePromise(1);
        return;
      }
      resolvePromise(code ?? 1);
    });
  });
}

async function runBounded(children, concurrency) {
  const results = new Array(children.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(concurrency, children.length) }, async () => {
    while (true) {
      const childIndex = nextIndex++;
      if (childIndex >= children.length) {
        return;
      }
      results[childIndex] = await children[childIndex].run();
    }
  });
  await Promise.all(workers);
  return results;
}

function parseJsonOutputArguments(arguments_) {
  let jsonReporter = false;
  let outputFile;
  const childArguments = [];
  for (let index = 0; index < arguments_.length; index++) {
    const argument = arguments_[index];
    if (argument === '--reporter' && arguments_[index + 1] === 'json') {
      jsonReporter = true;
      childArguments.push(argument, arguments_[++index]);
      continue;
    }
    if (argument === '--reporter=json') {
      jsonReporter = true;
      childArguments.push(argument);
      continue;
    }
    if (argument === '--outputFile') {
      outputFile = arguments_[++index];
      if (!outputFile) {
        throw new Error('--outputFile requires a path.');
      }
      continue;
    }
    if (argument.startsWith('--outputFile=')) {
      outputFile = argument.slice('--outputFile='.length);
      if (!outputFile) {
        throw new Error('--outputFile requires a path.');
      }
      continue;
    }
    childArguments.push(argument);
  }
  return {
    childArguments,
    outputFile,
    partial: jsonReporter !== Boolean(outputFile),
    requested: jsonReporter && Boolean(outputFile),
  };
}

async function mergeAuditReports(reportPaths, outputPath, activeMode) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const expectedCaseIds = new Set(manifest.cases.map((testCase) => testCase.id));
  const reports = await Promise.all(
    reportPaths.map(async (reportPath) => {
      if (!reportPath) {
        throw new Error('Missing shard report path.');
      }
      try {
        return JSON.parse(await readFile(reportPath, 'utf8'));
      } catch (error) {
        const diagnostic = error instanceof Error ? error.message : String(error);
        throw new Error(`Shard evidence is missing or invalid at ${reportPath}: ${diagnostic}`, { cause: error });
      }
    })
  );
  const seenCaseIds = new Set();

  for (const [index, report] of reports.entries()) {
    const assertions = report.testResults.flatMap((testResult) => testResult.assertionResults);
    const passed = assertions.filter((assertion) => assertion.status === 'passed').length;
    const failed = assertions.filter((assertion) => assertion.status === 'failed').length;
    const pending = assertions.length - passed - failed;
    if (
      report.numTotalTests !== assertions.length ||
      report.numPassedTests !== passed ||
      report.numFailedTests !== failed ||
      report.numPendingTests !== pending ||
      pending !== 0 ||
      report.numTodoTests !== 0
    ) {
      throw new Error(
        `${activeMode} shard ${index + 1}/${reports.length} is incomplete: report totals ` +
          `${report.numTotalTests}/${report.numPassedTests}/${report.numFailedTests}/${report.numPendingTests}, ` +
          `assertion totals ${assertions.length}/${passed}/${failed}/${pending}. Evidence: ${reportPaths[index]}`
      );
    }
    for (const assertion of assertions) {
      const caseId = parseCaseId(assertion.title);
      if (!caseId || !expectedCaseIds.has(caseId)) {
        throw new Error(
          `${activeMode} shard ${index + 1}/${reports.length} contains an assertion without a known case ID: ${assertion.title}`
        );
      }
      if (seenCaseIds.has(caseId)) {
        throw new Error(`${activeMode} shard reports contain duplicate case ID: ${caseId}`);
      }
      seenCaseIds.add(caseId);
    }
  }

  if (seenCaseIds.size !== expectedCaseIds.size) {
    const missing = [...expectedCaseIds].filter((caseId) => !seenCaseIds.has(caseId));
    throw new Error(
      `${activeMode} shard reports cover ${seenCaseIds.size}/${expectedCaseIds.size} manifest cases; ` +
        `first missing case IDs: ${missing.slice(0, 10).join(', ')}`
    );
  }

  const numericFields = [
    'numTotalTestSuites',
    'numPassedTestSuites',
    'numFailedTestSuites',
    'numPendingTestSuites',
    'numTotalTests',
    'numPassedTests',
    'numFailedTests',
    'numPendingTests',
    'numTodoTests',
  ];
  const merged = {
    startTime: Math.min(...reports.map((report) => report.startTime)),
    success: reports.every((report) => report.success),
    testResults: reports.flatMap((report) => report.testResults),
  };
  for (const field of numericFields) {
    merged[field] = reports.reduce((total, report) => total + (report[field] ?? 0), 0);
  }
  if (merged.numTotalTests !== expectedCaseIds.size || merged.numPendingTests !== 0) {
    throw new Error(
      `${activeMode} merged report is incomplete: ${merged.numTotalTests} total, ${merged.numPendingTests} pending, ${expectedCaseIds.size} required.`
    );
  }

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(merged)}\n`, 'utf8');
}

function parseCaseId(title) {
  const match = title.match(/^\[case-id:([^\]]+)\](?: |$)/);
  if (!match) {
    return null;
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function parsePositiveIntegerEnvironment(name, fallback) {
  const rawValue = process.env[name];
  if (rawValue === undefined) {
    return fallback;
  }
  const value = Number(rawValue);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive safe integer; received ${rawValue}.`);
  }
  return value;
}
