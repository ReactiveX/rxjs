# Observable WPT harness

This directory runs the pinned Web Platform Tests (WPT) for the web-platform
`Observable` against the implementation in
`packages/observable-polyfill/src/index.ts`.

The harness is intentionally test infrastructure; conformance comes from the
implementation behavior it measures. The current fallback passes this pinned
suite. `pnpm run test:wpt` exits nonzero if any upstream test or subtest fails,
errors, times out, or does not run. A separately named baseline command remains
available for diagnosing stable behavior. Both modes are strict about
completeness, provenance, and which implementation ran.

## Prerequisites

The blocking WPT job runs on Node 24, and the repository engine declaration
accepts Node 24 alongside the retained Node 18 and Node 20 development
runtimes. pnpm 10.34.5 is the repository package manager. Confirm the
active versions before the first run:

```sh
node --version
pnpm --version
```

Python 3.9 or newer is also required. `pnpm run wpt:doctor` verifies the selected
Python interpreter and every other harness prerequisite.

## What is pinned

- Written Observable reference: WICG/observable `spec.bs` at
  `d74bace7cf80200a01c81cfe20961e29ac7fa3d8`. This explains the rules and helps
  diagnose failures; it is not a second executable gate.
- WPT commit:
  `6a009d73f0d315941b90cac13a9523a2a08c631b`
- Chrome for Testing and ChromeDriver: `150.0.7871.126`
- WPT test URLs: `expected-test-urls.json`
- Imported-file provenance and Git blob hashes: `provenance.json`
- Browser archive URLs, sizes, and checksums: `browser-lock.json`

Only the 29 files in `dom/observable/tentative/`—including the
`EventTarget.prototype.when` coverage in that directory—and this exact support
closure are committed:

- `LICENSE.md`;
- `common/gc.js`;
- `interfaces/dom.idl` and `interfaces/observable.tentative.idl`;
- `resources/testharness.js`, `resources/testharnessreport.js`,
  `resources/idlharness.js`, and the Web IDL parser file they use.

That is 37 upstream files in total. `wpt:verify-import` derives the support
closure from the test sources and rejects both a missing dependency and an
unexplained extra file.
The much larger official WPT checkout used to run them is a sparse, shallow
cache keyed by the WPT commit. Imported upstream files remain byte-for-byte
unchanged under `upstream/`; all instrumentation is generated in the ignored
`.cache/rxjs-wpt/` tree.

## Proving that RxJS ran

The pinned browser is required to expose its native `Observable`,
`Observable.prototype.subscribe`, and `EventTarget.prototype.when` in the
window, dedicated-worker, and same-origin iframe realms used by this suite.
Before each test realm runs upstream code, the generated bootstrap:

1. captures the native references and property descriptors;
2. verifies that the native slots can be replaced in the disposable test
   realm;
3. masks those slots and executes a synchronous bundle built directly from the
   current polyfill source;
4. records the installed constructor, `subscribe`, and `when` identities plus
   the bundle SHA-256; and
5. exposes a non-enumerable, test-only attestation function.

Every generated WPT URL receives exactly one named attestation subtest,
registered after the upstream source has established any `setup()` properties.
The
report auditor independently requires it to pass with the expected bundle hash
and exact installed identities, and requires those identities to differ from
the captured native ones. For the four iframe-using URLs, that one subtest waits
for all nine statically reviewed child-realm accesses and verifies every child
before it can pass. The auditor also rejects missing or duplicate test URLs,
missing worker or iframe instrumentation, different bundle identities,
restored native globals, and any expectation metadata that tries to allowlist
attestation.

The iframe access patterns in the pinned suite are reviewed in `config.json`.
Changing WPT to introduce another realm-creation pattern makes
`wpt:verify-import` fail until that pattern and its instrumentation are
reviewed.

## Commands

Run commands from the repository root:

| Command                                              | Purpose                                                                                                                                                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm run wpt:doctor`                                | Verify the vendored import, build and hash the test bundle, prepare the shadow tree, provision or verify the WPT Python environment, resolve the pinned runner/browser, and probe native exposure and replaceable descriptors. |
| `pnpm run wpt:verify-import`                         | Verify provenance hashes, dependency closure, generated URL inventory, and reviewed realm patterns without running a browser.                                                                                                  |
| `pnpm run test:wpt`                                  | Run every pinned URL and fail unless every upstream WPT test and subtest passes. This is the default conformance command.                                                                                                      |
| `pnpm run test:wpt:baseline`                         | Run the same attested suite but compare behavior with the checked-in known-failure baseline. This is a harness diagnostic, not conformance.                                                                                    |
| `pnpm run wpt:import -- --commit <40-character-sha>` | Deliberately replace the vendored subset from an exact WPT commit and regenerate provenance and the URL inventory.                                                                                                             |
| `pnpm run wpt:update-expectations`                   | Run three complete attested suites, require identical statuses, and regenerate expectation metadata and the result baseline.                                                                                                   |

The first browser run needs network access to populate the pinned browser and
sparse runner caches and to create the runner's Python environment. Later runs
reuse those exact artifacts. To prove a warm run is self-contained:

```sh
RXJS_WPT_OFFLINE=1 pnpm run test:wpt:baseline
```

`RXJS_WPT_OFFLINE=1 pnpm run test:wpt` runs strict conformance from the same
caches and is expected to pass for the pinned implementation and browser.
Offline mode fails immediately if a required cached artifact is absent. Useful
test-only overrides are listed below. Browser runs also disable Chrome
background networking, component updates, sync, metrics uploads, and pings;
WPT test traffic remains on the official runner's local servers.

| Variable                                             | Meaning                                                                                                               |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `RXJS_WPT_CACHE_DIR`                                 | Replace the default `.cache/rxjs-wpt` cache root.                                                                     |
| `RXJS_WPT_REPORTS_DIR`                               | Write run reports somewhere other than the cache's `reports/` directory.                                              |
| `RXJS_WPT_RUNNER_ROOT`                               | Use an existing WPT checkout, which must be at the pinned commit.                                                     |
| `RXJS_WPT_PYTHON_BINARY`                             | Select the Python interpreter used to create the version-keyed WPT environment.                                       |
| `RXJS_WPT_CHROME_BINARY` and `RXJS_WPT_CHROMEDRIVER` | Use an explicit matching browser pair; both must be set.                                                              |
| `RXJS_WPT_IMPORT_CHECKOUT`                           | Import from an existing WPT checkout instead of creating the temporary sparse checkout.                               |
| `RXJS_WPT_ALLOW_BROWSER_DRIFT=1`                     | Permit a non-pinned browser version for the scheduled advisory run. Do not use this for the blocking conformance job. |

## Reading results

Each run writes a timestamped directory under
`.cache/rxjs-wpt/reports/`. It contains:

- `wptreport.json`: the complete structured WPT report;
- `wpt.raw.log`: the raw log accepted by WPT's expectation updater;
- `wpt.log`: the human-readable runner log;
- `audit.json`: the machine-readable conformance/completeness result;
- `status-diff.txt`: the same readable status and failure summary printed in
  the terminal;
- `attestations.json`: the expected bundle identity recorded for every
  generated test URL.

The terminal always prints preparation and browser-execution progress, status
counts, attestation counts, every non-passing URL and subtest, and paths to the
structured report and full runner logs.

`pnpm run test:wpt` succeeds only when the official runner completes, every URL
runs exactly once, every identity attestation passes, the report is well
formed, and every upstream result passes. `pnpm run test:wpt:baseline` retains the
stable-result comparison for deliberate harness diagnostics. In baseline mode,
both an unexpected failure and an unexpected pass are mismatches. The current
baseline contains 52 `OK` URLs and 525 passing upstream subtests.

## Updating WPT

RxJS maintainers own the written-spec and WPT pins. A newer revision becomes
the project target only through an explicit reviewed change:

1. Import an exact 40-character WPT commit with `pnpm run wpt:import -- --commit
<sha>`.
2. Review every vendored-file, provenance, URL-inventory, dependency-closure,
   and realm-pattern change, plus the corresponding written Observable rules.
3. Run `pnpm run wpt:verify-import`.
4. Update the complete-result baseline without adding any failure, skip, or
   multi-status allowance.
5. Run `pnpm run test:wpt:baseline` and strict `pnpm run test:wpt`; both must
   report 52/52 URLs, 525/525 upstream subtests, and 52/52 exact RxJS
   attestations for the current pin, or the corresponding fully passing totals
   reviewed for the proposed pin.

If a proposed upstream revision or browser is nondeterministic or failing, it
does not become the pinned target. A scheduled run against newer Chrome is
advisory and does not silently change the vendored tests, written reference,
or all-pass requirement.

CI runs the strict pinned conformance command as a path-filtered blocking check
with fixed process concurrency and a fixed wall-clock timeout. A scheduled
advisory job uses the current stable Chrome for Testing with browser-version
drift enabled. Both jobs always upload the raw report, audit, logs, URL
inventory, and attestation identities.
