# RxJS 9 beta release process

RxJS 9 beta releases are intentionally manual. Ben publishes from a clean,
up-to-date `master` checkout with npm's interactive OTP/WebAuthn authentication.
GitHub Actions qualifies changes, but no workflow, GitHub App, environment,
trusted publisher, or repository secret can publish an npm package.

## Before publishing

1. Confirm all required `master` checks are green for the commit being released.
2. Confirm the four package manifests, their runtime version constants, and the
   migration Skill metadata already contain the exact beta version.
3. Confirm npm two-factor authentication works and recovery codes are stored
   offline. Do not create an npm automation token for this process.
4. Check out `master`, fetch its remote, update it without a merge commit, and
   leave the working tree completely clean.

The command refuses live publication from another branch, a dirty or divergent
checkout, CI, a non-interactive terminal, or an environment containing
`NPM_TOKEN` or `NODE_AUTH_TOKEN`.

## Rehearse without publishing

Run the complete local build, package gates, tarball creation, and npm dry runs:

```sh
pnpm release:beta 9.0.0-beta.0 --dry-run
```

The rehearsal may run from a clean review branch. It creates temporary
tarballs, prints npm's package inventories, and deletes the temporary files
when it finishes. It does not contact npm with a publication request.

## Publish

From the clean, synchronized `master` checkout, run:

```sh
pnpm release:beta 9.0.0-beta.0
```

The command performs these steps in order:

1. validates the exact `9.0.0-beta.N` argument and synchronized package metadata;
2. runs `pnpm run release:check` and every release package's `test:package` gate;
3. packs all four packages into a temporary directory;
4. prints each tarball's byte count and SHA-512 integrity;
5. runs `npm publish --dry-run --tag next --access public` for every tarball;
6. asks Ben to type the exact version as the irreversible confirmation;
7. publishes with npm's interactive authentication in this order:
   `@rxjs/observable-polyfill`, `@rxjs/test`, `@rxjs/migrate`, and `rxjs` last;
8. compares each registry integrity with the local tarball;
9. verifies every package's `next` tag and confirms `rxjs@latest` remains RxJS 7.

npm may request OTP/WebAuthn once per package. That repetition is deliberate:
the four packages are independent registry publications. Nothing attempts to
bypass npm's proof-of-presence requirement.

## Failure recovery

npm versions are immutable. Never rebuild and reuse a version after npm accepts
different bytes.

The command is safe to rerun after a network failure or interrupted OTP prompt.
Before each publish it checks whether that exact package version already exists.
It skips the package only when the registry's SHA-512 integrity equals the
freshly packed tarball; a mismatch stops the release. Because `rxjs` is last,
the main consumer entry remains unpublished until the three supporting packages
are present and verified.

If a package was published correctly but a later package cannot be published,
fix only the operational problem and rerun the same command from the same clean
commit. If any source or package byte must change, bump to a fresh beta version.

## After publishing

1. Confirm the four public package pages show the expected version under `next`.
2. Confirm `npm view rxjs@latest version` still reports the maintained RxJS 7 line.
3. Create the immutable GitHub tag and release for the verified source commit.
4. Record the release URL and four npm integrity values in the project-plan
   session log.

For the three new scoped packages, immediately select **Require two-factor
authentication and disallow tokens** in each npm package's publishing-access
settings after its first publication. The existing `rxjs` package should use
the same setting. No npm publishing credential belongs in GitHub Actions.

Stable `9.0.0` and moving RxJS 9 to npm's `latest` tag require a separate
decision and are not supported by `release:beta`.

Last reviewed: 2026-08-04.
