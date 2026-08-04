# RxJS 9 beta.0 approval

## Decision

The repository evidence approves `rxjs@9.0.0-beta.0` and the synchronized
four-package train to begin the RxJS 9 public beta under npm's `next` tag, once
the configured blocking CI jobs are green. RxJS 7 remains npm's `latest` line
and remains maintained.

This approval does not publish a package, create a GitHub release, promote RxJS
9 to `latest`, or approve the stable `9.0.0` release. Stable promotion requires
public beta feedback and a separate explicit decision. The version number is 9
because the paused RxJS 8 effort predates this platform-based generation; RxJS
8 was not silently shipped or erased.

## Adoption evidence

The exact four package artifacts were packed and audited locally. An isolated,
offline consumer installed the `rxjs`, `@rxjs/observable-polyfill`, and
`@rxjs/test` tarballs and passed:

- ESM imports and runtime behavior;
- Node 22.13, 24.12, and advisory 26.5 `require(esm)` behavior;
- strict public TypeScript declarations;
- `@rxjs/test` virtual-time behavior;
- a minified browser bundle using only the packed ESM files.

The browser bundle was 20,222 bytes. Packed artifact sizes were:

| Package                     | Tarball bytes |  Budget |
| --------------------------- | ------------: | ------: |
| `rxjs`                      |       183,920 | 250,000 |
| `@rxjs/observable-polyfill` |        23,375 |  30,000 |
| `@rxjs/test`                |        47,270 |  60,000 |
| `@rxjs/migrate`             |       112,638 | 140,000 |

The audit found no source specs, CommonJS/browser/Webpack dialect copies, or
missing package documentation. The Nx first-release version dry run resolves
the complete train to `9.0.0-beta.0`.

## Broader qualification

- Focused product suites pass 51 polyfill, 750 RxJS, 75 test-harness, and 166
  migration tests.
- Pinned Observable WPT passes all 52 URLs, 525 upstream subtests, and 52 exact
  implementation-identity attestations.
- Current Chromium, Firefox, and WebKit pass the shared eight-case lifecycle
  and Symbol contract. Desktop and Mobile Safari are separate blocking
  SafariDriver jobs; Mobile Safari requires an actual iOS simulator.
- Node, Deno, Bun, Webpack, bundle-size, and performance evidence passes the
  checked-in gates described in [RELEASE_GATES.md](RELEASE_GATES.md).
- The representative migration program has three completed RxJS 7 migrations
  and one correct safe stop across Vitest, Mocha, Jest, application/library,
  cold, platform-shared, mixed, and unsupported contracts.

## Known non-blockers

The complete source-pinned RxJS 7 corpus retains 39 cold and 22 fallback
failures. Every one is a reviewed platform-lifecycle divergence or unsupported
arbitrary-subscribable compatibility case. They are executable migration
evidence, not hidden failures and not a promise of an RxJS 7 compatibility
runtime.

Local branded Safari execution was not forced by changing a persistent host
security setting. The clean-runner Safari and iOS simulator jobs are blocking
conditions of publication, not waived evidence.

## Publication boundary

The [release process](https://github.com/ReactiveX/rxjs/blob/master/docs/RELEASE_PROCESS.md)
requires a clean, synchronized `master` checkout and one interactive
`pnpm release:beta 9.0.0-beta.0` command. It checks version identity,
package-local documentation, ESM-only exports, package gates, and npm dry runs;
prints the exact tarball integrities; and then uses npm's OTP/WebAuthn flow for
each public package. The supporting packages publish first and `rxjs` publishes
last. No CI credential or documentation application is part of publication.
