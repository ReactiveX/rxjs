import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  deriveRequiredSupportFiles,
  verifyRequiredSupportFiles,
} from './lib/dependency-closure.mjs';
import { gitBlobSha1, hashBuffer } from './lib/hash.mjs';
import { assertCheckoutClean } from './lib/importer.mjs';
import { deriveTestUrls } from './lib/inventory.mjs';
import { runProcess } from './lib/process.mjs';
import {
  createProvenance,
  validateCommit,
  validateUpstreamPath,
  verifyVendoredImport,
} from './lib/provenance.mjs';
import { verifyRealmPatterns } from './lib/realm-patterns.mjs';

const commit = '6a009d73f0d315941b90cac13a9523a2a08c631b';
const temporaryRoots = [];

async function makeTemporaryRoot() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'rxjs-wpt-unit-'));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true }))
  );
});

describe('WPT import input validation', () => {
  it('requires an exact lowercase 40-character WPT commit', () => {
    expect(() => validateCommit(commit)).not.toThrow();

    for (const invalidCommit of [
      '',
      commit.slice(0, -1),
      commit.toUpperCase(),
      `${commit}0`,
      'not-a-commit',
    ]) {
      expect(() => validateCommit(invalidCommit)).toThrow(
        'WPT commit must be a lowercase 40-character SHA'
      );
    }
  });

  it('accepts only paths inside the explicitly approved import closure', () => {
    const imports = ['LICENSE.md', 'dom/observable', 'resources'];

    expect(() => validateUpstreamPath('LICENSE.md', imports)).not.toThrow();
    expect(() =>
      validateUpstreamPath('dom/observable/tentative/observable-map.any.js', imports)
    ).not.toThrow();

    for (const unsafePath of [
      '',
      '../LICENSE.md',
      'dom/observable/../../secret',
      '/dom/observable/tentative/test.any.js',
      'dom\\observable\\tentative\\test.any.js',
      'dom/observable-other/test.any.js',
      'interfaces/observable.idl',
    ]) {
      expect(() => validateUpstreamPath(unsafePath, imports)).toThrow();
    }
  });

  it('records reproducible Git blob, SHA-256, byte, and mode provenance', async () => {
    const checkoutRoot = await makeTemporaryRoot();
    const filePath = 'dom/observable/tentative/example.any.js';
    const contents = Buffer.from('test(() => {}, "example");\n');
    await fs.mkdir(path.join(checkoutRoot, path.dirname(filePath)), { recursive: true });
    await fs.writeFile(path.join(checkoutRoot, filePath), contents);

    const provenance = await createProvenance({
      checkoutRoot,
      commit,
      importPaths: ['dom/observable'],
      fileEntries: [
        {
          path: filePath,
          mode: '100644',
          gitBlob: gitBlobSha1(contents),
        },
      ],
    });

    expect(provenance).toEqual({
      schemaVersion: 1,
      repository: 'https://github.com/web-platform-tests/wpt.git',
      commit,
      imports: ['dom/observable'],
      files: [
        {
          path: filePath,
          mode: '100644',
          gitBlob: gitBlobSha1(contents),
          sha256: hashBuffer('sha256', contents),
          bytes: contents.byteLength,
        },
      ],
    });
  });

  it('rejects dirty source files and unsupported Git modes while importing', async () => {
    const checkoutRoot = await makeTemporaryRoot();
    const filePath = 'dom/observable/tentative/example.any.js';
    const committedContents = Buffer.from('test(() => {}, "committed");\n');
    const dirtyContents = Buffer.from('test(() => {}, "dirty");\n');
    await fs.mkdir(path.join(checkoutRoot, path.dirname(filePath)), { recursive: true });
    await fs.writeFile(path.join(checkoutRoot, filePath), dirtyContents);

    await expect(
      createProvenance({
        checkoutRoot,
        commit,
        importPaths: ['dom/observable'],
        fileEntries: [
          {
            path: filePath,
            mode: '100644',
            gitBlob: gitBlobSha1(committedContents),
          },
        ],
      })
    ).rejects.toThrow(`Git blob mismatch while importing ${filePath}`);

    await expect(
      createProvenance({
        checkoutRoot,
        commit,
        importPaths: ['dom/observable'],
        fileEntries: [
          {
            path: filePath,
            mode: '120000',
            gitBlob: gitBlobSha1(dirtyContents),
          },
        ],
      })
    ).rejects.toThrow(`Unsupported Git mode 120000 for ${filePath}`);
  });

  it('rejects tracked and untracked checkout changes in the approved closure', async () => {
    const checkoutRoot = await makeTemporaryRoot();
    const testRoot = 'dom/observable/tentative';
    const trackedPath = path.join(checkoutRoot, testRoot, 'tracked.any.js');
    await fs.mkdir(path.dirname(trackedPath), { recursive: true });
    await fs.writeFile(trackedPath, 'test(() => {}, "tracked");\n');
    for (const args of [
      ['init', '--quiet'],
      ['add', '.'],
      [
        '-c',
        'user.name=RxJS WPT',
        '-c',
        'user.email=rxjs-wpt@example.invalid',
        'commit',
        '--quiet',
        '-m',
        'fixture',
      ],
    ]) {
      await runProcess('git', args, { cwd: checkoutRoot, capture: true });
    }

    await expect(
      assertCheckoutClean({ checkoutRoot, importPaths: [testRoot] })
    ).resolves.toBeUndefined();

    await fs.writeFile(trackedPath, 'test(() => {}, "modified");\n');
    await expect(
      assertCheckoutClean({ checkoutRoot, importPaths: [testRoot] })
    ).rejects.toThrow('WPT checkout has uncommitted changes inside the approved import closure');
    await fs.writeFile(trackedPath, 'test(() => {}, "tracked");\n');

    await fs.writeFile(
      path.join(checkoutRoot, testRoot, 'untracked.any.js'),
      'test(() => {}, "untracked");\n'
    );
    await expect(
      assertCheckoutClean({ checkoutRoot, importPaths: [testRoot] })
    ).rejects.toThrow('WPT checkout has uncommitted changes inside the approved import closure');
  });
});

describe('WPT URL inventory', () => {
  it('derives only runnable Observable URLs, including both .any.js realms', () => {
    expect(
      deriveTestUrls([
        'resources/testharness.js',
        'dom/observable/WEB_FEATURES.yml',
        'dom/observable/tentative/support.js',
        'dom/observable/tentative/zeta.window.js',
        'dom/observable/tentative/alpha.any.js',
        'dom/observable/tentative/idlharness.html',
        'dom/other/not-observable.any.js',
      ])
    ).toEqual([
      '/dom/observable/tentative/alpha.any.html',
      '/dom/observable/tentative/alpha.any.worker.html',
      '/dom/observable/tentative/idlharness.html',
      '/dom/observable/tentative/zeta.window.html',
    ]);
  });
});

describe('WPT support dependency closure', () => {
  const testFiles = new Map([
    [
      'dom/observable/tentative/observable-gc.any.js',
      '// META: script=/common/gc.js\n',
    ],
    [
      'dom/observable/tentative/idlharness.html',
      '<script src="/resources/testharness.js"></script>\n' +
        '<script src="/resources/testharnessreport.js"></script>\n' +
        '<script src="/resources/WebIDLParser.js"></script>\n' +
        '<script src="/resources/idlharness.js"></script>\n' +
        'idl_test(["observable.tentative"], ["dom"], () => {});\n',
    ],
  ]);
  const exactClosure = [
    'LICENSE.md',
    'common/gc.js',
    'interfaces/dom.idl',
    'interfaces/observable.tentative.idl',
    'resources/idlharness.js',
    'resources/testharness.js',
    'resources/testharnessreport.js',
    'resources/webidl2/lib/webidl2.js',
  ];

  it('derives only the support files referenced by the Observable suite', () => {
    expect(deriveRequiredSupportFiles(testFiles)).toEqual(exactClosure);
    expect(verifyRequiredSupportFiles(testFiles, exactClosure)).toEqual([]);
  });

  it('rejects both missing dependencies and unrelated support files', () => {
    const problems = verifyRequiredSupportFiles(testFiles, [
      ...exactClosure.filter((filePath) => filePath !== 'common/gc.js'),
      'interfaces/fetch.idl',
    ]);

    expect(problems).toContain('missing required WPT support file: common/gc.js');
    expect(problems).toContain('unexplained WPT support file: interfaces/fetch.idl');
  });
});

describe('vendored WPT verification', () => {
  async function createFixture() {
    const root = await makeTemporaryRoot();
    const upstreamRoot = path.join(root, 'upstream');
    const expectationsRoot = path.join(root, 'expectations');
    const filePath = 'dom/observable/tentative/example.any.js';
    const contents = Buffer.from('test(() => {}, "example");\n');
    await fs.mkdir(path.join(upstreamRoot, path.dirname(filePath)), { recursive: true });
    await fs.mkdir(expectationsRoot, { recursive: true });
    await fs.writeFile(path.join(upstreamRoot, filePath), contents);

    const config = {
      wpt: {
        commit,
        testRoot: 'dom/observable',
        supportFiles: [],
      },
      reviewedIframeFiles: {},
      attestation: {
        namePrefix: '[RxJS WPT] implementation ',
        functionKey: '__RXJS_WPT_ATTEST__',
        installationKey: '__RXJS_WPT_INSTALLATION__',
      },
    };
    const provenance = await createProvenance({
      checkoutRoot: upstreamRoot,
      commit,
      importPaths: [config.wpt.testRoot, ...config.wpt.supportFiles],
      fileEntries: [
        {
          path: filePath,
          mode: '100644',
          gitBlob: gitBlobSha1(contents),
        },
      ],
    });
    const inventory = deriveTestUrls([filePath]);

    return {
      config,
      provenance,
      inventory,
      upstreamRoot,
      expectationsRoot,
      filePath,
    };
  }

  it('accepts a byte-for-byte snapshot with matching provenance and inventory', async () => {
    const fixture = await createFixture();

    await expect(verifyVendoredImport(fixture)).resolves.toEqual([]);
  });

  it('detects modified and unrecorded vendored source files', async () => {
    const fixture = await createFixture();
    await fs.writeFile(
      path.join(fixture.upstreamRoot, fixture.filePath),
      'test(() => {}, "tampered");\n'
    );
    const extraPath = path.join(
      fixture.upstreamRoot,
      'dom/observable/tentative/unrecorded.window.js'
    );
    await fs.writeFile(extraPath, 'test(() => {}, "unrecorded");\n');

    const problems = await verifyVendoredImport(fixture);

    expect(problems).toContain(
      'unrecorded vendored file: dom/observable/tentative/unrecorded.window.js'
    );
    expect(problems).toContain(`${fixture.filePath}: Git blob hash differs from pinned WPT`);
    expect(problems).toContain(`${fixture.filePath}: SHA-256 differs from provenance`);
  });

  it('detects a stale generated test-URL inventory', async () => {
    const fixture = await createFixture();
    fixture.inventory = [];

    const problems = await verifyVendoredImport(fixture);

    expect(problems).toContain(
      'expected-test-urls.json does not match the pinned source inventory'
    );
  });

  it('rejects attestation names and keys in ordinary WPT expectation metadata', async () => {
    const fixture = await createFixture();
    await fs.writeFile(
      path.join(fixture.expectationsRoot, 'observable.ini'),
      '[RxJS WPT] implementation deliberately-allowlisted\n'
    );

    const problems = await verifyVendoredImport(fixture);

    expect(problems).toContain(
      'observable.ini: expectation metadata may not mention attestation'
    );
  });
});

describe('realm-creation review', () => {
  const iframePath = 'dom/observable/tentative/observable-map.window.js';
  const reviewedSource =
    'const iframe = document.createElement("iframe");\n' +
    'document.body.append(iframe);\n' +
    'const child = iframe.contentWindow;\n';

  it('accepts an exact, reviewed same-origin iframe pattern', () => {
    expect(
      verifyRealmPatterns(
        new Map([[iframePath, reviewedSource]]),
        {
          [iframePath]: {
            createElementCount: 1,
            contentWindowCount: 1,
            childRealmCount: 1,
          },
        }
      )
    ).toEqual([]);
  });

  it('rejects unreviewed new realms and reviewed-count drift', () => {
    expect(
      verifyRealmPatterns(
        new Map([
          [
            'dom/observable/tentative/new-realm.any.js',
            'const worker = new Worker("worker.js");\n',
          ],
        ]),
        {}
      )
    ).toContainEqual(
      expect.stringContaining(
        'dom/observable/tentative/new-realm.any.js: unreviewed realm pattern'
      )
    );

    expect(
      verifyRealmPatterns(
        new Map([[iframePath, `${reviewedSource}const second = iframe.contentWindow;\n`]]),
        {
          [iframePath]: {
            createElementCount: 1,
            contentWindowCount: 1,
            childRealmCount: 1,
          },
        }
      )
    ).toContain(
      `${iframePath}: expected createElement=1, contentWindow=1, and child realms=1; ` +
        `found createElement=1, contentWindow=2, and child realms=2`
    );
  });

  it('rejects unsupported realm patterns in reviewed files and missing reviewed files', () => {
    const problems = verifyRealmPatterns(
      new Map([[iframePath, `${reviewedSource}const worker = new Worker("worker.js");\n`]]),
      {
        [iframePath]: {
          createElementCount: 1,
          contentWindowCount: 1,
          childRealmCount: 1,
        },
        'dom/observable/tentative/missing.window.js': {
          createElementCount: 1,
          contentWindowCount: 1,
          childRealmCount: 1,
        },
      }
    );

    expect(problems).toContainEqual(
      expect.stringContaining(`${iframePath}: reviewed iframe helper gained unsupported patterns`)
    );
    expect(problems).toContain(
      'dom/observable/tentative/missing.window.js: reviewed iframe file is missing'
    );
  });
});
