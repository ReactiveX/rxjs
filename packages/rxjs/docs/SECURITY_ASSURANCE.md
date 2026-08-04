# RxJS 9 security assurance

RxJS 9 releases are designed to be hardened, transparent, and independently verifiable. This is evidence about the release process, not a promise that the software contains no vulnerability.

## What users can rely on

- The `rxjs` runtime depends only on the RxJS-owned `@rxjs/observable-polyfill`; that package has no runtime dependencies. The core runtime chain therefore contains no third-party package.
- A candidate is built twice in separate fresh Ubuntu 24.04 jobs with Node 24.12.0 and pnpm 10.34.5, frozen installs, and no restored caches. Filenames, inventories, contents, and SHA-512 values must match.
- The exact tarballs that pass package, runtime, browser, Safari, Web Platform Test, bundler, and performance gates are the files sent to npm staging.
- Before registry access, the checked npm CLI runs pack, publish, and staged-publish dry runs over every exact tarball. Dry-run proves packaging behavior, not OIDC authorization; private staging of the first real beta supplies that live proof without creating a public test package.
- Every release includes `release-manifest.json`, a CycloneDX SBOM, an OSV report for the isolated release train, a GitHub attestation bundle, and the exact npm tarballs.
- npm staging uses trusted publishing bound to `ReactiveX/rxjs`, `.github/workflows/release-stage.yml`, the protected `master` branch, and the `npm-stage` environment. CI has no reusable npm publication token and cannot call direct `npm publish`.
- Staged packages require a separate npm WebAuthn approval. `rxjs` is approved last.
- The final GitHub Release is published only after npm registry integrity, npm signatures/provenance, and GitHub attestations verify.

## One-maintainer reality

RxJS currently has one active maintainer. The same person authors, reviews, merges, and releases changes. Pull requests remain useful because they expose diffs and run mandatory checks, but RxJS does not claim independent human approval. OpenSSF's Code-Review score is therefore accepted rather than manipulated with ceremonial approvals.

The primary defenses are automation, deterministic evidence, narrow short-lived authority, two separate manual decisions, and phishing-resistant authentication on both GitHub and npm. Compromise of both the maintainer's GitHub and npm authentication can still compromise a release. Recovery codes are kept offline; publish-capable reusable npm tokens are prohibited.

## Verify a release

Download the version's assets from the [GitHub Releases page](https://github.com/ReactiveX/rxjs/releases), then run:

```sh
# Verify GitHub's attestation for an exact downloaded tarball.
gh attestation verify ./rxjs-9.0.0-beta.0.tgz --repo ReactiveX/rxjs

# After installing with a lockfile, verify npm registry signatures/provenance.
npm audit signatures

# Compare npm's registry integrity with the package entry in release-manifest.json.
npm view rxjs@9.0.0-beta.0 dist.integrity
```

The manifest uses hexadecimal SHA-512 for files and npm-compatible base64 integrity for registry comparison. Verify the version and source commit as well as the digest; a correct hash for the wrong release is not sufficient.

## Vulnerability evidence

OSV scanning runs on pull requests, every `master` push, weekly, and against each isolated release train. Anything reachable from runtime, build, test, qualification, or publication must be fixed or removed. The inherited legacy documentation-application toolchain is excluded from RxJS 9 and tracked separately; its time-bounded exceptions never apply to the release-train scan.

Property-based tests exercise release version selection, manifest and staging authorization, npm URL parsing, byte integrity, and Observable subscribe/abort/terminal/teardown/ref-count/restart sequences. Failures report a replay seed.

## What this does not prove

Reproducibility shows that two controlled builds produced the same bytes; it does not prove the source is bug-free or that both builders were uncompromised. Provenance identifies the GitHub workflow and source commit; it does not certify the maintainer's intent. An SBOM and clean scanner result cover known data in the selected databases, not unknown vulnerabilities. No control removes the residual risk of a fully compromised sole-maintainer account.

## OpenSSF in context

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/ReactiveX/rxjs/badge)](https://scorecard.dev/viewer/?uri=github.com/ReactiveX/rxjs)

OpenSSF Scorecard is a useful repository-hygiene signal, but its aggregate is not an RxJS release gate and is not the project's primary security claim. In particular, Code-Review `0` truthfully reflects the lack of an independent reviewer. Users assessing a specific RxJS 9 version should prefer the release manifest, exact tarball hashes, provenance, SBOM, vulnerability report, and registry verification above.
