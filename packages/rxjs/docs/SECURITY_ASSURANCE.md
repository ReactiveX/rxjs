# RxJS 9 security assurance

RxJS 9 uses a deliberately small release boundary. This document describes
the evidence and trust assumptions; it does not promise that the software is
free of vulnerabilities.

## What users can rely on

- The `rxjs` runtime depends only on the RxJS-owned
  `@rxjs/observable-polyfill`; that package has no runtime dependencies.
- Pull requests and every `master` push run the package, type, browser, Safari,
  Web Platform Test, bundler, performance, migration, dependency-review,
  CodeQL, and OSV checks described in [RELEASE_GATES.md](RELEASE_GATES.md).
- npm publication is not available to GitHub Actions. The repository stores no
  npm publishing token and has no publishing workflow, trusted publisher, or
  release App.
- A maintainer publishes from a clean local `master` checkout with
  `pnpm release:beta <version>`. The command builds and tests, packs the four
  packages, prints SHA-512 integrities, and runs npm publication dry runs before
  asking for irreversible confirmation.
- npm's interactive OTP/WebAuthn flow authorizes each package. Supporting
  packages publish first and `rxjs` publishes last.
- The command verifies npm's registry integrity and `next` tag for all four
  packages and confirms that `rxjs@latest` remains on RxJS 7.
- An interrupted command can skip an already-published package only when the
  registry integrity equals the freshly packed tarball.

## One-maintainer reality

RxJS currently has one active maintainer. The same person authors, reviews,
merges, and releases changes. Pull requests expose diffs and run mandatory
checks, but RxJS does not claim independent human approval. OpenSSF's
Code-Review score is therefore accepted rather than manipulated with
ceremonial approvals.

The publication boundary trusts that maintainer's local machine and npm
authentication. Interactive WebAuthn, required CI, dry runs, ordered
publication, and registry verification reduce common mistakes and credential
risks; they do not remove the risk of a compromised maintainer machine or npm
account. Recovery codes are kept offline. Package publishing access requires
two-factor authentication and disallows automation tokens after each new
package record exists.

## Verify a release

After installing with a lockfile, verify npm registry signatures:

```sh
npm audit signatures
```

Inspect the registry integrity and channels directly:

```sh
npm view rxjs@9.0.0-beta.0 dist.integrity
npm view rxjs@next version
npm view rxjs@latest version
```

The release operator records all four integrity values and the immutable GitHub
Release URL in the project-plan session log.

## Vulnerability evidence

OSV scanning runs on pull requests, every `master` push, and weekly. Anything
reachable from runtime, build, or test tooling must be fixed or removed. The
inherited legacy documentation-application toolchain is excluded from RxJS 9
and tracked separately; its time-bounded exceptions do not change the release
package scans.

Property-based tests exercise the Observable lifecycle state machine. Package
and release-script tests cover synchronized versions, clean-checkout guards,
interactive credential restrictions, publication order, npm channels, and
integrity comparisons.

## What this does not prove

Passing tests does not prove that source is bug-free. A matching registry hash
proves that npm received the local tarball; it does not prove that the local
machine or maintainer account was uncompromised. The initial manual publication
does not provide npm's CI provenance attestation. These are accepted tradeoffs
for an understandable sole-maintainer process.

## OpenSSF in context

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/ReactiveX/rxjs/badge)](https://scorecard.dev/viewer/?uri=github.com/ReactiveX/rxjs)

OpenSSF Scorecard is a useful repository-hygiene signal, not a release gate or
the project's primary security claim. Users assessing a specific RxJS 9
version should prefer required-CI history, registry signatures, exact package
integrity, and the tagged source commit.
