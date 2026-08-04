#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packagePaths = {
  '@rxjs/observable-polyfill': 'packages/observable-polyfill/package.json',
  '@rxjs/migrate': 'packages/migrate/package.json',
  '@rxjs/test': 'packages/test/package.json',
  rxjs: 'packages/rxjs/package.json',
};
const browserPackages = new Set(['@rxjs/observable-polyfill', '@rxjs/test', 'rxjs']);
const supportedNodeRange = '>=22.13.0';

export function auditReleaseCoherence(input) {
  const errors = [];
  const packageEntries = Object.entries(input.manifests);
  const versions = new Set(packageEntries.map(([, manifest]) => manifest.version));

  if (versions.size !== 1) {
    errors.push(`Release package versions differ: ${packageEntries.map(([name, manifest]) => `${name}@${manifest.version}`).join(', ')}`);
  }

  const [workspaceVersion] = versions;
  if (typeof workspaceVersion !== 'string' || workspaceVersion.length === 0) {
    errors.push('Release packages must have one non-empty shared version.');
  } else {
    requireDependency(input.manifests.rxjs, '@rxjs/observable-polyfill', workspaceVersion, errors);
    requireDependency(input.manifests['@rxjs/test'], 'rxjs', workspaceVersion, errors, 'peerDependencies');
    requireDependency(input.manifests['@rxjs/migrate'], '@types/node', '20.11.0', errors, 'devDependencies');

    for (const runtime of input.runtimeVersions) {
      if (runtime.version !== workspaceVersion) {
        errors.push(`${runtime.label} reports ${runtime.version}; expected ${workspaceVersion}.`);
      }
    }

    if (input.skillProvenance.packageName !== '@rxjs/migrate' || input.skillProvenance.packageVersion !== workspaceVersion) {
      errors.push(
        `Checked-in migration Skill provenance must report @rxjs/migrate@${workspaceVersion}; got ${input.skillProvenance.packageName}@${input.skillProvenance.packageVersion}.`
      );
    }
  }

  if (input.rootNodeEngine !== supportedNodeRange) {
    errors.push(`The repository Node engine must be ${supportedNodeRange}; got ${input.rootNodeEngine ?? 'no engine'}.`);
  }
  for (const [name, manifest] of packageEntries) {
    auditEsmDistribution(name, manifest, errors);
  }

  if (input.nxReleaseConfigured) {
    errors.push('Nx release configuration must remain removed; RxJS uses the repository-owned secure release policy.');
  }
  if (!input.preparePackagesCommand.includes('--exclude rxjs.dev')) {
    errors.push('Package preparation must explicitly exclude rxjs.dev.');
  }
  if (input.betaCommand !== 'node scripts/release/beta.mjs') {
    errors.push('The beta release command must remain node scripts/release/beta.mjs.');
  }

  auditReleaseMatrix(input, errors);

  return errors;
}

function auditReleaseMatrix(input, errors) {
  for (const version of ["'22.13.0'", "'24'", "'26'"]) {
    if (!input.ciWorkflowSource.includes(`node: ${version}`)) {
      errors.push(`The package CI matrix must include Node ${version.slice(1, -1)}.`);
    }
  }
  if (!input.ciWorkflowSource.includes('continue-on-error: ${{ matrix.advisory }}')) {
    errors.push('The Node 26 lane must remain explicitly advisory.');
  }
  for (const [command, label] of [
    [
      'Build migration-audit runtime dependency\n        run: pnpm --filter @rxjs/observable-polyfill run build',
      'the clean-workspace migration-audit runtime build',
    ],
    ['test:unit:audit:check', 'the exact RxJS 7 migration-evidence baselines'],
    ['test:bundle-analysis', 'bundle-analysis tooling tests'],
    ['test:release:safari', 'SafariDriver contract tests'],
    ['test:workflows', 'active-workflow parsing and formatting'],
    ['git fetch --no-tags --depth=1 origin 7.x:7.x', 'the RxJS 7 source ref required by migration-evidence freshness checks'],
    [
      'pnpm --filter @rxjs/observable-polyfill run build\n          pnpm --filter rxjs run build',
      'the clean-workspace release-package build before consumer tests',
    ],
  ]) {
    if (!input.ciWorkflowSource.includes(command)) {
      errors.push(`Package CI must retain ${label}.`);
    }
  }

  const readinessClaims = [
    ['chromium firefox webkit', 'Chrome, Firefox, and WebKit'],
    ['test:release:webpack', 'Webpack'],
    ['test:release:performance', 'performance budgets'],
    ['test:release:adoption', 'packed prerelease adoption'],
    ['version: 2.8.0', 'Deno 2.8.0'],
    ['version: 1.3.14', 'Bun 1.3.14'],
    ['target: [desktop, ios]', 'desktop and Mobile Safari'],
    ['boot-ios-simulator.mjs', 'explicit iOS simulator startup'],
    ["'safari:useSimulator': true", 'an actual Mobile Safari simulator'],
    ["'safari:deviceUDID'", 'the explicitly booted Mobile Safari simulator'],
    ['pnpm --filter @rxjs/test run build', 'the packed test-helper adoption prerequisite'],
    ['pnpm --filter @rxjs/migrate run build', 'the packed migration-tool adoption prerequisite'],
  ];
  const releaseMatrixSource = `${input.readinessWorkflowSource}\n${input.safariDriverSource}`;
  for (const [needle, label] of readinessClaims) {
    if (!releaseMatrixSource.includes(needle)) errors.push(`The release matrix must retain ${label} coverage.`);
  }

  for (const [label, source] of [
    ['package CI', input.ciWorkflowSource],
    ['release-readiness CI', input.readinessWorkflowSource],
    ['interactive beta release', input.betaSource],
  ]) {
    if (source.includes('rxjs.dev')) errors.push(`${label} must not build, test, publish, or otherwise reference rxjs.dev.`);
  }
  for (const requirement of [
    "{ name: '@rxjs/observable-polyfill', directory: 'packages/observable-polyfill' }",
    "{ name: '@rxjs/test', directory: 'packages/test' }",
    "{ name: '@rxjs/migrate', directory: 'packages/migrate' }",
    "{ name: 'rxjs', directory: 'packages/rxjs' }",
    "    '--tag',\n    'next',\n    '--access',\n    'public',",
    "assert.equal(branch, 'master'",
    'The release checkout must be clean.',
    'Unset NPM_TOKEN and NODE_AUTH_TOKEN',
    'npm publish dry runs',
    'registry integrity did not match the local tarball',
    'rxjs@latest unexpectedly resolves',
  ]) {
    if (!input.betaSource.includes(requirement)) errors.push(`Interactive beta publishing must retain ${requirement}.`);
  }

  requireMasterPush(input.ciWorkflowSource, 'Package CI', errors);
  requireMasterPush(input.tsWorkflowSource, 'TypeScript-latest CI', errors);
  for (const command of ['typescript@latest', 'pnpm --filter @rxjs/observable-polyfill run build', 'pnpm --filter rxjs run build']) {
    if (!input.tsWorkflowSource.includes(command)) {
      errors.push(`TypeScript-latest CI must retain ${command}.`);
    }
  }
  requireUnfilteredMasterPush(input.wptWorkflowSource, 'Observable WPT', 'schedule', errors);
  if (!input.wptRunnerSource.includes("'--binary-arg=--no-sandbox'")) {
    errors.push('Observable WPT must retain the Linux Chrome sandbox argument required by hosted runners.');
  }
  for (const dependency of ['libatspi2.0-dev', 'libcairo2-dev', 'libgirepository1.0-dev', 'pkg-config']) {
    if (!input.wptWorkflowSource.includes(dependency)) {
      errors.push(`Observable WPT must install ${dependency} for the pinned Python runner.`);
    }
  }
  requireUnfilteredMasterPush(input.readinessWorkflowSource, 'Release-readiness CI', 'workflow_dispatch', errors);
}

function requireMasterPush(source, label, errors) {
  if (!source.includes("  push:\n    branches: ['master']")) {
    errors.push(`${label} must run on pushes to master.`);
  }
}

function requireUnfilteredMasterPush(source, label, nextEvent, errors) {
  if (!source.includes(`  push:\n    branches: ['master']\n  ${nextEvent}:`)) {
    errors.push(`${label} must run unconditionally on pushes to master.`);
  }
}

function requireDependency(manifest, dependencyName, expectedVersion, errors, field = 'dependencies') {
  const actualVersion = manifest[field]?.[dependencyName];
  if (actualVersion !== expectedVersion) {
    errors.push(`${manifest.name} must declare ${dependencyName}@${expectedVersion} in ${field}; got ${actualVersion ?? 'no dependency'}.`);
  }
}

function auditEsmDistribution(name, manifest, errors) {
  if (manifest.engines?.node !== supportedNodeRange) {
    errors.push(`${name} must declare Node ${supportedNodeRange}; got ${manifest.engines?.node ?? 'no engine'}.`);
  }
  if (JSON.stringify(manifest.tshy?.dialects) !== JSON.stringify(['esm'])) {
    errors.push(`${name} must build only the ESM dialect.`);
  }
  if (manifest.tshy?.esmDialects || manifest.tshy?.commonjsDialects || manifest.main || manifest.types) {
    errors.push(`${name} must not publish legacy or target-specific duplicate entry points.`);
  }

  const expectedConditions = browserPackages.has(name) ? ['browser', 'webpack', 'import', 'require'] : ['import', 'require'];
  for (const [subpath, value] of Object.entries(manifest.exports ?? {})) {
    if (typeof value === 'string') continue;
    if (JSON.stringify(Object.keys(value)) !== JSON.stringify(expectedConditions)) {
      errors.push(`${name} export ${subpath} must expose ${expectedConditions.join(', ')} over one ESM target.`);
      continue;
    }
    const serializedTargets = new Set(Object.values(value).map(JSON.stringify));
    const targetPaths = Object.values(value).flatMap((condition) => (typeof condition === 'object' ? Object.values(condition) : []));
    if (serializedTargets.size !== 1 || targetPaths.some((target) => typeof target !== 'string' || !target.startsWith('./dist/esm/'))) {
      errors.push(`${name} export ${subpath} must resolve every condition to the same dist/esm files.`);
    }
  }
}

export async function readReleaseCoherenceInput(root = repositoryRoot) {
  const manifestEntries = await Promise.all(
    Object.entries(packagePaths).map(async ([name, path]) => [name, JSON.parse(await readFile(resolve(root, path), 'utf8'))])
  );
  const [
    rootManifest,
    nxConfig,
    skillProvenance,
    betaSource,
    ciWorkflowSource,
    tsWorkflowSource,
    wptWorkflowSource,
    readinessWorkflowSource,
    safariDriverSource,
    wptRunnerSource,
  ] = await Promise.all([
    readFile(resolve(root, 'package.json'), 'utf8').then(JSON.parse),
    readFile(resolve(root, 'nx.json'), 'utf8').then(JSON.parse),
    readFile(resolve(root, '.agents/skills/rxjs-next-migration/.rxjs-migrate-skill.json'), 'utf8').then(JSON.parse),
    readFile(resolve(root, 'scripts/release/beta.mjs'), 'utf8'),
    readFile(resolve(root, '.github/workflows/ci_main.yml'), 'utf8'),
    readFile(resolve(root, '.github/workflows/ci_ts_latest.yml'), 'utf8'),
    readFile(resolve(root, '.github/workflows/observable-wpt.yml'), 'utf8'),
    readFile(resolve(root, '.github/workflows/release-readiness.yml'), 'utf8'),
    readFile(resolve(root, 'packages/rxjs/test/release/safari-driver.mjs'), 'utf8'),
    readFile(resolve(root, 'packages/observable-polyfill/test/wpt/lib/runner.mjs'), 'utf8'),
  ]);

  const runtimeSources = await Promise.all([
    readRuntimeVersions(root, 'packages/observable-polyfill/src/index.ts', /version:\s*'([^']+)'/g, 'polyfill runtime metadata'),
    readRuntimeVersions(root, 'packages/migrate/src/version.ts', /migrationEngineVersion\s*=\s*'([^']+)'/g, 'migration engine runtime'),
    readRuntimeVersions(root, 'packages/observable-polyfill/test/import/esm.mjs', /version:\s*'([^']+)'/g, 'polyfill ESM fixture'),
    readRuntimeVersions(
      root,
      'packages/observable-polyfill/test/import/commonjs.cjs',
      /version:\s*'([^']+)'/g,
      'polyfill CommonJS fixture'
    ),
    readRuntimeVersions(root, 'packages/rxjs/test/import/fixture-scenario.mjs', /version:\s*'([^']+)'/g, 'RxJS import fixtures', {
      ignoreVersions: new Set(['7.0.0-test']),
    }),
  ]);

  return {
    manifests: Object.fromEntries(manifestEntries),
    runtimeVersions: runtimeSources.flat(),
    skillProvenance,
    rootNodeEngine: rootManifest.engines?.node,
    nxReleaseConfigured: nxConfig.release !== undefined,
    preparePackagesCommand: rootManifest.scripts?.['prepare-packages'] ?? '',
    betaCommand: rootManifest.scripts?.['release:beta'] ?? '',
    betaSource,
    ciWorkflowSource,
    tsWorkflowSource,
    wptWorkflowSource,
    readinessWorkflowSource,
    safariDriverSource,
    wptRunnerSource,
  };
}

async function readRuntimeVersions(root, path, pattern, label, { ignoreVersions = new Set() } = {}) {
  const source = await readFile(resolve(root, path), 'utf8');
  const versions = [...source.matchAll(pattern)].map((match) => match[1]).filter((version) => !ignoreVersions.has(version));
  if (versions.length === 0) {
    return [{ label: `${label} (${path}; missing version)`, version: undefined }];
  }
  return versions.map((version, index) => ({
    label: versions.length === 1 ? `${label} (${path})` : `${label} ${index + 1} (${path})`,
    version,
  }));
}

export async function checkReleaseCoherence(root = repositoryRoot) {
  const errors = auditReleaseCoherence(await readReleaseCoherenceInput(root));
  if (errors.length > 0) {
    throw new Error(`Release coherence check failed:\n- ${errors.join('\n- ')}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  checkReleaseCoherence()
    .then(() => process.stdout.write('Release package versions, runtime identities, dependencies, and npm channels are coherent.\n'))
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    });
}
