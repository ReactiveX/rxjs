---
name: rxjs-verdaccio-publish
description: >-
  Run the standard RxJS release (version bump, changelog, GitHub release) and
  publish packages. Set NPM_CONFIG_REGISTRY for a local Verdaccio instance;
  omit it for npmjs via CI. Use when releasing, publishing packages, Verdaccio,
  or cutting a stable version.
---

# RxJS Package Publish

Same flow as upstream: **`yarn release`** bumps versions, writes changelogs, and creates a **GitHub release**. Publishing is a separate step — CI handles npmjs.org; a local registry is selected only via `NPM_CONFIG_REGISTRY`.

**Current focus: stable releases** (`latest` dist-tag, non-prerelease semver).

## Agent workflow

**You run each step.** Do not hand the user a command checklist.

### 1. Prerequisites

- `GH_TOKEN` or `GITHUB_TOKEN` with `repo` scope (required for a real release)
- Clean working tree on the release branch
- For a fork: pass `--gitRemote=origin` (defaults to upstream `ReactiveX/rxjs`)

### 2. Local Verdaccio (optional)

If publishing to a local registry instead of waiting for CI/npmjs:

```sh
npx verdaccio@6 --config verdaccio.yaml
```

Config: [`verdaccio.yaml`](../../../verdaccio.yaml). Default URL: `http://localhost:4873`.

First-time auth:

```sh
npm login --registry http://localhost:4873
```

### 3. Release + publish

From repo root (request **network** permission):

```sh
export GH_TOKEN=…                          # or GITHUB_TOKEN
export NPM_CONFIG_REGISTRY=http://localhost:4873   # omit for npmjs-only (CI publishes)
export NPM_CONFIG_TAG=latest               # stable; required when NPM_CONFIG_REGISTRY is set

yarn release --dryRun=false --gitRemote=origin
```

[`scripts/release.js`](../../../scripts/release.js) runs `prepare-packages`, bumps versions, creates the GitHub release, then — when `NPM_CONFIG_REGISTRY` is set — calls [`scripts/publish.js`](../../../scripts/publish.js) to push tarballs to that registry.

For an explicit stable version instead of conventional-commits inference:

```sh
yarn release --dryRun=false --gitRemote=origin --version 8.0.0
```

Dry-run first when unsure:

```sh
yarn release --dryRun=true --gitRemote=origin
```

### 4. npmjs.org (no local registry)

Omit `NPM_CONFIG_REGISTRY`. After `yarn release --dryRun=false`, the GitHub release triggers [`.github/workflows/publish.yml`](../../../.github/workflows/publish.yml), which runs `publish.js` against `https://registry.npmjs.org` with the `latest` tag for stable semver.

### 5. Verify (optional)

```sh
npm install rxjs@latest --registry=$NPM_CONFIG_REGISTRY
node -e "require('rxjs').of(1).subscribe(console.log)"
```

## Environment

| Variable                    | Purpose                                                               |
| --------------------------- | --------------------------------------------------------------------- |
| `GH_TOKEN` / `GITHUB_TOKEN` | GitHub API access for release creation                                |
| `NPM_CONFIG_REGISTRY`       | Target registry (e.g. `http://localhost:4873`); omit for npmjs via CI |
| `NPM_CONFIG_TAG`            | Dist-tag for local registry publishes — use `latest` for stable       |

CI derives the tag from the GitHub release semver (`latest` for stable, `next` for prerelease).

## Do not

- Skip `yarn release` and publish ad hoc (that bypasses version bump, changelog, and GitHub release)
- Commit `.verdaccio/` or `.npmrc.local`

## Reference

- Release: [`scripts/release.js`](../../../scripts/release.js)
- Publish: [`scripts/publish.js`](../../../scripts/publish.js)
- CI: [`.github/workflows/publish.yml`](../../../.github/workflows/publish.yml)
