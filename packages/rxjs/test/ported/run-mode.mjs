#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { clearLine, cursorTo } from 'node:readline';

const requested = process.argv[2] ?? 'all';
const vitestArguments = process.argv.slice(3);
const supportedModes = new Set(['cold', 'polyfill', 'native', 'audit', 'audit-polyfill']);
const modes = requested === 'all' ? ['cold', 'polyfill'] : [requested];
// One process avoids repeating Vitest collection and transformation for every
// shard. Diagnostic runs can still request isolation explicitly.
const shardCount = parsePositiveIntegerEnvironment('RXJS_NEXT_SHARD_COUNT', 1);
const maxConcurrentShards = parsePositiveIntegerEnvironment('RXJS_NEXT_SHARD_CONCURRENCY', 8);
const progressIntervalMilliseconds = parsePositiveIntegerEnvironment('RXJS_NEXT_PROGRESS_INTERVAL_MS', 10_000);
const packageDirectory = resolve(import.meta.dirname, '../..');
const workspaceDirectory = resolve(packageDirectory, '../..');
const vitest = resolve(workspaceDirectory, 'node_modules/vitest/vitest.mjs');
const manifestPath = resolve(import.meta.dirname, 'manifest.generated.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const friendlyOutput = vitestArguments.length === 0 && modes.every((mode) => mode !== 'audit' && mode !== 'audit-polyfill');
let exitCode = 0;
const modeResults = [];

if (friendlyOutput) {
  process.stdout.write(`\nRxJS 7 ported marble tests\n\n`);
}
for (const mode of modes) {
  if (!supportedModes.has(mode)) {
    throw new Error(`Unknown ported-test mode: ${mode}`);
  }
  if (friendlyOutput && !(mode === 'native' && typeof globalThis.Observable !== 'function')) {
    process.stdout.write(`  ${modeLabel(mode)}  RUN   ${formatCount(manifest.totals.cases)} cases\n`);
  }
  const result = await runMode(mode);
  modeResults.push(result);
  if (result.exitCode !== 0) {
    exitCode = result.exitCode;
  }
  if (friendlyOutput) {
    writeModeResult(result);
  }
}

if (friendlyOutput) {
  writeFinalResult(modeResults);
}
process.exitCode = exitCode;

async function runMode(mode) {
  // When no native implementation exists, the friendly launcher reports one
  // explicit skip; direct Vitest output retains the per-shard skips.
  const requestedAudit = mode === 'audit' || mode === 'audit-polyfill';
  const activeMode = mode === 'audit' ? 'cold' : mode === 'audit-polyfill' ? 'polyfill' : mode;
  if (friendlyOutput && activeMode === 'native' && typeof globalThis.Observable !== 'function') {
    return { activeMode, exitCode: 0, failedShards: 0, skipped: true };
  }
  const jsonOutput = parseJsonOutputArguments(vitestArguments);
  if (!requestedAudit && activeMode !== 'native' && jsonOutput.requested) {
    throw new Error('Sharded JSON output is supported only for audit and explicit native modes.');
  }
  if ((requestedAudit || activeMode === 'native') && jsonOutput.partial) {
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
      ...(friendlyOutput ? ['--reporter=dot'] : []),
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
        runChild(
          [vitest, '--run', ...files, ...childArguments],
          {
            ...process.env,
            RXJS_NEXT_SHARD_COUNT: String(shardCount),
            RXJS_NEXT_SHARD_INDEX: String(shardIndex),
            RXJS_NEXT_TEST_MODE: activeMode,
          },
          friendlyOutput
        ),
    };
  });

  const progress = friendlyOutput
    ? createProgressReporter(activeMode, children.length, Math.min(maxConcurrentShards, children.length))
    : undefined;
  progress?.start();
  let results;
  try {
    results = await runBounded(children, maxConcurrentShards, (result, shardIndex, completedShards) => {
      progress?.complete(result, shardIndex, completedShards);
    });
  } finally {
    progress?.stop();
  }
  const failedResults = results.map((result, index) => ({ ...result, shard: index + 1 })).filter((result) => result.exitCode !== 0);
  if (friendlyOutput) {
    for (const result of failedResults) {
      process.stderr.write(
        `\n${activeMode.toUpperCase()} shard ${result.shard}/${shardCount} failed:\n${cleanFailureOutput(result.output)}\n`
      );
    }
  }
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

  return {
    activeMode,
    exitCode: results.reduce((code, result) => (result.exitCode === 0 ? code : result.exitCode), 0),
    failedShards: failedResults.length,
    skipped: false,
  };
}

function runChild(arguments_, environment, captureOutput) {
  return new Promise((resolvePromise) => {
    const output = [];
    const child = spawn(process.execPath, arguments_, {
      cwd: packageDirectory,
      env: environment,
      stdio: captureOutput ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });
    if (captureOutput) {
      child.stdout.on('data', (chunk) => output.push(String(chunk)));
      child.stderr.on('data', (chunk) => output.push(String(chunk)));
    }
    child.once('error', (error) => {
      const diagnostic = `Could not start ported-test shard: ${error.message}\n`;
      if (!captureOutput) {
        process.stderr.write(diagnostic);
      }
      output.push(diagnostic);
      resolvePromise({ exitCode: 1, output: output.join('') });
    });
    child.once('exit', (code, signal) => {
      if (signal) {
        const diagnostic = `Ported-test shard terminated by signal ${signal}; its evidence is incomplete.\n`;
        if (!captureOutput) {
          process.stderr.write(diagnostic);
        }
        output.push(diagnostic);
        resolvePromise({ exitCode: 1, output: output.join('') });
        return;
      }
      resolvePromise({ exitCode: code ?? 1, output: output.join('') });
    });
  });
}

async function runBounded(children, concurrency, onComplete = () => {}) {
  const results = new Array(children.length);
  let nextIndex = 0;
  let completed = 0;
  const workers = Array.from({ length: Math.min(concurrency, children.length) }, async () => {
    while (true) {
      const childIndex = nextIndex++;
      if (childIndex >= children.length) {
        return;
      }
      const result = await children[childIndex].run();
      results[childIndex] = result;
      completed++;
      onComplete(result, childIndex, completed);
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

function modeLabel(mode) {
  return mode.toUpperCase().padEnd(8);
}

function formatCount(value) {
  return value.toLocaleString('en-US');
}

function writeModeResult(result) {
  if (result.skipped) {
    process.stdout.write(`  ${modeLabel(result.activeMode)}  SKIP  no native global Observable in this runtime\n`);
    return;
  }

  const detail = `${formatCount(manifest.totals.cases)} ported cases`;
  const lifecycle = result.activeMode === 'polyfill' ? ' plus platform lifecycle coverage' : '';
  if (result.exitCode === 0) {
    process.stdout.write(`  ${modeLabel(result.activeMode)}  PASS  ${detail}${lifecycle}\n`);
  } else {
    process.stdout.write(`  ${modeLabel(result.activeMode)}  FAIL  ${detail}; ${result.failedShards}/${shardCount} shards failed\n`);
  }
}

function writeFinalResult(results) {
  const failures = results.filter((result) => result.exitCode !== 0);
  const executed = results.filter((result) => !result.skipped);
  if (executed.length === 0) {
    process.stdout.write(`\nSKIP  Ported marble gate did not run because the requested runtime is unavailable.\n\n`);
    return;
  }
  if (failures.length === 0) {
    process.stdout.write(`\nPASS  Every enabled ported marble test passed in the requested modes.\n\n`);
  } else {
    process.stdout.write(`\nFAIL  Ported marble gate failed in ${failures.length}/${results.length} requested modes.\n\n`);
  }
}

function cleanFailureOutput(output) {
  return output.replace(/\[case-id:[^\]]+\]\s*/g, '').trim();
}

function createProgressReporter(activeMode, totalShards, concurrency) {
  const startedAt = Date.now();
  const interactive = Boolean(process.stdout.isTTY);
  let completedShards = 0;
  let failedShards = 0;
  let interval;

  return {
    start() {
      if (interactive) {
        writeProgress('started');
      }
      interval = setInterval(() => {
        if (interactive) {
          writeProgress('still running');
        }
      }, progressIntervalMilliseconds);
      interval.unref();
    },
    complete(result, shardIndex, completed) {
      completedShards = completed;
      if (result.exitCode !== 0) {
        failedShards++;
      }
      if (interactive) {
        writeProgress(`shard ${shardIndex + 1}/${totalShards} ${result.exitCode === 0 ? 'passed' : 'failed'}`);
      }
    },
    stop() {
      clearInterval(interval);
      if (interactive) {
        process.stdout.write('\n');
      } else {
        writeProgress('complete');
      }
    },
  };

  function writeProgress(status) {
    const remainingShards = totalShards - completedShards;
    const runningShards = Math.min(concurrency, remainingShards);
    const queuedShards = Math.max(0, remainingShards - runningShards);
    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    const line =
      `    ${modeLabel(activeMode)} ${completedShards}/${totalShards} complete; ${runningShards} running; ` +
      `${queuedShards} queued; ${failedShards} failed; ${elapsedSeconds}s (${status})`;
    if (interactive) {
      clearLine(process.stdout, 0);
      cursorTo(process.stdout, 0);
      process.stdout.write(line);
    } else {
      process.stdout.write(`${line}\n`);
    }
  }
}
