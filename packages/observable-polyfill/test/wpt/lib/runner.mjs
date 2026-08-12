import fs from 'node:fs/promises';
import path from 'node:path';
import { browserIsolationArgs, resolveBrowserBinaries, verifyBrowser } from './browser.mjs';
import { readBrowserLock, readConfig, readJson } from './config.mjs';
import { listFiles, pathExists, replaceDirectory } from './files.mjs';
import {
  auditReport,
  compareStableReports,
  createExpectedResults,
  formatWptConsoleReport,
  normalizeReport,
} from './report.mjs';
import { runProcess } from './process.mjs';
import { verifyVendoredImport } from './provenance.mjs';
import { prepareShadowTree } from './shadow.mjs';
import {
  cacheRoot,
  expectedResultsPath,
  expectationsRoot,
  inventoryPath,
  provenancePath,
  reportsRoot,
  upstreamRoot,
} from './paths.mjs';

async function verifyImportFiles(config) {
  const [provenance, inventory] = await Promise.all([readJson(provenancePath), readJson(inventoryPath)]);
  const problems = await verifyVendoredImport({
    config,
    provenance,
    inventory,
    upstreamRoot,
    expectationsRoot,
  });
  if (problems.length > 0) {
    throw new Error(`Pinned WPT import verification failed:\n- ${problems.join('\n- ')}`);
  }
  return { provenance, inventory };
}

function compareVersions(left, right) {
  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index++) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) {
      return Math.sign(difference);
    }
  }
  return 0;
}

export async function resolvePython(config) {
  const requestedExecutable = process.env.RXJS_WPT_PYTHON_BINARY ?? 'python3';
  const probeSource =
    'import json, platform, sys; ' +
    'print(json.dumps({"executable": sys.executable, "version": platform.python_version()}))';
  const { stdout } = await runProcess(requestedExecutable, ['-c', probeSource], {
    capture: true,
  });
  let result;
  try {
    result = JSON.parse(stdout.trim());
  } catch {
    throw new Error(`Could not inspect WPT Python from ${requestedExecutable}: ${stdout.trim()}`);
  }
  if (
    typeof result.executable !== 'string' ||
    typeof result.version !== 'string' ||
    !/^\d+\.\d+\.\d+$/.test(result.version)
  ) {
    throw new Error(`Malformed WPT Python probe result: ${JSON.stringify(result)}`);
  }
  if (compareVersions(result.version, config.runner.minimumPythonVersion) < 0) {
    throw new Error(
      `Observable WPT requires Python ${config.runner.minimumPythonVersion} or newer; got ${result.version}`
    );
  }
  return {
    executable: path.resolve(result.executable),
    version: result.version,
    cacheKey: `${process.platform}-${process.arch}-python-${result.version}`,
  };
}

async function ensureRunnerCheckout(config, python) {
  const environmentRoot = process.env.RXJS_WPT_RUNNER_ROOT;
  if (environmentRoot) {
    const checkoutRoot = path.resolve(environmentRoot);
    const { stdout } = await runProcess('git', ['rev-parse', 'HEAD'], {
      cwd: checkoutRoot,
      capture: true,
    });
    if (stdout.trim() !== config.wpt.commit) {
      throw new Error(`RXJS_WPT_RUNNER_ROOT is at ${stdout.trim()}, expected ${config.wpt.commit}`);
    }
    return checkoutRoot;
  }

  const runnerParent = path.join(cacheRoot, 'runner', config.wpt.commit, python.cacheKey);
  const checkoutRoot = path.join(runnerParent, 'wpt');
  if (await pathExists(path.join(checkoutRoot, '.git'))) {
    const { stdout } = await runProcess('git', ['rev-parse', 'HEAD'], {
      cwd: checkoutRoot,
      capture: true,
    });
    if (stdout.trim() === config.wpt.commit) {
      return checkoutRoot;
    }
  }

  if (process.env.RXJS_WPT_OFFLINE === '1') {
    throw new Error('Pinned WPT runner is not cached and RXJS_WPT_OFFLINE=1');
  }

  const stagingRoot = `${runnerParent}.staging`;
  await fs.rm(stagingRoot, { recursive: true, force: true });
  await fs.mkdir(stagingRoot, { recursive: true });
  await runProcess('git', ['init', '--quiet'], { cwd: stagingRoot });
  await runProcess('git', ['remote', 'add', 'origin', config.wpt.repository], { cwd: stagingRoot });
  await runProcess('git', ['sparse-checkout', 'init', '--no-cone'], { cwd: stagingRoot });
  await runProcess(
    'git',
    ['sparse-checkout', 'set', '--no-cone', '/wpt', '/wpt.py', '/docs/commands.json', '/tools/'],
    { cwd: stagingRoot }
  );
  await runProcess(
    'git',
    ['fetch', '--quiet', '--depth=1', '--filter=blob:none', 'origin', config.wpt.commit],
    { cwd: stagingRoot }
  );
  await runProcess('git', ['checkout', '--quiet', '--detach', 'FETCH_HEAD'], { cwd: stagingRoot });

  await fs.rm(runnerParent, { recursive: true, force: true });
  await fs.mkdir(runnerParent, { recursive: true });
  await fs.rename(stagingRoot, checkoutRoot);
  return checkoutRoot;
}

function wptEnvironmentRoot(checkoutRoot, config, python) {
  if (process.env.RXJS_WPT_RUNNER_ROOT) {
    return path.join(cacheRoot, 'runner-venv', config.wpt.commit, python.cacheKey);
  }
  return path.join(path.dirname(checkoutRoot), 'venv');
}

function wptCommand(checkoutRoot, config, python) {
  const venvRoot = wptEnvironmentRoot(checkoutRoot, config, python);
  const venvPython = path.join(venvRoot, process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  if (process.env.RXJS_WPT_OFFLINE === '1') {
    return {
      command: venvPython,
      args: [path.join(checkoutRoot, 'wpt'), '--venv', venvRoot, '--skip-venv-setup'],
    };
  }
  return {
    command: python.executable,
    args: [path.join(checkoutRoot, 'wpt'), '--venv', venvRoot],
  };
}

async function ensureWptEnvironment({ checkoutRoot, config, python }) {
  const invocation = wptCommand(checkoutRoot, config, python);
  if (
    process.env.RXJS_WPT_OFFLINE === '1' &&
    !(await pathExists(invocation.command))
  ) {
    throw new Error(
      `Pinned WPT Python environment is not cached for ${python.cacheKey} and RXJS_WPT_OFFLINE=1`
    );
  }
  await runProcess(invocation.command, [...invocation.args, 'run', '--help'], {
    cwd: checkoutRoot,
    capture: true,
    timeoutMs: 2 * 60 * 1000,
  });
  return {
    ...python,
    environmentRoot: wptEnvironmentRoot(checkoutRoot, config, python),
  };
}

function createRunId(tag) {
  const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
  return `${timestamp}-${tag}`;
}

async function readExpectedResults() {
  if (!(await pathExists(expectedResultsPath))) {
    return undefined;
  }
  return readJson(expectedResultsPath);
}

async function writeAuditFiles({
  runRoot,
  audit,
  bundleManifest,
  config,
  expectedUrlCount,
  mode,
  reportPath,
  humanLogPath,
  rawLogPath,
}) {
  const iframeRequirements = new Map(
    Object.entries(config.reviewedIframeFiles).map(([filePath, review]) => [
      `/${filePath.replace(/\.window\.js$/, '.window.html')}`,
      review.childRealmCount,
    ])
  );
  const attestations = audit.attestations.map((attestation) => ({
    ...attestation,
    realms: attestation.test.endsWith('.worker.html')
      ? ['dedicated-worker']
      : iframeRequirements.has(attestation.test)
        ? ['window', 'same-origin-iframe']
        : ['window'],
    ...(iframeRequirements.has(attestation.test)
      ? { sameOriginIframeCount: iframeRequirements.get(attestation.test) }
      : {}),
  }));
  await fs.writeFile(
    path.join(runRoot, 'attestations.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        wptCommit: config.wpt.commit,
        implementationId: bundleManifest.implementationId,
        attestations,
      },
      null,
      2
    )}\n`
  );
  await fs.writeFile(
    path.join(runRoot, 'audit.json'),
    `${JSON.stringify(
      {
        ok: audit.ok,
        problems: audit.problems,
        implementationId: bundleManifest.implementationId,
      },
      null,
      2
    )}\n`
  );
  const consoleReport = formatWptConsoleReport({
    audit,
    mode,
    expectedUrlCount,
    implementationId: bundleManifest.implementationId,
    reportPath,
    humanLogPath,
    rawLogPath,
    runRoot,
  });
  await fs.writeFile(path.join(runRoot, 'status-diff.txt'), consoleReport);
  return consoleReport;
}

export async function doctor({ allowDownload = true } = {}) {
  const [config, browserLock] = await Promise.all([readConfig(), readBrowserLock()]);
  const { inventory } = await verifyImportFiles(config);
  const { shadowRoot, bundleManifest } = await prepareShadowTree({ config, inventory });
  const python = await resolvePython(config);
  const runnerRoot = await ensureRunnerCheckout(config, python);
  const pythonEnvironment = await ensureWptEnvironment({
    checkoutRoot: runnerRoot,
    config,
    python,
  });
  const binaries = await resolveBrowserBinaries({ config, browserLock, allowDownload });
  const allowBrowserDrift = process.env.RXJS_WPT_ALLOW_BROWSER_DRIFT === '1';
  const browser = await verifyBrowser({ config, binaries, allowBrowserDrift });

  return {
    config,
    inventory,
    shadowRoot,
    bundleManifest,
    runnerRoot,
    python: pythonEnvironment,
    binaries,
    browser,
  };
}

export async function runWpt({
  baseline = false,
  recordOnly = false,
  tag = baseline ? 'baseline' : recordOnly ? 'record' : 'conformance',
  onProgress = () => undefined,
} = {}) {
  const mode = baseline ? 'baseline' : recordOnly ? 'recording' : 'conformance';
  const strict = !baseline && !recordOnly;
  onProgress(`Preparing Observable WPT ${mode} run...`);
  const context = await doctor({ allowDownload: true });
  const { config, inventory, shadowRoot, bundleManifest, runnerRoot, python, binaries } = context;
  const runRoot = path.join(reportsRoot, createRunId(tag));
  await fs.mkdir(runRoot, { recursive: true });

  const reportPath = path.join(runRoot, 'wptreport.json');
  const rawLogPath = path.join(runRoot, 'wpt.raw.log');
  const humanLogPath = path.join(runRoot, 'wpt.log');
  const manifestPath = path.join(shadowRoot, 'MANIFEST.json');
  const emptyMojoRoot = path.join(cacheRoot, 'empty-mojojs');
  await fs.mkdir(emptyMojoRoot, { recursive: true });

  const invocation = wptCommand(runnerRoot, config, python);
  const args = [
    ...invocation.args,
    'run',
    '--tests',
    shadowRoot,
    '--metadata',
    shadowRoot,
    '--manifest',
    manifestPath,
    '--manifest-update',
    '--no-manifest-download',
    '--binary',
    binaries.chrome,
    '--webdriver-binary',
    binaries.chromedriver,
    '--channel',
    'stable',
    '--no-enable-experimental',
    '--mojojs-path',
    emptyMojoRoot,
    '--headless',
    '--processes',
    String(config.runner.processes),
    '--timeout-multiplier',
    '1',
    '--max-restarts',
    '0',
    '--retry-unexpected',
    '0',
    '--binary-arg=--js-flags=--expose-gc',
    '--binary-arg=--disable-dev-shm-usage',
    ...(process.platform === 'linux' ? ['--binary-arg=--no-sandbox'] : []),
    ...browserIsolationArgs.map((argument) => `--binary-arg=${argument}`),
    '--no-fail-on-unexpected',
    '--log-wptreport',
    reportPath,
    '--log-raw',
    rawLogPath,
    '--log-mach',
    humanLogPath,
    '--include',
    config.wpt.testPrefix,
    config.browser.product,
  ];

  onProgress(
    `Running ${inventory.length} pinned Observable WPT URLs in Chrome ${context.browser.versions.chrome}...`
  );
  await runProcess(invocation.command, args, {
    cwd: runnerRoot,
    capture: true,
    timeoutMs: config.runner.timeoutMinutes * 60 * 1000,
  });
  if (!(await pathExists(reportPath))) {
    throw new Error('The WPT runner exited without producing wptreport.json');
  }

  const [report, expectedResults] = await Promise.all([
    readJson(reportPath),
    baseline ? readExpectedResults() : Promise.resolve(undefined),
  ]);
  const audit = auditReport({
    report,
    inventory,
    bundleSha256: bundleManifest.bundleSha256,
    attestationNamePrefix: config.attestation.namePrefix,
    expectedResults,
    strict,
    expectedWptCommit: config.wpt.commit,
    expectedBrowserVersion: config.browser.version,
    allowBrowserDrift: process.env.RXJS_WPT_ALLOW_BROWSER_DRIFT === '1',
    requireBaseline: baseline,
  });
  onProgress('Auditing completeness, RxJS identity, and WPT results...');
  const consoleReport = await writeAuditFiles({
    runRoot,
    audit,
    bundleManifest,
    config,
    expectedUrlCount: inventory.length,
    mode,
    reportPath,
    humanLogPath,
    rawLogPath,
  });

  if (!audit.ok) {
    const error = new Error(`Observable WPT ${mode} failed`);
    error.name = 'ObservableWptAuditError';
    error.consoleReport = consoleReport;
    throw error;
  }

  return {
    ...context,
    runRoot,
    reportPath,
    rawLogPath,
    humanLogPath,
    report,
    audit,
    consoleReport,
  };
}

async function replaceExpectationsFromMetadata(metadataRoot) {
  const stagingRoot = `${expectationsRoot}.staging`;
  await fs.rm(stagingRoot, { recursive: true, force: true });
  await fs.mkdir(stagingRoot, { recursive: true });

  for (const filePath of await listFiles(metadataRoot)) {
    if (!filePath.endsWith('.ini')) {
      continue;
    }
    const targetPath = path.join(stagingRoot, filePath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(path.join(metadataRoot, filePath), targetPath);
  }
  await replaceDirectory(stagingRoot, expectationsRoot);
}

export async function updateExpectations() {
  const runs = [];
  for (let index = 0; index < 3; index++) {
    runs.push(await runWpt({ recordOnly: true, tag: `expectations-${index + 1}` }));
  }

  const normalizedReports = runs.map((run) =>
    normalizeReport(run.report, run.config.attestation.namePrefix)
  );
  compareStableReports(normalizedReports);

  const firstRun = runs[0];
  const metadataRoot = path.join(cacheRoot, 'metadata-update');
  await fs.rm(metadataRoot, { recursive: true, force: true });
  await fs.mkdir(metadataRoot, { recursive: true });
  const manifestPath = path.join(firstRun.shadowRoot, 'MANIFEST.json');
  await fs.copyFile(manifestPath, path.join(metadataRoot, 'MANIFEST.json'));

  const invocation = wptCommand(firstRun.runnerRoot, firstRun.config, firstRun.python);
  await runProcess(
    invocation.command,
    [
      ...invocation.args,
      'update-expectations',
      '--product',
      firstRun.config.browser.product,
      '--tests',
      firstRun.shadowRoot,
      '--metadata',
      metadataRoot,
      '--manifest',
      manifestPath,
      '--full',
      '--no-properties-file',
      ...runs.map((run) => run.rawLogPath),
    ],
    { cwd: firstRun.runnerRoot, capture: true }
  );

  for (const filePath of await listFiles(metadataRoot)) {
    if (!filePath.endsWith('.ini')) {
      continue;
    }
    const source = await fs.readFile(path.join(metadataRoot, filePath), 'utf8');
    if (
      source.includes(firstRun.config.attestation.namePrefix) ||
      source.includes(firstRun.config.attestation.functionKey)
    ) {
      throw new Error(`Generated metadata attempted to allowlist attestation: ${filePath}`);
    }
  }

  await replaceExpectationsFromMetadata(metadataRoot);
  const expectedResults = createExpectedResults({
    config: firstRun.config,
    normalizedReport: normalizedReports[0],
  });
  await fs.writeFile(expectedResultsPath, `${JSON.stringify(expectedResults, null, 2)}\n`);

  await verifyImportFiles(firstRun.config);
  return { runs, expectedResults };
}

export async function verifyImport() {
  const config = await readConfig();
  return verifyImportFiles(config);
}
