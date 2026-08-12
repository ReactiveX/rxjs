import { describe, expect, it } from 'vitest';
import {
  auditReport,
  compareStableReports,
  createExpectedResults,
  formatWptConsoleReport,
  normalizeReport,
} from './lib/report.mjs';

const browserVersion = '150.0.7871.126';
const bundleSha256 = 'a'.repeat(64);
const attestationNamePrefix = '[RxJS WPT] implementation ';
const attestationName = `${attestationNamePrefix}${bundleSha256} is active`;
const windowUrl = '/dom/observable/tentative/example.any.html';
const workerUrl = '/dom/observable/tentative/example.any.worker.html';
const iframeUrl = '/dom/observable/tentative/example.window.html';

function attestation(overrides = {}) {
  return {
    name: attestationName,
    status: 'PASS',
    ...overrides,
  };
}

function result(test, overrides = {}) {
  return {
    test,
    status: 'OK',
    subtests: [attestation(), { name: 'upstream behavior', status: 'PASS' }],
    ...overrides,
  };
}

function report(results, overrides = {}) {
  return {
    run_info: {
      browser_version: browserVersion,
    },
    results,
    ...overrides,
  };
}

function expectedResultsFor(results) {
  const normalized = normalizeReport(report(results), attestationNamePrefix);
  return {
    schemaVersion: 1,
    wptCommit: '6a009d73f0d315941b90cac13a9523a2a08c631b',
    browserVersion,
    results: normalized.results,
  };
}

function audit(results, overrides = {}) {
  return auditReport({
    report: report(results),
    inventory: results.map(({ test }) => test),
    bundleSha256,
    attestationNamePrefix,
    expectedResults: expectedResultsFor(results),
    strict: false,
    expectedWptCommit: '6a009d73f0d315941b90cac13a9523a2a08c631b',
    expectedBrowserVersion: browserVersion,
    ...overrides,
  });
}

describe('WPT report normalization', () => {
  it('removes only the attestation subtest and sorts test and subtest names', () => {
    const normalized = normalizeReport(
      report([
        result(workerUrl, {
          subtests: [
            { name: 'zeta', status: 'FAIL' },
            attestation(),
            { name: 'alpha', status: 'PASS' },
          ],
        }),
        result(windowUrl),
      ]),
      attestationNamePrefix
    );

    expect(Object.keys(normalized.results)).toEqual([windowUrl, workerUrl]);
    expect(normalized.results[workerUrl].subtests).toEqual({
      alpha: 'PASS',
      zeta: 'FAIL',
    });
  });

  it.each([
    null,
    {},
    { run_info: {}, results: null },
    { run_info: null, results: [] },
  ])('rejects malformed top-level reports: %j', (malformed) => {
    expect(() => normalizeReport(malformed, attestationNamePrefix)).toThrow(
      'Malformed WPT report'
    );
  });

  it('rejects malformed test and subtest results', () => {
    expect(() =>
      normalizeReport(
        report([{ test: windowUrl, status: 'OK', subtests: 'not-an-array' }]),
        attestationNamePrefix
      )
    ).toThrow('Malformed WPT test result');

    expect(() =>
      normalizeReport(
        report([result(windowUrl, { subtests: [{ name: 'missing status' }] })]),
        attestationNamePrefix
      )
    ).toThrow('Malformed WPT subtest result');
  });

  it('rejects duplicate URL and upstream subtest results', () => {
    expect(() =>
      normalizeReport(
        report([result(windowUrl), result(windowUrl)]),
        attestationNamePrefix
      )
    ).toThrow(`Duplicate WPT test result: ${windowUrl}`);

    expect(() =>
      normalizeReport(
        report([
          result(windowUrl, {
            subtests: [
              attestation(),
              { name: 'duplicate', status: 'PASS' },
              { name: 'duplicate', status: 'PASS' },
            ],
          }),
        ]),
        attestationNamePrefix
      )
    ).toThrow('Duplicate WPT subtest name: duplicate');
  });
});

describe('terminal WPT report', () => {
  const paths = {
    reportPath: '/artifacts/wptreport.json',
    humanLogPath: '/artifacts/wpt.log',
    rawLogPath: '/artifacts/wpt.raw.log',
    runRoot: '/artifacts',
  };

  it('prints a readable strict failure summary with diagnostic result names and artifact paths', () => {
    const knownFailure = result(windowUrl, {
      status: 'ERROR',
      subtests: [
        attestation(),
        { name: 'known\nfailure', status: 'FAIL' },
        { name: 'not reached', status: 'NOTRUN' },
      ],
    });
    const audited = audit([knownFailure], {
      strict: true,
      expectedResults: undefined,
    });

    const output = formatWptConsoleReport({
      audit: audited,
      mode: 'conformance',
      expectedUrlCount: 1,
      implementationId: bundleSha256,
      ...paths,
    });

    expect(output).toContain('Observable WPT conformance: FAIL');
    expect(output).toContain('Test URLs: 1/1 reported (ERROR 1)');
    expect(output).toContain('Upstream subtests: 2 (FAIL 1, NOTRUN 1)');
    expect(output).toContain('RxJS identity attestations: 1/1 PASS');
    expect(output).toContain(`- ${windowUrl} [ERROR]`);
    expect(output).toContain('  - [FAIL] known failure');
    expect(output).toContain('  - [NOTRUN] not reached');
    expect(output).toContain('- Human-readable runner log: /artifacts/wpt.log');
    expect(output).not.toContain('strict mode requires');
  });

  it('prints a concise passing conformance summary without a failure section', () => {
    const passing = audit([result(windowUrl)], {
      strict: true,
      expectedResults: undefined,
    });

    const output = formatWptConsoleReport({
      audit: passing,
      mode: 'conformance',
      expectedUrlCount: 1,
      implementationId: bundleSha256,
      ...paths,
    });

    expect(output).toContain('Observable WPT conformance: PASS');
    expect(output).toContain('Test URLs: 1/1 reported (OK 1)');
    expect(output).toContain('Upstream subtests: 1 (PASS 1)');
    expect(output).not.toContain('Non-passing WPT results');
  });
});

describe('implementation attestation audit', () => {
  it('accepts exactly one passing attestation for every expected URL', () => {
    const results = [result(windowUrl), result(workerUrl), result(iframeUrl)];

    expect(audit(results)).toMatchObject({
      ok: true,
      problems: [],
      attestations: [
        { test: windowUrl, name: attestationName, status: 'PASS', bundleSha256 },
        { test: workerUrl, name: attestationName, status: 'PASS', bundleSha256 },
        { test: iframeUrl, name: attestationName, status: 'PASS', bundleSha256 },
      ],
    });
  });

  it('rejects a native-only result when bootstrap and attestation were omitted', () => {
    const nativeOnly = result(windowUrl, {
      subtests: [{ name: 'upstream behavior', status: 'PASS' }],
    });

    const audited = audit([nativeOnly]);

    expect(audited.ok).toBe(false);
    expect(audited.problems).toContain(
      `${windowUrl}: expected exactly one RxJS identity attestation, found 0`
    );
  });

  it('rejects a failed identity check, including a restored native implementation', () => {
    const restoredNative = result(windowUrl, {
      subtests: [
        attestation({ status: 'FAIL' }),
        { name: 'upstream behavior', status: 'PASS' },
      ],
    });

    const audited = audit([restoredNative]);

    expect(audited.ok).toBe(false);
    expect(audited.problems).toContain(
      `${windowUrl}: RxJS identity attestation was FAIL`
    );
  });

  it('rejects an attestation for a different bundle ID', () => {
    const wrongBundleName = `${attestationNamePrefix}${'b'.repeat(64)} is active`;
    const wrongBundle = result(windowUrl, {
      subtests: [
        attestation({ name: wrongBundleName }),
        { name: 'upstream behavior', status: 'PASS' },
      ],
    });

    const audited = audit([wrongBundle]);

    expect(audited.ok).toBe(false);
    expect(audited.problems).toContain(
      `${windowUrl}: attested a different implementation (${wrongBundleName})`
    );
  });

  it.each([workerUrl, iframeUrl])(
    'rejects a missing worker or child-iframe attestation for %s',
    (missingUrl) => {
      const missing = result(missingUrl, {
        subtests: [{ name: 'upstream behavior', status: 'PASS' }],
      });

      const audited = audit([result(windowUrl), missing]);

      expect(audited.ok).toBe(false);
      expect(audited.problems).toContain(
        `${missingUrl}: expected exactly one RxJS identity attestation, found 0`
      );
    }
  );

  it('rejects duplicate attestations', () => {
    const duplicate = result(windowUrl, {
      subtests: [
        attestation(),
        attestation(),
        { name: 'upstream behavior', status: 'PASS' },
      ],
    });

    const audited = audit([duplicate]);

    expect(audited.ok).toBe(false);
    expect(audited.problems).toContain(
      `${windowUrl}: expected exactly one RxJS identity attestation, found 2`
    );
  });

  it('rejects allowlisted and intermittent attestations even when their actual status passes', () => {
    const allowlisted = result(windowUrl, {
      subtests: [
        attestation({
          expected: 'FAIL',
          known_intermittent: ['FAIL'],
        }),
        { name: 'upstream behavior', status: 'PASS' },
      ],
    });

    const audited = audit([allowlisted]);

    expect(audited.ok).toBe(false);
    expect(audited.problems).toContain(
      `${windowUrl}: RxJS identity attestation was allowlisted`
    );
    expect(audited.problems).toContain(
      `${windowUrl}: RxJS identity attestation was marked intermittent`
    );
  });
});

describe('complete-run and conformance-baseline audit', () => {
  it('rejects missing and unexpected URLs', () => {
    const unexpectedUrl = '/dom/observable/tentative/unexpected.any.html';
    const results = [result(windowUrl), result(unexpectedUrl)];
    const audited = audit(results, {
      inventory: [windowUrl, workerUrl],
      expectedResults: expectedResultsFor(results),
    });

    expect(audited.ok).toBe(false);
    expect(audited.problems).toContain(`Missing WPT result: ${workerUrl}`);
    expect(audited.problems).toContain(`Unexpected WPT result: ${unexpectedUrl}`);
  });

  it('reports malformed input as a blocking audit failure', () => {
    const audited = auditReport({
      report: { run_info: {}, results: 'not-an-array' },
      inventory: [windowUrl],
      bundleSha256,
      attestationNamePrefix,
      expectedResults: null,
      strict: false,
      expectedWptCommit: '6a009d73f0d315941b90cac13a9523a2a08c631b',
      expectedBrowserVersion: browserVersion,
    });

    expect(audited).toEqual({
      ok: false,
      problems: ['Malformed WPT report'],
      attestations: [],
      normalized: null,
    });
  });

  it('accepts deterministic upstream failures when they match the checked-in baseline', () => {
    const knownFailure = result(windowUrl, {
      status: 'ERROR',
      subtests: [
        attestation(),
        { name: 'known failure', status: 'FAIL' },
      ],
    });

    const audited = audit([knownFailure]);

    expect(audited.ok).toBe(true);
    expect(audited.normalized.results[windowUrl]).toEqual({
      status: 'ERROR',
      subtests: {
        'known failure': 'FAIL',
      },
    });
  });

  it('accepts a deterministic upstream timeout only when it matches the baseline', () => {
    const knownTimeout = result(windowUrl, {
      status: 'TIMEOUT',
      subtests: [
        attestation(),
        { name: 'known timeout', status: 'TIMEOUT' },
        { name: 'not reached after timeout', status: 'NOTRUN' },
      ],
    });

    expect(audit([knownTimeout]).ok).toBe(true);
    const strictAudit = audit([knownTimeout], {
      strict: true,
      expectedResults: undefined,
    });
    expect(strictAudit.problems).toContain(
      `${windowUrl}: strict mode requires OK, got TIMEOUT`
    );
    expect(strictAudit.problems).toContain(
      `${windowUrl} :: known timeout: strict mode requires PASS, got TIMEOUT`
    );
  });

  it('rejects an unexpected pass so obsolete failure expectations are removed deliberately', () => {
    const actual = result(windowUrl);
    const expected = expectedResultsFor([
      result(windowUrl, {
        subtests: [
          attestation(),
          { name: 'upstream behavior', status: 'FAIL' },
        ],
      }),
    ]);

    const audited = audit([actual], { expectedResults: expected });

    expect(audited.ok).toBe(false);
    expect(audited.problems).toContain(
      `${windowUrl} :: upstream behavior: expected FAIL, got PASS`
    );
  });

  it('rejects an unexpected failure and an upstream subtest-inventory change', () => {
    const expected = expectedResultsFor([result(windowUrl)]);
    const actual = result(windowUrl, {
      subtests: [
        attestation(),
        { name: 'renamed behavior', status: 'FAIL' },
      ],
    });

    const audited = audit([actual], { expectedResults: expected });

    expect(audited.ok).toBe(false);
    expect(audited.problems).toContain(
      `${windowUrl}: upstream subtest inventory differs from the baseline`
    );
  });

  it('requires a baseline in ordinary mode and all-pass results in strict mode', () => {
    const knownFailure = result(windowUrl, {
      status: 'ERROR',
      subtests: [
        attestation(),
        { name: 'known failure', status: 'FAIL' },
      ],
    });

    expect(
      audit([result(windowUrl)], {
        expectedResults: undefined,
      }).problems
    ).toContain('No checked-in WPT result baseline was provided');

    const strictAudit = audit([knownFailure], {
      strict: true,
      expectedResults: undefined,
    });
    expect(strictAudit.ok).toBe(false);
    expect(strictAudit.problems).toContain(
      `${windowUrl}: strict mode requires OK, got ERROR`
    );
    expect(strictAudit.problems).toContain(
      `${windowUrl} :: known failure: strict mode requires PASS, got FAIL`
    );
  });

  it('rejects browser drift unless the caller explicitly opts into it', () => {
    const results = [result(windowUrl)];
    const wrongBrowserReport = report(results, {
      run_info: { browser_version: '151.0.0.0' },
    });
    const options = {
      report: wrongBrowserReport,
      inventory: [windowUrl],
      bundleSha256,
      attestationNamePrefix,
      expectedResults: expectedResultsFor(results),
      strict: false,
      expectedWptCommit: '6a009d73f0d315941b90cac13a9523a2a08c631b',
      expectedBrowserVersion: browserVersion,
    };

    expect(auditReport(options).problems).toContain(
      `Expected Chrome ${browserVersion}, got 151.0.0.0`
    );
    expect(auditReport({ ...options, allowBrowserDrift: true }).ok).toBe(true);
  });

  it('rejects a checked-in baseline for a different WPT or pinned browser', () => {
    const results = [result(windowUrl)];
    const staleBaseline = expectedResultsFor(results);
    staleBaseline.wptCommit = 'b'.repeat(40);
    staleBaseline.browserVersion = '149.0.0.0';

    const audited = audit(results, { expectedResults: staleBaseline });

    expect(audited.problems).toContain(
      `Expected baseline for WPT ${'6a009d73f0d315941b90cac13a9523a2a08c631b'}, got ${'b'.repeat(40)}`
    );
    expect(audited.problems).toContain(
      `Expected baseline for Chrome ${browserVersion}, got 149.0.0.0`
    );
  });
});

describe('baseline creation', () => {
  it('requires three identical normalized reports before creating expectations', () => {
    const normalized = normalizeReport(report([result(windowUrl)]), attestationNamePrefix);

    expect(() => compareStableReports([normalized, normalized])).toThrow(
      'At least three complete WPT reports are required'
    );
    expect(() =>
      compareStableReports([
        normalized,
        normalized,
        normalizeReport(
          report([
            result(windowUrl, {
              subtests: [
                attestation(),
                { name: 'upstream behavior', status: 'FAIL' },
              ],
            }),
          ]),
          attestationNamePrefix
        ),
      ])
    ).toThrow('WPT report 3 differs from report 1');
    expect(() => compareStableReports([normalized, normalized, normalized])).not.toThrow();
  });

  it('creates a pinned baseline from a normalized report', () => {
    const normalized = normalizeReport(report([result(windowUrl)]), attestationNamePrefix);
    const config = {
      wpt: { commit: '6a009d73f0d315941b90cac13a9523a2a08c631b' },
      browser: { version: browserVersion },
    };

    expect(createExpectedResults({ config, normalizedReport: normalized })).toEqual({
      schemaVersion: 1,
      wptCommit: config.wpt.commit,
      browserVersion,
      results: normalized.results,
    });
  });
});
