# RxJS 9 secure release process

## Basic steps

1. Merge an ordinary PR into `master`.
2. Wait for all required `master` checks.
3. Review the automatically generated release PR.
4. Merge the release PR to authorize qualification.
5. Wait while GitHub builds, tests, attests, and stages the exact packages.
6. Open the linked npm Staged Packages page.
7. Approve all four packages with TFA, approving `rxjs` last.
8. GitHub creates the immutable release after all packages are available.

## Security considerations

- npm publication is irreversible for RxJS.
- Everything must be verified before npm approval.
- The files tested are the exact tarballs sent to npm staging.
- Any byte change invalidates the candidate.
- CI may stage but cannot publish directly.
- No long-lived npm publishing token exists.
- TFA approval is required for every package.
- The four-package train is not atomic; supporting packages are approved before `rxjs`.
- Post-publication checks perform bookkeeping only and are not safety gates.
- Release workflows run only from trusted, merged commits on GitHub-hosted runners.
- Workflow changes, package manifests, release scripts, and tag rules are protected.

## Normal release flow

Ordinary PRs use a validated Conventional Commit title because the squash-merge
title becomes the version-selection input. After the required checks pass on
the exact `master` commit, a narrowly scoped organization-owned GitHub App
creates or refreshes one release PR and requests review from the configured
release maintainer. A new releasable merge regenerates that PR; branch rules
must dismiss its prior approval.

The release PR shows the proposed version and npm channel, selection reason,
categorized changelog, synchronized versions for all four packages, commit
range, affected packages, irreversible-publication warning, and a prominent
**Open npm Staged Packages** link. Merging it is the GitHub-side “release this
version” action. It does not publish anything.

The trusted workflow uses a fresh GitHub-hosted runner and frozen lockfile with
no restored dependency or build cache. It builds and packs once, records the
source commit, contents, sizes, and SHA-512 digests, creates GitHub artifact
attestations, and passes the same tarballs through all blocking runtime,
browser, bundler, package, and conformance gates. Only then does it create the
protected version tag and send those `.tgz` files by filename to npm staging
through stage-only OIDC. Staging cannot rebuild, repack, rewrite versions, or
add files. Automation downloads every private npm stage and requires its
SHA-512 to match the qualified and GitHub-attested tarball before presenting
approval instructions.

After staging, automation comments on the merged release PR with one prominent
npm Staged Packages link, a supported direct stage link when npm returns one,
and each package's version, dist-tag, stage ID, approved digest, required order,
and exact `npm stage approve <stage-id>` fallback. Displayed npm links must use
the exact `https://www.npmjs.com/` origin. Automation never guesses an
undocumented route.

Approve in this order, checking every value before each TFA prompt:

1. `@rxjs/observable-polyfill`
2. `@rxjs/test`
3. `@rxjs/migrate`
4. `rxjs` last

The finalizer has no npm credentials or authority. It waits until all four
public registry integrities match the qualified manifest, then publishes the
draft GitHub Release. Release immutability locks its tag and assets. A future
documentation deployment may consume that completed release event, but gets no
npm authority and is not a publication gate.

## Version-selection scenarios

### Changes during `9.0.0-beta.N`

- **Release maintainer does:** Merge the ordinary PR, merge the generated release PR, open the supplied npm link, and approve four stages.
- **Release maintainer sees:** `9.0.0-beta.N+1`, channel `next`, with fixes, features, and breaking changes categorized separately.
- **GitHub automation does:** Increments only the beta counter, generates changelogs, qualifies exact tarballs, and stages them.
- **npm does:** Keeps every package private until TFA approval.

Stable promotion is explicit. Run **Generate release PR**, choose **Change
release mode → Promote stable**, and review the regenerated release PR. It
changes the next beta to `9.0.0` on `latest`; an ordinary merge cannot promote
stable accidentally.

### A fix merges after stable 9.x

- **Release maintainer does:** Merge the fix PR, merge the generated patch-release PR, and approve the linked npm stages.
- **Release maintainer sees:** `9.0.N+1`, channel `latest`, the patch changelog, qualified hashes, and qualification results.
- **GitHub automation does:** Classifies `fix`, `perf`, and `revert` as patch changes and versions all packages together.
- **npm does:** Leaves `rxjs@latest` unchanged until `rxjs` is approved last.

### A feature merges after stable 9.x

- **Release maintainer does:** Follow the release-PR and npm TFA flow.
- **Release maintainer sees:** `9.N+1.0`, channel `latest`, containing the feature and accumulated fixes.
- **GitHub automation does:** Uses the highest accumulated change level, so a feature plus fixes produces a minor release.
- **npm does:** Holds all packages in staging until their individual approvals.

### A breaking change merges during beta

- **Release maintainer does:** Follow the ordinary beta flow.
- **Release maintainer sees:** The next beta with a prominent breaking-change section.
- **GitHub automation does:** Increments `beta.N` without changing the `9.0.0` core.
- **npm does:** Publishes only after TFA approval.

### A breaking change merges after stable `9.0.0`

- **Release maintainer does:** Revert or redesign the change, or explicitly establish an RxJS 10 workstream.
- **Release maintainer sees:** A blocked release report explaining that SemVer requires `10.0.0`; no release Merge button is available.
- **GitHub automation does:** Refuses to generate or stage a 9.x release and closes any stale 9.x release PR.
- **npm does:** Nothing.

Documentation-only and internal chore commits do not trigger releases. For
accumulated stable changes, `breaking > feature > fix` determines the result.

## One-time administrator setup

Complete and rehearse these controls before `9.0.0-beta.0`:

1. Create the `@ReactiveX/release-maintainers` team and verify `.github/CODEOWNERS` resolves to it.
2. Create an organization-owned GitHub App with only repository contents and pull-request write access plus checks read access. Store `RELEASE_APP_ID` and `RELEASE_APP_PRIVATE_KEY`.
3. Set `RELEASE_MAINTAINER_LOGIN` and comma-separated `RELEASE_REQUIRED_CHECKS` repository variables. Require those checks, require squash merges, and dismiss stale approvals.
4. Sign in to npm, manually open and verify the authenticated Staged Packages application, then store that exact URL in `NPM_STAGED_PACKAGES_URL`. Do not infer it from this document.
5. Configure each package's trusted publisher for `.github/workflows/release-stage.yml`, allowing only `npm stage publish`. Require TFA and disallow tokens for publishing access.
6. Delete `NPM_TOKEN` and every granular token able to bypass TFA or publish these packages.
7. Create an `npm-stage` GitHub environment restricted to protected `master`. It contains no npm secret.
8. Protect `master`, `CODEOWNERS`, workflows, actions, release scripts, manifests, lockfile, and changelog through code-owner review and required checks. Protect `release/rxjs-9` so only the release App can update it; the App uses guarded force-with-lease updates to refresh the one open release PR.
9. Add an active tag ruleset for `refs/tags/9.*` restricting creation, update, deletion, and force-push. Allow the GitHub Actions App to bypass it only because protected release code is the sole workflow with tag-write authority. Store its numeric ID in `RELEASE_TAG_RULESET_ID` so the doctor can inspect it.
10. Enable GitHub Release immutability. A draft remains mutable evidence; the finalizer publishes it only after registry integrities match.
11. Complete the disposable-package rehearsal and run **Release doctor** manually.

The read-only release doctor checks action pins, workflow structure, absence of
direct `npm publish` and token references, channel policy, package identities,
configured required checks, active RxJS 9 tag rules, the exact npm-link origin,
and runbook freshness. If npm changes the route, the doctor fails while release
comments still provide stage IDs and CLI commands.

## Rehearsal and failure handling

Use an existing disposable package because npm cannot stage a brand-new
package. Rehearse stage-only OIDC, exact-tarball submission, TFA approval and
rejection, link generation, attestations, protected tags, partial staging, and
finalization. Confirm the staged download digest equals both the qualified
manifest and GitHub-attested digest.

A pre-stage failure has no npm effect. If staging fails, stop and reject every
stage created by that run with TFA. The receipt and release-PR comment identify
partial state. Never resume with altered files: reject, create a fresh version,
and repeat full qualification. Approve `rxjs` last because partial publication
cannot be rolled back.

Before the first beta, confirm with npm that all four packages can use staged
publishing under RxJS's package status. If a new package is ineligible, use a
one-time bootstrap:

1. Download the CI-qualified candidate bundle.
2. Verify GitHub attestations and every SHA-512 in `release-manifest.json`.
3. Publish each existing `.tgz` by filename without building, versioning, or packing.
4. Complete npm TFA for every package, publishing `rxjs` last.
5. Configure all four stage-only trusted publishers and rerun the doctor.

The reviewed one-time command implements those steps without rebuilding or
packing. Run it only from a clean maintainer machine after replacing `<run-id>`
with the trusted qualification run:

```sh
node scripts/release/bootstrap-release.mjs --run-id <run-id> --acknowledge-irreversible-bootstrap
```

It downloads the candidate, verifies every manifest hash and GitHub
attestation, refuses npm token environment variables, and invokes interactive
TFA publication in the required order. It is not called by any workflow.

## Succession and maintenance

This public runbook contains every non-secret operational step and uses role
names. The private designated-successor packet must contain no passwords,
private keys, TFA seeds, recovery codes, or tokens. Keep it in the approved
private records system using
`docs/release/PRIVATE_SUCCESSION_PACKET.template.md`. It records organization
and package inventories, vendor contact paths, proof locations, and transfer
instructions using the successor's own accounts and TFA. Configure an annual
private reminder there; do not create a public repository issue.

OpenSSF Scorecard, CodeQL, dependency review, and the monthly release doctor
remain continuous controls. Dependabot proposes reviewed updates to SHA-pinned
actions. Annually, repeat the staging rehearsal, review checks and owners,
verify the npm URL manually, validate action pins and runtime versions, and
update this runbook and private packet together.

Last reviewed: 2026-08-02.
