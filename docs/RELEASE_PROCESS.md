# RxJS 9 secure release process

## Basic steps

1. Ben merges an ordinary pull request into `master`.
2. After required `master` checks pass, automation creates or refreshes the generated release PR.
3. Ben reviews and self-merges that release PR. No approving review is required.
4. GitHub qualifies the candidate and stops without creating an npm stage.
5. Ben copies the qualification run ID, exact version, and `release-manifest.json` SHA-512 from the successful run summary into **Stage qualified RxJS 9 release**.
6. GitHub revalidates the run, current `master` commit, release PR, retained bytes, digest, age, and replay state, then creates npm stages.
7. Ben opens npm Staged Packages and approves all four packages with WebAuthn, approving `rxjs` last.
8. GitHub verifies registry integrity, npm signatures/provenance, and GitHub attestations before publishing the immutable GitHub Release.

Merging an ordinary PR automatically creates or refreshes the release PR. That automation is not a security problem: it changes only reviewable release metadata on an allowlisted branch. The later typed run/version/digest authorization exists so an accidental or compromised release-PR merge cannot immediately create publishable npm stages.

## Security considerations

- RxJS currently has one maintainer. The process requires no second reviewer, team, CODEOWNER approval, or environment reviewer.
- Pull requests provide a visible diff and mandatory automated checks; they do not imply independent human approval.
- Two separate human decisions exist: merge the generated release PR, then manually authorize its qualified digest for npm staging.
- npm publication is irreversible for RxJS. A pre-stage failure has no npm effect.
- The files tested twice are the exact tarballs staged. Any changed, missing, or additional byte invalidates the candidate.
- CI can call only `npm stage publish` through OIDC. It has no long-lived npm publishing token and cannot call direct `npm publish`.
- GitHub and npm both use WebAuthn security keys or passkeys. Recovery codes are stored offline.
- Compromise of both Ben's GitHub and npm authentication can still compromise a release.

## Automatic release PR

Ordinary pull requests use Conventional Commit titles because the squash title is the version-selection input. A successful merge to `master` runs the configured checks and causes the narrowly scoped release App to create or refresh `release/rxjs-9`. The generated PR contains the proposed version, channel, changelog, synchronized package versions, affected packages, and policy diff. It requests no reviewer.

During `9.0.0-beta.N`, fixes, features, and breaking changes increment only `beta.N`. Stable promotion is an explicit **Generate release PR** mode. After stable 9.x, fixes increment patch, features increment minor, and a breaking change blocks the 9.x train because SemVer requires 10.0.0. Documentation-only and internal chores do not produce a release.

## Read-only qualification

Self-merging the generated PR starts **Qualify RxJS 9 release**. Two separate fresh `ubuntu-24.04` jobs use Node 24.12.0 and pnpm 10.34.5, frozen installs, and no restored caches. They independently build and pack the four packages. Qualification fails unless filenames, inventories, contents, and SHA-512 values are byte-identical.

The canonical first build then passes every blocking Node, browser, Safari, Deno, Bun, Webpack, performance, package, and pinned Observable WPT gate. A scripts-disabled local installation of the exact tarballs produces a CycloneDX SBOM and release-only lockfile. A SHA-pinned OSV scan uses no monorepo exceptions. GitHub attests the exact tarballs.

The checked npm 11.18.0 CLI also runs `npm pack --dry-run`, `npm publish --dry-run`, and `npm stage publish --dry-run` over every exact tarball. It previews each trusted publisher with `npm trust github --allow-stage-publish --dry-run`, bound to `ReactiveX/rxjs`, `release-stage.yml`, and `npm-stage`, without granting direct-publish authority. These commands prove packaging, lifecycle, and trusted-configuration inputs without changing the registry. They do not prove npm OIDC or trusted-publisher authorization because dry-run does not submit a stage. The private staging of the first real beta is the live authorization proof; no public rehearsal package is created.

The retained 30-day artifact contains:

- `release-manifest.json`;
- `rxjs-<version>.intoto.jsonl`;
- `rxjs-<version>.cdx.json`;
- `rxjs-<version>.osv.json`;
- `rxjs-<version>.release-lock.json`;
- all exact npm tarballs.

Qualification creates no tag, GitHub Release, npm stage, or npm publication. Its summary prints the three values required for manual staging.

## Manual digest authorization and npm approval

Only GitHub login `benlesh` may dispatch `.github/workflows/release-stage.yml`, and it must be dispatched from protected `master`. The workflow rejects a wrong run ID, workflow, event, branch, actor, version, digest, source commit, current head, release PR, failed or older-than-30-day run, expired artifact, changed inventory/bytes, or replayed version.

Those checks first run in a job with no npm environment and no OIDC permission. Only after it succeeds can the separate `npm-stage` job start; that job rechecks current head, retained bytes, digest, release PR, and replay state before staging. npm trusted publishing must be bound to `ReactiveX/rxjs`, `.github/workflows/release-stage.yml`, protected `master`, and `npm-stage`, with stage-only authority. npm 11.18.0 is downloaded only after its checked-in registry SHA-512 matches.

Approve with WebAuthn in this order:

1. `@rxjs/observable-polyfill`
2. `@rxjs/test`
3. `@rxjs/migrate`
4. `rxjs` last

Automation downloads every private stage and compares its bytes before showing approval instructions. If staging is partial or any value differs, approve nothing: reject every stage and qualify a fresh version. Staging attempts cannot be replayed because creation of the protected version tag and draft release precedes npm staging.

## Final verification

The finalizer has no npm credentials or publishing authority. It waits for all four public packages, compares each registry integrity to the manifest, verifies `npm audit signatures`, and verifies GitHub attestations for every tarball. Only then does it publish the draft GitHub Release.

## One-time setup before beta

1. Protect `master`: require pull requests with zero approvals, require CI, CodeQL, dependency review, OSV, workflow validation, release coherence, WPT, and release readiness; require verified squash commits; prevent force-push and deletion.
2. Configure the release App with only checks read plus contents and pull-request write access. Store `RELEASE_APP_ID`, `RELEASE_APP_PRIVATE_KEY`, and `RELEASE_REQUIRED_CHECKS` as the repository-defined JSON array of exact master check names. Pull-request-only dependency review and Conventional Commit checks belong in branch protection, not this master wait list.
3. Restrict `release/rxjs-9` updates to the release App's guarded force-with-lease refresh.
4. Restrict the `npm-stage` environment to protected `master` with no reviewer and no secret.
5. Configure all four npm trusted publishers for the stage workflow and environment. Require WebAuthn and disallow publish-capable tokens; delete any reusable publication credential.
6. Verify the authenticated npm Staged Packages URL and store it as `NPM_STAGED_PACKAGES_URL`.
7. Protect `refs/tags/9.*` from update, deletion, and force-push; allow only the staging workflow to create a tag. Enable GitHub Release immutability.
8. Run the release doctor and the complete local/CI dry-run ladder. Use private staging of `9.0.0-beta.0` as the first live OIDC proof, download and compare every stage, and pause before WebAuthn approval. A partial or mismatched stage is rejected in full and requires a freshly qualified version.

The repository cannot configure GitHub/npm account WebAuthn, rulesets, environments, or trusted publishers from source code. P6.10 remains active until those controls and the first real private stage are verified. Nothing becomes publicly installable until Ben separately approves the matching stages with WebAuthn.

Last reviewed: 2026-08-02.
