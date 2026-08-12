import assert from 'node:assert/strict';
import test from 'node:test';
import { auditReleaseCoherence } from './check-release-coherence.mjs';

function validInput() {
  const version = '9.0.0-beta.0';
  return {
    manifests: {
      '@rxjs/observable-polyfill': releaseManifest('@rxjs/observable-polyfill', version, true),
      '@rxjs/migrate': { ...releaseManifest('@rxjs/migrate', version, false), devDependencies: { '@types/node': '20.11.0' } },
      '@rxjs/test': { ...releaseManifest('@rxjs/test', version, true), peerDependencies: { rxjs: version } },
      rxjs: { ...releaseManifest('rxjs', version, true), dependencies: { '@rxjs/observable-polyfill': version } },
    },
    runtimeVersions: [
      { label: 'polyfill metadata', version },
      { label: 'migration engine', version },
    ],
    skillProvenance: { packageName: '@rxjs/migrate', packageVersion: version },
    rootNodeEngine: '>=22.13.0',
    nxReleaseConfigured: false,
    preparePackagesCommand: 'pnpm nx run-many -t build --exclude rxjs.dev',
    betaCommand: 'node scripts/release/beta.mjs',
    betaSource: [
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
    ].join('\n'),
    ciWorkflowSource: [
      "  push:\n    branches: ['master']",
      "node: '22.13.0'",
      "node: '24'",
      "node: '26'",
      'continue-on-error: ${{ matrix.advisory }}',
      'Build migration-audit runtime dependency\n        run: pnpm --filter @rxjs/observable-polyfill run build',
      'test:unit:audit:check',
      'test:bundle-analysis',
      'test:release:safari',
      'test:workflows',
      'git fetch --no-tags --depth=1 origin 7.x:7.x',
      'pnpm --filter @rxjs/observable-polyfill run build\n          pnpm --filter rxjs run build',
    ].join('\n'),
    tsWorkflowSource: [
      "  push:\n    branches: ['master']",
      'typescript@latest',
      'pnpm --filter @rxjs/observable-polyfill run build',
      'pnpm --filter rxjs run build',
    ].join('\n'),
    wptWorkflowSource: "  push:\n    branches: ['master']\n  schedule:\nlibatspi2.0-dev libcairo2-dev libgirepository1.0-dev pkg-config",
    readinessWorkflowSource: [
      "  push:\n    branches: ['master']\n  workflow_dispatch:",
      'pnpm exec playwright install --with-deps chromium firefox webkit',
      'test:release:webpack',
      'test:release:performance',
      'test:release:adoption',
      'version: 2.8.0',
      'version: 1.3.14',
      'target: [desktop, ios]',
      'boot-ios-simulator.mjs',
      'pnpm --filter @rxjs/test run build',
      'pnpm --filter @rxjs/migrate run build',
    ].join('\n'),
    safariDriverSource: "'safari:useSimulator': true\n'safari:deviceUDID'",
    wptRunnerSource: "'--binary-arg=--no-sandbox'",
  };
}

function releaseManifest(name, version, browser) {
  const target = { types: './dist/esm/index.d.ts', default: './dist/esm/index.js' };
  return {
    name,
    version,
    engines: { node: '>=22.13.0' },
    tshy: { dialects: ['esm'] },
    exports: {
      '.': {
        ...(browser ? { browser: target, webpack: target } : {}),
        import: target,
        require: target,
      },
    },
  };
}

test('accepts one synchronized release train and the protected npm channels', () => {
  assert.deepEqual(auditReleaseCoherence(validInput()), []);
});

test('rejects manifest, dependency, runtime identity, and release-channel drift', () => {
  const input = validInput();
  input.manifests['@rxjs/migrate'].version = '8.0.0-alpha.14';
  input.manifests['@rxjs/test'].peerDependencies.rxjs = '8.0.0-alpha.14';
  input.runtimeVersions[0].version = '8.0.0-alpha.14';
  input.skillProvenance.packageVersion = '8.0.0-alpha.14';
  input.rootNodeEngine = '>=18';
  input.manifests.rxjs.main = './dist/commonjs/index.js';
  input.manifests.rxjs.exports['.'].require = {
    types: './dist/commonjs/index.d.ts',
    default: './dist/commonjs/index.js',
  };
  input.nxReleaseConfigured = true;
  input.preparePackagesCommand = 'pnpm nx run-many -t build';
  input.betaCommand = '';
  input.betaSource = '';
  input.ciWorkflowSource = '';
  input.tsWorkflowSource = '';
  input.wptWorkflowSource = '';
  input.readinessWorkflowSource = '';
  input.safariDriverSource = '';
  input.wptRunnerSource = '';

  const errors = auditReleaseCoherence(input);

  assert.ok(errors.length >= 24);
  assert.match(errors.join('\n'), /Release package versions differ/);
  assert.match(errors.join('\n'), /must declare rxjs/);
  assert.match(errors.join('\n'), /polyfill metadata reports/);
  assert.match(errors.join('\n'), /migration Skill provenance/);
  assert.match(errors.join('\n'), /repository Node engine/);
  assert.match(errors.join('\n'), /legacy or target-specific/);
  assert.match(errors.join('\n'), /same dist\/esm files/);
  assert.match(errors.join('\n'), /Nx release configuration must remain removed/);
  assert.match(errors.join('\n'), /must explicitly exclude rxjs\.dev/);
  assert.match(errors.join('\n'), /beta release command/);
  assert.match(errors.join('\n'), /Node 22\.13\.0/);
  assert.match(errors.join('\n'), /Node 26 lane/);
  assert.match(errors.join('\n'), /Mobile Safari/);
  assert.match(errors.join('\n'), /exact RxJS 7 migration-evidence baselines/);
  assert.match(errors.join('\n'), /TypeScript-latest CI must run on pushes to master/);
  assert.match(errors.join('\n'), /Observable WPT must run unconditionally/);
  assert.match(errors.join('\n'), /Release-readiness CI must run unconditionally/);
});

test('rejects documentation-site work from release workflows', () => {
  const input = validInput();
  input.ciWorkflowSource += '\npnpm --filter rxjs.dev run test';
  input.readinessWorkflowSource += '\npnpm --filter rxjs.dev run build';
  input.betaSource += '\npnpm --filter rxjs.dev run publish';

  assert.deepEqual(
    auditReleaseCoherence(input).filter((error) => error.includes('must not build, test, publish')),
    [
      'package CI must not build, test, publish, or otherwise reference rxjs.dev.',
      'release-readiness CI must not build, test, publish, or otherwise reference rxjs.dev.',
      'interactive beta release must not build, test, publish, or otherwise reference rxjs.dev.',
    ]
  );
});

test('rejects removal of interactive beta release safeguards', () => {
  const input = validInput();
  input.betaSource = input.betaSource
    .replace("{ name: 'rxjs', directory: 'packages/rxjs' }", '')
    .replace("    '--tag',\n    'next',\n    '--access',\n    'public',", '')
    .replace('Unset NPM_TOKEN and NODE_AUTH_TOKEN', '')
    .replace('registry integrity did not match the local tarball', '');

  const errors = auditReleaseCoherence(input).join('\n');
  assert.match(errors, /interactive beta publishing.*rxjs/is);
  assert.match(errors, /interactive beta publishing.*--tag.*next/is);
  assert.match(errors, /interactive beta publishing.*NPM_TOKEN/is);
  assert.match(errors, /interactive beta publishing.*registry integrity/is);
});

test('rejects removal of the clean-workspace release-package build', () => {
  const input = validInput();
  input.ciWorkflowSource = input.ciWorkflowSource.replace(
    'pnpm --filter @rxjs/observable-polyfill run build\n          pnpm --filter rxjs run build',
    ''
  );
  assert.match(auditReleaseCoherence(input).join('\n'), /clean-workspace release-package build/);
});

test('rejects removal of the clean-workspace migration-audit build', () => {
  const input = validInput();
  input.ciWorkflowSource = input.ciWorkflowSource.replace(
    'Build migration-audit runtime dependency\n        run: pnpm --filter @rxjs/observable-polyfill run build',
    ''
  );
  assert.match(auditReleaseCoherence(input).join('\n'), /clean-workspace migration-audit runtime build/);
});

test('rejects removal of the TypeScript-latest build command', () => {
  const input = validInput();
  input.tsWorkflowSource = input.tsWorkflowSource.replace('pnpm --filter rxjs run build', 'pnpm nx compile rxjs');
  assert.match(auditReleaseCoherence(input).join('\n'), /TypeScript-latest CI must retain pnpm --filter rxjs run build/);
});

test('rejects removal of the migration package Node declarations', () => {
  const input = validInput();
  delete input.manifests['@rxjs/migrate'].devDependencies['@types/node'];
  assert.match(auditReleaseCoherence(input).join('\n'), /@rxjs\/migrate must declare @types\/node@20\.11\.0/);
});

test('rejects removal of WPT and release-readiness runner prerequisites', () => {
  const input = validInput();
  input.wptWorkflowSource = input.wptWorkflowSource.replace('libcairo2-dev', '');
  input.readinessWorkflowSource = input.readinessWorkflowSource
    .replace('boot-ios-simulator.mjs', '')
    .replace('pnpm --filter @rxjs/test run build', '');

  const errors = auditReleaseCoherence(input).join('\n');
  assert.match(errors, /must install libcairo2-dev/);
  assert.match(errors, /explicit iOS simulator startup/);
  assert.match(errors, /packed test-helper adoption prerequisite/);
});

test('rejects shallow migration-evidence CI and sandboxed hosted WPT Chrome', () => {
  const input = validInput();
  input.ciWorkflowSource = input.ciWorkflowSource.replace('git fetch --no-tags --depth=1 origin 7.x:7.x', '');
  input.wptRunnerSource = '';

  const errors = auditReleaseCoherence(input).join('\n');
  assert.match(errors, /RxJS 7 source ref/);
  assert.match(errors, /Linux Chrome sandbox argument/);
});
