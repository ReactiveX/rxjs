# RxJS 9 release gates

This document describes the executable environment and package gates for the
RxJS 9 prerelease line. It is package documentation; it does not depend on the
repository documentation application.

The repository's [release runbook](https://github.com/ReactiveX/rxjs/blob/master/docs/RELEASE_PROCESS.md)
defines the clean-checkout requirement, interactive npm publication order,
integrity verification, and failure recovery. CI qualifies the source; only a
maintainer running the local release command can authorize publication.

## Runtime matrix

| Environment                | Release role         | Executable evidence                                                         |
| -------------------------- | -------------------- | --------------------------------------------------------------------------- |
| Node 22.13.0+              | Blocking             | Package build, types, ESM import, Node `require(esm)`, and runtime contract |
| Node 24                    | Blocking             | Full package and release gates, plus pinned Observable WPT                  |
| Node 26                    | Advisory during beta | The same package and runtime gates with a non-blocking CI result            |
| Current Chrome and Firefox | Blocking             | Eight-case browser lifecycle and Symbol-extension contract                  |
| Current desktop Safari     | Blocking             | The same contract through Apple SafariDriver                                |
| Current Mobile Safari      | Blocking             | The same contract in an actual iOS simulator through Apple SafariDriver     |
| Current Playwright WebKit  | Additional signal    | The same contract, reported as WebKit rather than branded Safari            |
| Deno 2.8.0                 | Blocking             | Package-built runtime contract                                              |
| Bun 1.3.14                 | Blocking             | Package-built runtime contract                                              |
| Webpack 5.106.2            | Blocking             | ESM resolution, production execution, and output-size budget                |

The release-coherence checker pins the concrete Deno, Bun, Webpack, browser,
Node, and Safari CI lanes. Updating a current-runtime version is therefore a
reviewed release change rather than silent drift.

## CI ownership

| Workflow          | Pull requests                                             | `master` pushes                                    |
| ----------------- | --------------------------------------------------------- | -------------------------------------------------- |
| Main CI           | Package matrix plus exact migration evidence and tooling  | Same blocking gates on every push                  |
| TypeScript latest | RxJS compilation against the latest TypeScript            | Same compatibility signal on every push            |
| Observable WPT    | Blocking when platform, package, or harness paths change  | Blocking pinned conformance on every push          |
| Release readiness | Blocking when release packages, scripts, or config change | Complete blocking environment matrix on every push |

Main CI executes all 2,338 source-pinned RxJS 7 evidence cases in cold and
polyfill modes and requires exact equality with the reviewed 2,299/39 and
2,316/22 pass/failure case-ID sets. The raw audit commands still report the
intentional divergences as ordinary failures; the CI verifier blocks any added
failure, unexpected pass, incomplete collection, or identity drift until the
evidence is reviewed. Main CI also owns generated evidence freshness,
bundle-analysis tests, SafariDriver unit tests, and active-workflow validation.
Release coherence rejects removal of required commands, lanes, or `master`
triggers.

## Distribution contract

Every supported consumer receives the same `dist/esm` JavaScript. Browser,
Webpack, ESM `import`, and Node `require(esm)` export conditions do not select
target-specific copies. Deno and Bun support adds test infrastructure only; it
does not add runtime code, dependencies, export conditions, or bundle bytes.

There is no CommonJS artifact. `require('rxjs')` is supported only through the
Node 22.13+ `require(esm)` bridge and returns the same module identity and exact
Symbols as ESM import.

## Budgets

The checked-in budgets in `test/release/budgets.json` are blocking:

- the representative minified Webpack bundle must not exceed 22,000 bytes;
- the median map pipeline must process at least 5,000,000 values per second;
- the median subscribe-and-abort loop must complete at least 30,000
  cancellations per second.
- packed tarballs must stay under 250,000 bytes for `rxjs`, 30,000 bytes for
  the polyfill, 60,000 bytes for `@rxjs/test`, and 140,000 bytes for
  `@rxjs/migrate`.

The initial Node 24 evidence was 17,502 Webpack bytes, approximately 50.4
million mapped values per second, and approximately 140,500 cancellations per
second. The throughput floors deliberately leave substantial runner headroom;
the bundle ceiling leaves roughly 25% growth headroom while still catching a
duplicate dialect or large accidental dependency.

The packed-adoption gate installs the local tarballs into an isolated consumer
with no registry access, then runs ESM, Node `require(esm)`, TypeScript, marble
testing, and a browser bundle. It also rejects source specs, duplicate output
dialects, missing package documentation, and tarball-size regressions.

## Commands

From the repository root:

```sh
pnpm run release:check
pnpm --filter rxjs run test:unit:audit:check
pnpm run test:bundle-analysis
pnpm run test:release:safari
pnpm run test:workflows
pnpm run test:release:runtime
pnpm run test:release:browsers
pnpm run test:release:safari
pnpm run test:release:webpack
pnpm run test:release:performance
pnpm run test:release:adoption
pnpm run test:wpt
```

Desktop and Mobile Safari execution is CI-owned because SafariDriver requires
host-level automation authorization. The Mobile Safari lane requests
`platformName: iOS` and `safari:useSimulator: true`; Playwright WebKit is never
substituted for that branded-browser gate.

The complete source-pinned RxJS 7 migration corpus is evidence, not a claim
that RxJS 9 implements every RxJS 7 behavior. Its reviewed intentional
divergences remain nonzero by design; the focused source suite, package gates,
runtime matrix, and conformance suite are the blocking release checks.
