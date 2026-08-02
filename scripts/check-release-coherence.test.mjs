import assert from 'node:assert/strict';
import test from 'node:test';
import { auditReleaseCoherence } from './check-release-coherence.mjs';

function validInput() {
  const version = '9.0.0-beta.0';
  return {
    manifests: {
      '@rxjs/observable-polyfill': releaseManifest('@rxjs/observable-polyfill', version, true),
      '@rxjs/migrate': releaseManifest('@rxjs/migrate', version, false),
      '@rxjs/test': { ...releaseManifest('@rxjs/test', version, true), peerDependencies: { rxjs: version } },
      rxjs: { ...releaseManifest('rxjs', version, true), dependencies: { '@rxjs/observable-polyfill': version } },
    },
    runtimeVersions: [
      { label: 'polyfill metadata', version },
      { label: 'migration engine', version },
    ],
    skillProvenance: { packageName: '@rxjs/migrate', packageVersion: version },
    rootNodeEngine: '>=22.13.0',
    nxReleaseProjects: ['packages/*'],
    preparePackagesCommand: 'pnpm nx run-many -t build --exclude rxjs.dev',
    publishSource: ["'refs/heads/7.x': 'latest'", "'refs/heads/master': 'next'", "if (isPrerelease(tag)) { npmDistTag = 'next'; }"].join(
      '\n'
    ),
    ciWorkflowSource: [
      "  push:\n    branches: ['master']",
      "node: '22.13.0'",
      "node: '24'",
      "node: '26'",
      'continue-on-error: ${{ matrix.advisory }}',
      'test:unit:audit:check',
      'test:bundle-analysis',
      'test:release:safari',
      'test:workflows',
    ].join('\n'),
    tsWorkflowSource: "  push:\n    branches: ['master']",
    wptWorkflowSource: "  push:\n    branches: ['master']\n  schedule:",
    readinessWorkflowSource: [
      "  push:\n    branches: ['master']\n  workflow_dispatch:",
      'pnpm exec playwright install --with-deps chromium firefox webkit',
      'test:release:webpack',
      'test:release:performance',
      'test:release:adoption',
      'version: 2.8.0',
      'version: 1.3.14',
      'target: [desktop, ios]',
    ].join('\n'),
    publishWorkflowSource: ['node-version: 24', 'Verify release identity and distribution', 'Prepare packages for publishing'].join('\n'),
    safariDriverSource: "'safari:useSimulator': true",
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
  input.nxReleaseProjects = ['packages/rxjs'];
  input.preparePackagesCommand = 'pnpm nx run-many -t build';
  input.publishSource = '';
  input.ciWorkflowSource = '';
  input.tsWorkflowSource = '';
  input.wptWorkflowSource = '';
  input.readinessWorkflowSource = '';
  input.publishWorkflowSource = '';
  input.safariDriverSource = '';

  const errors = auditReleaseCoherence(input);

  assert.ok(errors.length >= 26);
  assert.match(errors.join('\n'), /Release package versions differ/);
  assert.match(errors.join('\n'), /must declare rxjs/);
  assert.match(errors.join('\n'), /polyfill metadata reports/);
  assert.match(errors.join('\n'), /migration Skill provenance/);
  assert.match(errors.join('\n'), /repository Node engine/);
  assert.match(errors.join('\n'), /legacy or target-specific/);
  assert.match(errors.join('\n'), /same dist\/esm files/);
  assert.match(errors.join('\n'), /must explicitly exclude rxjs\.dev/);
  assert.match(errors.join('\n'), /7\.x branch/);
  assert.match(errors.join('\n'), /master branch/);
  assert.match(errors.join('\n'), /Tagged prereleases/);
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
  input.publishWorkflowSource += '\npnpm --filter rxjs.dev run publish';

  assert.deepEqual(
    auditReleaseCoherence(input).filter((error) => error.includes('must not build, test, publish')),
    [
      'package CI must not build, test, publish, or otherwise reference rxjs.dev.',
      'release-readiness CI must not build, test, publish, or otherwise reference rxjs.dev.',
      'publishing CI must not build, test, publish, or otherwise reference rxjs.dev.',
    ]
  );
});
